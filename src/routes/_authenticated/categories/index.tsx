import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Tasks } from '@/features/categories'

const searchSchema = z.object({
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/categories/')({
  validateSearch: searchSchema,
  component: Tasks,
})
