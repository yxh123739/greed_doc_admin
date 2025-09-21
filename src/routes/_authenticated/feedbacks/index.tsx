import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Apps } from '@/features/feedbacks'

const appsSearchSchema = z.object({
  filter: z.string().optional().catch(''),
  sort: z.enum(['asc', 'desc']).optional().catch('desc'),
})

export const Route = createFileRoute('/_authenticated/feedbacks/')({
  validateSearch: appsSearchSchema,
  component: Apps,
})
