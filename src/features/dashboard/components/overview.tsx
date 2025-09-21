import { useState, useEffect } from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { supabase } from '@/lib/supabase/client'

interface MonthlyData {
  name: string
  contacts: number
  projects: number
}

export function Overview() {
  const [data, setData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMonthlyData() {
      try {
        // Get the date range for the last 12 months
        const now = new Date()
        const twelveMonthsAgo = new Date(
          now.getFullYear(),
          now.getMonth() - 11,
          1
        )

        // Fetch all contact requests and project scores in one query each (only 2 requests total)
        const [contactRequestsResult, projectScoresResult] = await Promise.all([
          supabase
            .from('contact_requests')
            .select('created_at')
            .gte('created_at', twelveMonthsAgo.toISOString()),
          supabase
            .from('project_scores')
            .select('created_at')
            .gte('created_at', twelveMonthsAgo.toISOString()),
        ])

        if (contactRequestsResult.error) {
          console.error(
            'Error fetching contact requests:',
            contactRequestsResult.error
          )
        }
        if (projectScoresResult.error) {
          console.error(
            'Error fetching project scores:',
            projectScoresResult.error
          )
        }

        // Process the data to group by month
        const monthlyStats: {
          [key: string]: { contacts: number; projects: number }
        } = {}

        // Initialize all months with zero counts
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          monthlyStats[monthKey] = { contacts: 0, projects: 0 }
        }

        // Count contact requests by month
        if (contactRequestsResult.data) {
          contactRequestsResult.data.forEach((item) => {
            const date = new Date(item.created_at)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            if (monthlyStats[monthKey]) {
              monthlyStats[monthKey].contacts++
            }
          })
        }

        // Count project scores by month
        if (projectScoresResult.data) {
          projectScoresResult.data.forEach((item) => {
            const date = new Date(item.created_at)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            if (monthlyStats[monthKey]) {
              monthlyStats[monthKey].projects++
            }
          })
        }

        // Convert to chart data format
        const chartData: MonthlyData[] = []
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          const monthName = date.toLocaleDateString('en-US', { month: 'short' })

          chartData.push({
            name: monthName,
            contacts: monthlyStats[monthKey]?.contacts || 0,
            projects: monthlyStats[monthKey]?.projects || 0,
          })
        }

        setData(chartData)
      } catch (error) {
        console.error('Error fetching monthly data:', error)
        // Fallback to sample data if there's an error
        setData([
          { name: 'Jan', contacts: 2, projects: 1 },
          { name: 'Feb', contacts: 1, projects: 2 },
          { name: 'Mar', contacts: 3, projects: 1 },
          { name: 'Apr', contacts: 2, projects: 3 },
          { name: 'May', contacts: 4, projects: 2 },
          { name: 'Jun', contacts: 1, projects: 1 },
          { name: 'Jul', contacts: 3, projects: 4 },
          { name: 'Aug', contacts: 2, projects: 2 },
          { name: 'Sep', contacts: 5, projects: 3 },
          { name: 'Oct', contacts: 3, projects: 1 },
          { name: 'Nov', contacts: 2, projects: 2 },
          { name: 'Dec', contacts: 1, projects: 1 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchMonthlyData()
  }, [])

  if (loading) {
    return (
      <div className='flex h-[350px] items-center justify-center'>
        <div className='text-muted-foreground'>Loading chart data...</div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className='bg-background rounded-lg border p-2 shadow-sm'>
                  <div className='grid grid-cols-2 gap-2'>
                    <div className='flex flex-col'>
                      <span className='text-muted-foreground text-[0.70rem] uppercase'>
                        {label}
                      </span>
                      <span className='text-muted-foreground font-bold'>
                        Contacts: {payload[0]?.value}
                      </span>
                      <span className='text-muted-foreground font-bold'>
                        Projects: {payload[1]?.value}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Bar
          dataKey='contacts'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
        <Bar
          dataKey='projects'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-muted'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
