export interface TeamMember {
  id: string
  name: string
  role: string
  avatar_url: string | null
}

export interface Channel {
  id: string
  name: string
  description: string | null
}

export interface Message {
  id: string
  channel_id: string
  sender_id: string
  content: string
  file_url: string | null
  file_name: string | null
  created_at: string
  sender?: TeamMember
}

export interface Milestone {
  id: string
  title: string
  description: string | null
  due_date: string | null
  tasks?: Task[]
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  due_date: string | null
  assigned_to: string | null
  milestone_id: string | null
  assignee?: TeamMember
}
