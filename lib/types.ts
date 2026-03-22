// ============================================================
// TIPOS NUVIO — usados em todo o sistema
// ============================================================

export type LeadStatus =
  | 'novo_lead'
  | 'em_contato'
  | 'diagnostico'
  | 'orcamento_enviado'
  | 'orcamento_aprovado'
  | 'instalacao_agendada'
  | 'servico_concluido'
  | 'cancelado'

export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'expired'
  | 'cancelled'
  | 'blocked'

export type ServiceType =
  | 'instalacao'
  | 'manutencao'
  | 'higienizacao'
  | 'orcamento'
  | 'outros'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'installer' | 'superadmin'
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface BusinessSettings {
  id: string
  user_id: string
  nome_empresa: string | null
  nome_fantasia: string | null
  telefone: string | null
  instagram: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  raio_atendimento: number
  logo_url: string | null
  cor_primaria: string
  cor_secundaria: string
  slug: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  status: SubscriptionStatus
  trial_ends_at: string | null
  current_period_start: string | null
  current_period_end: string | null
  mp_subscription_id: string | null
  plan_value: number
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  user_id: string
  nome: string
  telefone: string
  cidade: string | null
  estado: string | null
  tipo_servico: ServiceType
  mensagem: string | null
  status: LeadStatus
  origem: string
  scheduling_token: string
  created_at: string
  updated_at: string
}

export interface Diagnostic {
  id: string
  user_id: string
  lead_id: string
  tipo_aparelho: string | null
  capacidade_btu: string | null
  marca: string | null
  ambiente: string | null
  problema_relatado: string | null
  observacoes: string | null
  fotos_urls: string[] | null
  created_at: string
  updated_at: string
}

export interface Quote {
  id: string
  user_id: string
  lead_id: string
  diagnostic_id: string | null
  descricao: string | null
  valor_mao_obra: number
  valor_materiais: number
  valor_total: number
  validade_dias: number
  observacoes: string | null
  aprovado: boolean
  aprovado_em: string | null
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  user_id: string
  lead_id: string
  quote_id: string | null
  data_agendada: string
  horario: string
  endereco: string | null
  observacoes: string | null
  reminder_sent: boolean
  concluido: boolean
  concluido_em: string | null
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  user_id: string
  lead_id: string
  appointment_id: string | null
  quote_id: string | null
  tipo_servico: ServiceType
  descricao: string | null
  valor_cobrado: number | null
  data_execucao: string | null
  fotos_urls: string[] | null
  observacoes: string | null
  manutencao_alert_sent: boolean
  created_at: string
  updated_at: string
}

// Labels para exibição
export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  novo_lead:           'Novo Lead',
  em_contato:         'Em Contato',
  diagnostico:        'Diagnóstico',
  orcamento_enviado:  'Orçamento Enviado',
  orcamento_aprovado: 'Orçamento Aprovado',
  instalacao_agendada:'Instalação Agendada',
  servico_concluido:  'Serviço Concluído',
  cancelado:          'Cancelado',
}

export const LEAD_STATUS_COLOR: Record<LeadStatus, string> = {
  novo_lead:           'bg-sky-blue/10 text-sky-blue',
  em_contato:         'bg-amber/10 text-amber',
  diagnostico:        'bg-purple-100 text-purple-600',
  orcamento_enviado:  'bg-amber/10 text-amber',
  orcamento_aprovado: 'bg-teal/10 text-teal',
  instalacao_agendada:'bg-nuvio-blue/10 text-nuvio-blue',
  servico_concluido:  'bg-success/10 text-success',
  cancelado:          'bg-error/10 text-error',
}

export const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  instalacao:   'Instalação',
  manutencao:   'Manutenção',
  higienizacao: 'Higienização',
  orcamento:    'Orçamento',
  outros:       'Outros',
}
