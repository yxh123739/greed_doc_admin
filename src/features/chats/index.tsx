import { useState, useEffect } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { format } from 'date-fns'
import {
  ArrowLeft,
  MoreVertical,
  Phone,
  Search as SearchIcon,
  Mail,
  Building,
  User,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  type ContactRequest,
  type ContactRequestDisplay,
} from './data/chat-types'

export function Chats() {
  const [search, setSearch] = useState('')
  const [selectedRequest, setSelectedRequest] =
    useState<ContactRequestDisplay | null>(null)
  const [mobileSelectedRequest, setMobileSelectedRequest] =
    useState<ContactRequestDisplay | null>(null)
  const [contactRequests, setContactRequests] = useState<
    ContactRequestDisplay[]
  >([])
  const [loading, setLoading] = useState(true)

  // Fetch contact requests from Supabase
  useEffect(() => {
    async function fetchContactRequests() {
      try {
        const { data, error } = await supabase
          .from('contact_requests')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching contact requests:', error)
          return
        }

        const processedData: ContactRequestDisplay[] = (data || []).map(
          (request: ContactRequest) => ({
            ...request,
            fullName: `${request.first_name} ${request.last_name}`,
            initials:
              `${request.first_name.charAt(0)}${request.last_name.charAt(0)}`.toUpperCase(),
          })
        )

        setContactRequests(processedData)
      } catch (error) {
        console.error('Error fetching contact requests:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContactRequests()

    // Set up real-time subscription to listen for changes
    const subscription = supabase
      .channel('contact_requests_list_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_requests',
        },
        () => {
          // Refetch contact requests when any change occurs
          fetchContactRequests()
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Mark contact request as read
  const markAsRead = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('contact_requests')
        .update({ is_read: true })
        .eq('id', requestId)

      if (error) {
        console.error('Error marking request as read:', error)
        return
      }

      // Update local state
      setContactRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? { ...request, is_read: true } : request
        )
      )
    } catch (error) {
      console.error('Error marking request as read:', error)
    }
  }

  // Filtered data based on the search query
  const filteredRequestList = contactRequests.filter(
    ({ fullName, email, company_name }) =>
      fullName.toLowerCase().includes(search.trim().toLowerCase()) ||
      email.toLowerCase().includes(search.trim().toLowerCase()) ||
      company_name.toLowerCase().includes(search.trim().toLowerCase())
  )

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <section className='flex h-full gap-6'>
          {/* Left Side */}
          <div className='flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80'>
            <div className='bg-background sticky top-0 z-10 -mx-4 px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none'>
              <div className='flex items-center justify-between py-2'>
                <div className='flex gap-2'>
                  <h1 className='text-2xl font-bold'>Contact Requests</h1>
                  <Mail size={20} />
                </div>
              </div>

              <label
                className={cn(
                  'focus-within:ring-ring focus-within:ring-1 focus-within:outline-hidden',
                  'border-border flex h-10 w-full items-center space-x-0 rounded-md border ps-2'
                )}
              >
                <SearchIcon size={15} className='me-2 stroke-slate-500' />
                <span className='sr-only'>Search</span>
                <input
                  type='text'
                  className='w-full flex-1 bg-inherit text-sm focus-visible:outline-hidden'
                  placeholder='Search requests...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>

            <ScrollArea className='-mx-3 h-full overflow-scroll p-3'>
              {loading ? (
                <div className='flex items-center justify-center py-8'>
                  <div className='text-muted-foreground'>
                    Loading requests...
                  </div>
                </div>
              ) : filteredRequestList.length === 0 ? (
                <div className='flex items-center justify-center py-8'>
                  <div className='text-muted-foreground'>
                    No contact requests found
                  </div>
                </div>
              ) : (
                filteredRequestList.map((request) => {
                  const {
                    id,
                    fullName,
                    initials,
                    company_name,
                    job_title,
                    created_at,
                  } = request
                  return (
                    <Fragment key={id}>
                      <button
                        type='button'
                        className={cn(
                          'group hover:bg-accent hover:text-accent-foreground',
                          `flex w-full rounded-md px-2 py-2 text-start text-sm`,
                          selectedRequest?.id === id && 'sm:bg-muted'
                        )}
                        onClick={() => {
                          setSelectedRequest(request)
                          setMobileSelectedRequest(request)
                          // Mark as read when clicked
                          if (!request.is_read) {
                            markAsRead(request.id)
                          }
                        }}
                      >
                        <div className='flex gap-2'>
                          <div className='relative'>
                            <Avatar>
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            {!request.is_read && (
                              <div className='border-background absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 bg-blue-500'></div>
                            )}
                          </div>
                          <div className='min-w-0 flex-1'>
                            <div
                              className={cn(
                                'truncate',
                                !request.is_read ? 'font-bold' : 'font-medium'
                              )}
                            >
                              {fullName}
                            </div>
                            <div className='text-muted-foreground group-hover:text-accent-foreground/90 truncate text-xs'>
                              {job_title} at {company_name}
                            </div>
                            <div className='text-muted-foreground group-hover:text-accent-foreground/90 text-xs'>
                              {format(new Date(created_at), 'MMM d, yyyy')}
                            </div>
                          </div>
                          {!request.is_read && (
                            <div className='flex items-center'>
                              <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                            </div>
                          )}
                        </div>
                      </button>
                      <Separator className='my-1' />
                    </Fragment>
                  )
                })
              )}
            </ScrollArea>
          </div>

          {/* Right Side */}
          {selectedRequest ? (
            <div
              className={cn(
                'bg-background absolute inset-0 start-full z-50 hidden w-full flex-1 flex-col border shadow-xs sm:static sm:z-auto sm:flex sm:rounded-md',
                mobileSelectedRequest && 'start-0 flex'
              )}
            >
              {/* Top Part */}
              <div className='bg-card mb-1 flex flex-none justify-between p-4 shadow-lg sm:rounded-t-md'>
                {/* Left */}
                <div className='flex gap-3'>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='-ms-2 h-full sm:hidden'
                    onClick={() => setMobileSelectedRequest(null)}
                  >
                    <ArrowLeft className='rtl:rotate-180' />
                  </Button>
                  <div className='flex items-center gap-2 lg:gap-4'>
                    <Avatar className='size-9 lg:size-11'>
                      <AvatarFallback>
                        {selectedRequest.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className='col-start-2 row-span-2 text-sm font-medium lg:text-base'>
                        {selectedRequest.fullName}
                      </span>
                      <span className='text-muted-foreground col-start-2 row-span-2 row-start-2 line-clamp-1 block max-w-32 text-xs text-nowrap text-ellipsis lg:max-w-none lg:text-sm'>
                        {selectedRequest.job_title} at{' '}
                        {selectedRequest.company_name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className='-me-1 flex items-center gap-1 lg:gap-2'>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='hidden size-8 rounded-full sm:inline-flex lg:size-10'
                    onClick={() =>
                      window.open(`mailto:${selectedRequest.email}`)
                    }
                  >
                    <Mail size={22} className='stroke-muted-foreground' />
                  </Button>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='hidden size-8 rounded-full sm:inline-flex lg:size-10'
                    onClick={() =>
                      window.open(`tel:${selectedRequest.phone_number}`)
                    }
                  >
                    <Phone size={22} className='stroke-muted-foreground' />
                  </Button>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='h-10 rounded-md sm:h-8 sm:w-4 lg:h-10 lg:w-6'
                  >
                    <MoreVertical className='stroke-muted-foreground sm:size-5' />
                  </Button>
                </div>
              </div>

              {/* Contact Request Details */}
              <div className='flex flex-1 flex-col overflow-hidden rounded-md px-4 pt-0 pb-4'>
                <ScrollArea className='flex-1 overflow-auto'>
                  <div className='space-y-6 pr-4'>
                    {/* Contact Information */}
                    <div className='space-y-4'>
                      <h3 className='text-lg font-semibold'>
                        Contact Information
                      </h3>
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <User size={16} className='text-muted-foreground' />
                            <span className='text-sm font-medium'>Name</span>
                          </div>
                          <p className='text-sm'>{selectedRequest.fullName}</p>
                        </div>
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <Mail size={16} className='text-muted-foreground' />
                            <span className='text-sm font-medium'>Email</span>
                          </div>
                          <p className='text-sm'>{selectedRequest.email}</p>
                        </div>
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <Phone
                              size={16}
                              className='text-muted-foreground'
                            />
                            <span className='text-sm font-medium'>Phone</span>
                          </div>
                          <p className='text-sm'>
                            {selectedRequest.phone_number}
                          </p>
                        </div>
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <Building
                              size={16}
                              className='text-muted-foreground'
                            />
                            <span className='text-sm font-medium'>Company</span>
                          </div>
                          <p className='text-sm'>
                            {selectedRequest.company_name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Job Title */}
                    <div className='space-y-2'>
                      <h4 className='text-sm font-medium'>Job Title</h4>
                      <p className='text-muted-foreground text-sm'>
                        {selectedRequest.job_title}
                      </p>
                    </div>

                    <Separator />

                    {/* Message */}
                    <div className='space-y-2'>
                      <h4 className='text-sm font-medium'>Message</h4>
                      <div className='bg-muted rounded-md p-3'>
                        <p className='text-sm whitespace-pre-wrap'>
                          {selectedRequest.message}
                        </p>
                      </div>
                    </div>

                    {/* How they heard about us */}
                    {selectedRequest.hear_about_us && (
                      <>
                        <Separator />
                        <div className='space-y-2'>
                          <h4 className='text-sm font-medium'>
                            How they heard about us
                          </h4>
                          <p className='text-muted-foreground text-sm'>
                            {selectedRequest.hear_about_us}
                          </p>
                        </div>
                      </>
                    )}

                    <Separator />

                    {/* Request Date */}
                    <div className='space-y-2'>
                      <h4 className='text-sm font-medium'>Request Date</h4>
                      <p className='text-muted-foreground text-sm'>
                        {format(
                          new Date(selectedRequest.created_at),
                          "MMMM d, yyyy 'at' h:mm a"
                        )}
                      </p>
                    </div>
                  </div>
                </ScrollArea>

                {/* Action Buttons */}
                <div className='flex gap-2 border-t pt-4'>
                  <Button
                    className='flex-1'
                    onClick={() =>
                      window.open(`mailto:${selectedRequest.email}`)
                    }
                  >
                    <Mail size={16} className='mr-2' />
                    Reply via Email
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() =>
                      window.open(`tel:${selectedRequest.phone_number}`)
                    }
                  >
                    <Phone size={16} className='mr-2' />
                    Call
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                'bg-card absolute inset-0 start-full z-50 hidden w-full flex-1 flex-col justify-center rounded-md border shadow-xs sm:static sm:z-auto sm:flex'
              )}
            >
              <div className='flex flex-col items-center space-y-6'>
                <div className='border-border flex size-16 items-center justify-center rounded-full border-2'>
                  <Mail className='size-8' />
                </div>
                <div className='space-y-2 text-center'>
                  <h1 className='text-xl font-semibold'>Contact Requests</h1>
                  <p className='text-muted-foreground text-sm'>
                    Select a contact request to view details.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </Main>
    </>
  )
}
