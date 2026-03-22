import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createAdminClient } from '@/lib/supabase/admin'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createAdminClient()

    if (body.type === 'payment') {
      const paymentId = body.data?.id
      if (!paymentId) return NextResponse.json({ ok: true })

      const payment = new Payment(client)
      const mpPayment = await payment.get({ id: paymentId })

      const userId = mpPayment.external_reference
      const status = mpPayment.status // approved, rejected, pending

      // Atualizar pagamento no banco
      await supabase
        .from('payments')
        .update({
          mp_payment_id: String(paymentId),
          status: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending',
          paid_at: status === 'approved' ? new Date().toISOString() : null,
        })
        .eq('user_id', userId)
        .eq('status', 'pending')

      // Se aprovado, ativar assinatura por 30 dias
      if (status === 'approved' && userId) {
        const now = new Date()
        const periodEnd = new Date(now)
        periodEnd.setDate(periodEnd.getDate() + 30)

        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            mp_payment_id: String(paymentId),
          })
          .eq('user_id', userId)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
