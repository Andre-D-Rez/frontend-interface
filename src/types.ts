export enum SeriesStatus {
  PLANEJADO = 'planejado',
  ASSISTINDO = 'assistindo',
  CONCLUIDO = 'concluido'
}

export interface ISeries {
  _id?: string
  titulo: string
  nota: number
  numeroTemporadas: number
  episodiosTotais: number
  episodiosAssistidos: number
  status: SeriesStatus
  userId?: string
  createdAt?: string
  updatedAt?: string
}
