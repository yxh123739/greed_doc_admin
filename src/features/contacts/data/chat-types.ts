export interface ContactRequest {
  id: string
  created_at: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  job_title: string
  company_name: string
  message: string
  hear_about_us: string | null
  is_read: boolean
}

export interface ContactRequestDisplay extends ContactRequest {
  fullName: string
  initials: string
}

export interface ChatMessage {
  sender: string
  message: string
  timestamp: string
}

export interface ChatUser {
  id: string
  profile: string
  username: string
  fullName: string
  title: string
  messages: ChatMessage[]
}
