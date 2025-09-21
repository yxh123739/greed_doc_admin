import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase/client'
import { Dashboard } from '@/features/dashboard'

export const Route = createFileRoute('/_authenticated/')({
  beforeLoad: async ({ location }) => {
    // Require authenticated session
    const { data: sessionData } = await supabase.auth.getSession()
    const session = sessionData?.session
    if (!session) {
      throw redirect({ to: '/sign-in', search: { redirect: (location as any).href ?? location.pathname } })
    }

    // Require admin privilege via DB helper
    const { data: isAdmin, error } = await supabase.rpc('is_admin')
    if (error || !isAdmin) {
      throw redirect({ to: '/sign-in', search: { redirect: (location as any).href ?? location.pathname } })
    }
    return {}
  },
  component: Dashboard,
})
