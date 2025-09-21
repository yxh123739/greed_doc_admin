import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLayout } from '@/context/layout-provider'
import { useCurrentUser } from '@/hooks/use-current-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import type { SidebarData } from './types'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { user, loading } = useCurrentUser()
  const [dynamicSidebarData, setDynamicSidebarData] =
    useState<SidebarData>(sidebarData)
  const [contactRequestsCount, setContactRequestsCount] = useState<number>(0)

  useEffect(() => {
    async function fetchUnreadContactRequestsCount() {
      try {
        const { count } = await supabase
          .from('contact_requests')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false)

        setContactRequestsCount(count || 0)
      } catch (error) {
        console.error('Error fetching unread contact requests count:', error)
      }
    }

    // Initial fetch
    fetchUnreadContactRequestsCount()

    // Set up real-time subscription to listen for changes
    const subscription = supabase
      .channel('contact_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'contact_requests',
        },
        () => {
          // Refetch count when any change occurs
          fetchUnreadContactRequestsCount()
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (user && !loading) {
      const username = user.email?.split('@')[0] || 'User'
      const displayName = user.user_metadata?.full_name || username

      setDynamicSidebarData({
        ...sidebarData,
        user: {
          name: displayName,
          email: user.email || '',
          avatar: '', // No avatar field, will use fallback
        },
        navGroups: sidebarData.navGroups.map((group) => ({
          ...group,
          items: group.items.map((item) =>
            item.title === 'Contact Requests'
              ? {
                  ...item,
                  badge:
                    contactRequestsCount > 0
                      ? contactRequestsCount.toString()
                      : undefined,
                }
              : item
          ),
        })),
      })
    }
  }, [user, loading, contactRequestsCount])

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={dynamicSidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {dynamicSidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={dynamicSidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
