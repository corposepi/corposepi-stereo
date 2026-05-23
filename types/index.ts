export interface Program {
  id: string
  title: string
  host: string
  description: string
  start_time: string   // "06:00"
  end_time: string     // "08:00"
  days: string         // 'all' | 'weekdays' | 'weekends'
  is_active: boolean
  order_num: number
  created_at: string
  updated_at: string
}

export type ProgramInput = Omit<Program, 'id' | 'created_at' | 'updated_at'>

export interface AdminLoginPayload {
  username: string
  password: string
}
