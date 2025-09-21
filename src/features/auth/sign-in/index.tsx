import { useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })
  const [activeTab, setActiveTab] = useState<'password' | 'magic-link'>('password')

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>Sign in</CardTitle>
          <CardDescription>
            Choose your preferred sign-in method
          </CardDescription>
          <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as 'password' | 'magic-link')}>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='password'>Password</TabsTrigger>
              <TabsTrigger value='magic-link'>Magic Link</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <UserAuthForm redirectTo={redirect} mode={activeTab} />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
