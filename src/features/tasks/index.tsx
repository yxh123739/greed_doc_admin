import { useEffect, useState } from 'react'
import { fetchCategories, type DbCategory } from '@/lib/supabase/queries'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { getCategoriesColumns } from './components/categories-columns'
import { TasksProvider } from './components/tasks-provider'
import { TasksTable } from './components/tasks-table'

export function Tasks() {
  const [data, setData] = useState<DbCategory[]>([])

  useEffect(() => {
    fetchCategories()
      .then(setData)
      .catch(() => {
        // Handle error silently or with proper error handling
      })
  }, [])

  return (
    <TasksProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Categories</h2>
            <p className='text-muted-foreground'>
              Manage LEED categories. Fixed list: editing only; no add/delete.
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <TasksTable data={data} columns={getCategoriesColumns()} />
        </div>
      </Main>
    </TasksProvider>
  )
}
