import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface ContactRequest {
  id: string
  first_name: string
  last_name: string
  email: string
  company_name: string
  created_at: string
  is_read: boolean
}

export function RecentContacts() {
  const [contacts, setContacts] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentContacts() {
      try {
        const { data, error } = await supabase
          .from('contact_requests')
          .select(
            'id, first_name, last_name, email, company_name, created_at, is_read'
          )
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) {
          console.error('Error fetching recent contacts:', error)
          return
        }

        setContacts(data || [])
      } catch (error) {
        console.error('Error fetching recent contacts:', error)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchRecentContacts()

    // Set up real-time subscription to listen for changes
    const subscription = supabase
      .channel('recent_contacts_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'contact_requests',
        },
        () => {
          // Refetch contacts when any change occurs
          fetchRecentContacts()
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className='space-y-8'>
        {[...Array(5)].map((_, i) => (
          <div key={i} className='flex items-center'>
            <div className='bg-muted h-9 w-9 animate-pulse rounded-full' />
            <div className='ml-4 flex-1 space-y-1'>
              <div className='bg-muted h-4 animate-pulse rounded' />
              <div className='bg-muted h-3 w-2/3 animate-pulse rounded' />
            </div>
            <div className='bg-muted h-4 w-16 animate-pulse rounded' />
          </div>
        ))}
      </div>
    )
  }

  if (contacts.length === 0) {
    return (
      <div className='py-8 text-center'>
        <p className='text-muted-foreground text-sm'>
          No recent contact requests
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      {contacts.map((contact) => {
        const initials =
          `${contact.first_name.charAt(0)}${contact.last_name.charAt(0)}`.toUpperCase()
        const fullName = `${contact.first_name} ${contact.last_name}`

        return (
          <div key={contact.id} className='flex items-center'>
            <div className='relative'>
              <Avatar className='h-9 w-9'>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              {!contact.is_read && (
                <div className='border-background absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 bg-blue-500'></div>
              )}
            </div>
            <div className='ml-4 space-y-1'>
              <p
                className={`text-sm leading-none ${!contact.is_read ? 'font-bold' : 'font-medium'}`}
              >
                {fullName}
              </p>
              <p className='text-muted-foreground text-sm'>
                {contact.company_name}
              </p>
            </div>
            <div className='text-muted-foreground ml-auto text-xs font-medium'>
              {format(new Date(contact.created_at), 'MMM d')}
            </div>
          </div>
        )
      })}
    </div>
  )
}
