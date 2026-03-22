import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createAdminClient } from '@/lib/supabase/admin'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function POST(req: NextRequest) {
  try {
    const { userId, email, method } = await req.json()
    if (!userId || !email) {
      return NextResponse.json({ error: 'userId e email são obrigatórios' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const preference = new Preference(client)
    const response = await preference.create({
      body: {
        items: [
          {
            id: 'nuvio-plan-mensal',
            title: 'Nuvio — Plano Profissional Mensal',
            quantity: 1,
            unit_price: 29.0,
            currency_id: 'BRL',
          },
        ],
        payer: { email },
        payment_methods: {
          excluded_payment_types: method === 'pix'
            ? [{ id: 'credit_card' }, { id: 'debit_card' }, { id: 'ticket' }]
            : [{ id: 'ticket' }],
          installments: method === 'pix' ? 1 : 12,
        },
        back_urls: {
          success: `${appUrl}/billing?status=success`,
          failure: `${appUrl}/billing?status=failure`,
          pending: `${appUrl}/billing?status=pending`,
        },
        auto_return: 'approved',
        external_reference: userId,
        notification_url: `${appUrl}/api/billing/webhook`,
      },
    })

    // Registrar pagamento pendente no banco
    const supabase = createAdminClient()
    await supabase.from('payments').insert({
      user_id: userId,
      mp_preference_id: response.id,
      amount: 29.0,
      method: method === 'pix' ? 'pix' : 'credit_card',
      status: 'pending',
    })

    return NextResponse.json({ init_point: response.init_point })
  } catch (error: any) {
    console.error('MP Error:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
