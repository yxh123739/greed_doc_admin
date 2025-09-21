import { useState, useEffect } from 'react'
import {
  Mail,
  BarChart3,
  MessageSquare,
  TrendingUp,
  Calendar,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Overview } from './components/overview'
import { RecentContacts } from './components/recent-contacts'

interface DashboardStats {
  totalContactRequests: number
  totalProjectScores: number
  totalCategories: number
  totalFeedback: number
  thisMonthRequests: number
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalContactRequests: 0,
    totalProjectScores: 0,
    totalCategories: 0,
    totalFeedback: 0,
    thisMonthRequests: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        // Get total counts
        const [
          contactRequestsResult,
          projectScoresResult,
          categoriesResult,
          feedbackResult,
        ] = await Promise.all([
          supabase
            .from('contact_requests')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('project_scores')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('categories')
            .select('*', { count: 'exact', head: true }),
          supabase.from('feedback').select('*', { count: 'exact', head: true }),
        ])

        // Get this month's requests
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const thisMonthResult = await supabase
          .from('contact_requests')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth.toISOString())

        setStats({
          totalContactRequests: contactRequestsResult.count || 0,
          totalProjectScores: projectScoresResult.count || 0,
          totalCategories: categoriesResult.count || 0,
          totalFeedback: feedbackResult.count || 0,
          thisMonthRequests: thisMonthResult.count || 0,
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()

    // Set up real-time subscription to listen for contact_requests changes
    const subscription = supabase
      .channel('dashboard_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_requests',
        },
        () => {
          // Refetch stats when contact_requests change
          fetchDashboardStats()
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-6 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
          <div className='flex items-center space-x-2'>
            <Button>
              <Calendar className='mr-2 h-4 w-4' />
              Export Report
            </Button>
          </div>
        </div>
        <div className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Contact Requests
                </CardTitle>
                <Mail className='text-muted-foreground h-4 w-4' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {loading ? '...' : stats.totalContactRequests}
                </div>
                <p className='text-muted-foreground text-xs'>
                  {loading ? '...' : `${stats.thisMonthRequests} this month`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Project Scores
                </CardTitle>
                <BarChart3 className='text-muted-foreground h-4 w-4' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {loading ? '...' : stats.totalProjectScores}
                </div>
                <p className='text-muted-foreground text-xs'>
                  Total assessments completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Categories
                </CardTitle>
                <TrendingUp className='text-muted-foreground h-4 w-4' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {loading ? '...' : stats.totalCategories}
                </div>
                <p className='text-muted-foreground text-xs'>
                  LEED assessment categories
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Feedback</CardTitle>
                <MessageSquare className='text-muted-foreground h-4 w-4' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {loading ? '...' : stats.totalFeedback}
                </div>
                <p className='text-muted-foreground text-xs'>
                  User feedback submissions
                </p>
              </CardContent>
            </Card>
          </div>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
            <Card className='col-span-1 lg:col-span-4'>
              <CardHeader>
                <CardTitle>Activity Overview</CardTitle>
                <CardDescription>
                  Contact requests and project assessments over time
                </CardDescription>
              </CardHeader>
              <CardContent className='ps-2'>
                <Overview />
              </CardContent>
            </Card>
            <Card className='col-span-1 lg:col-span-3'>
              <CardHeader>
                <CardTitle>Recent Contact Requests</CardTitle>
                <CardDescription>
                  Latest inquiries from potential clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentContacts />
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}
