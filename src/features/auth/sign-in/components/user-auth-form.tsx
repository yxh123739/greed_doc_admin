import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Please enter your email' : undefined),
  }),
  password: z.string().optional(),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
  mode?: 'password' | 'magic-link'
}

export function UserAuthForm({
  className,
  redirectTo,
  mode = 'password',
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      if (mode === 'password') {
        const { data: signInData, error } =
          await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password || '',
          })
        if (error) throw error

        const session = signInData.session
        const user = signInData.user
        if (!session || !user)
          throw new Error('Sign-in failed: no session/user returned')

        // Persist in store
        auth.setUser({
          id: user.id,
          email: user.email || data.email,
        } as any)
        auth.setAccessToken(session.access_token)

        toast.success(`Welcome back, ${user.email || data.email}!`)

        const targetPath = redirectTo || '/'
        navigate({ to: targetPath, replace: true })
      } else {
        // Magic link mode
        const { error } = await supabase.auth.signInWithOtp({
          email: data.email,
          options: {
            emailRedirectTo: window.location.origin,
          },
        })
        if (error) throw error

        toast.success(`Magic link sent to ${data.email}. Check your inbox!`)
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Failed to send magic link')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {mode === 'password' && (
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem className='relative'>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder='********' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          {mode === 'password' ? 'Sign in' : 'Send Magic Link'}
        </Button>
      </form>
    </Form>
  )
}
