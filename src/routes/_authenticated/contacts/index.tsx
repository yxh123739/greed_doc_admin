import { createFileRoute } from '@tanstack/react-router'
import { Chats } from '@/features/contacts'

export const Route = createFileRoute('/_authenticated/contacts/')({
  component: Chats,
})
