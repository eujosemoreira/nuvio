import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CapturaForm from './CapturaForm'

export default async function CapturaPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()

  const { data: business } = await supabase
    .from('business_settings')
    .select('*, profiles(email)')
    .eq('slug', params.slug)
    .single()

  if (!business) notFound()

  return <CapturaForm business={business} />
}
