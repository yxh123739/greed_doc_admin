import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal('superadmin'),
  z.literal('admin'),
  z.literal('user'),
  z.literal('manager'),
])

// Profile schema from Supabase
const profileSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  display_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  bio: z.string().nullable(),
  phone: z.string().nullable(),
  website: z.string().nullable(),
  location: z.string().nullable(),
  company: z.string().nullable(),
  job_title: z.string().nullable(),
})

// Auth user schema (from auth.users)
const authUserSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  created_at: z.string(),
  last_sign_in_at: z.string().nullable(),
  email_confirmed_at: z.string().nullable(),
})

// Combined user schema with profile and auth data
const userSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  displayName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  bio: z.string().nullable(),
  phone: z.string().nullable(),
  website: z.string().nullable(),
  location: z.string().nullable(),
  company: z.string().nullable(),
  jobTitle: z.string().nullable(),
  status: userStatusSchema,
  role: userRoleSchema,
  isAdmin: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  lastSignInAt: z.coerce.date().nullable(),
  emailConfirmedAt: z.coerce.date().nullable(),
})

export type User = z.infer<typeof userSchema>
export type Profile = z.infer<typeof profileSchema>
export type AuthUser = z.infer<typeof authUserSchema>

export const userListSchema = z.array(userSchema)
