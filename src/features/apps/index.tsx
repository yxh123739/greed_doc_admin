import { type ChangeEvent, useEffect, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { SlidersHorizontal, ArrowUpAZ, ArrowDownAZ } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { fetchFeedback, type FeedbackRow } from '@/lib/supabase/queries'

const route = getRouteApi('/_authenticated/apps/')

export function Apps() {
  const { filter = '', sort: initSort = 'desc' } = route.useSearch()
  const navigate = route.useNavigate()

  const [sort, setSort] = useState(initSort)
  const [searchTerm, setSearchTerm] = useState(filter)
  const [items, setItems] = useState<FeedbackRow[]>([])

  useEffect(() => {
    fetchFeedback().then(setItems).catch(console.error)
  }, [])

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase()
    const base = items.filter((f) => {
      const role = f.role?.toLowerCase() || ''
      const other = (f.role_other || '').toLowerCase()
      const tools = typeof f.tools === 'string' ? f.tools.toLowerCase() : JSON.stringify(f.tools || {}).toLowerCase()
      return role.includes(s) || other.includes(s) || tools.includes(s)
    })
    base.sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0
      const db = b.created_at ? new Date(b.created_at).getTime() : 0
      return sort === 'asc' ? da - db : db - da
    })
    return base
  }, [items, searchTerm, sort])

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    navigate({
      search: (prev) => ({
        ...prev,
        filter: e.target.value || undefined,
      }),
    })
  }

  const handleSortChange = (sort: 'asc' | 'desc') => {
    setSort(sort)
    navigate({ search: (prev) => ({ ...prev, sort }) })
  }

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ms-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Content ===== */}
      <Main fixed>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Feedback</h1>
          <p className='text-muted-foreground'>User feedback cards fetched from Supabase.</p>
        </div>
        <div className='my-4 flex items-end justify-between sm:my-0 sm:items-center'>
          <div className='flex flex-col gap-4 sm:my-4 sm:flex-row'>
            <Input
              placeholder='Filter feedback...'
              className='h-9 w-40 lg:w-[250px]'
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className='w-16'>
              <SelectValue>
                <SlidersHorizontal size={18} />
              </SelectValue>
            </SelectTrigger>
            <SelectContent align='end'>
              <SelectItem value='asc'>
                <div className='flex items-center gap-4'>
                  <ArrowUpAZ size={16} />
                  <span>Oldest first</span>
                </div>
              </SelectItem>
              <SelectItem value='desc'>
                <div className='flex items-center gap-4'>
                  <ArrowDownAZ size={16} />
                  <span>Newest first</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator className='shadow-sm' />
        <ul className='faded-bottom no-scrollbar grid gap-4 overflow-auto pt-4 pb-16 md:grid-cols-2 lg:grid-cols-3'>
          {filtered.map((f) => (
            <li key={f.id} className='rounded-lg border p-4 hover:shadow-md'>
              <div className='mb-4 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='bg-muted flex size-10 items-center justify-center rounded-lg p-2'>
                    {/* Simple avatar-like letter from role */}
                    <span className='font-bold'>{(f.role || 'U')[0]}</span>
                  </div>
                  <div>
                    <h2 className='font-semibold'>{f.role}{f.role_other ? ` · ${f.role_other}` : ''}</h2>
                    <p className='text-xs text-muted-foreground'>
                      {f.created_at ? new Date(f.created_at).toLocaleString() : ''}
                    </p>
                  </div>
                </div>
                <Button variant='outline' size='sm'>View</Button>
              </div>
              <div className='space-y-2'>
                <p className='text-sm text-muted-foreground'>Interested tools:</p>
                <div className='flex flex-wrap gap-2'>
                  {(() => {
                    const tools = Array.isArray(f.tools)
                      ? f.tools
                      : typeof f.tools === 'object' && f.tools
                        ? Object.keys(f.tools).filter((k) => f.tools[k])
                        : typeof f.tools === 'string'
                          ? [f.tools]
                          : []
                    return tools.length
                      ? tools.map((t: any) => (
                          <span key={String(t)} className='rounded bg-muted px-2 py-0.5 text-xs'>
                            {String(t)}
                          </span>
                        ))
                      : <span className='text-xs text-muted-foreground'>—</span>
                  })()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Main>
    </>
  )
}
