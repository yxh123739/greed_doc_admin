import { supabase } from '@/lib/supabase/client'
import type { User } from './schema'

// Function to fetch users with their profiles
export async function fetchUsers(): Promise<User[]> {
  try {
    // Use the RPC function to get users with auth information
    const { data: usersWithAuth, error: usersError } = await supabase.rpc(
      'get_users_with_auth'
    )

    if (usersError) {
      console.error('Error fetching users with auth:', usersError)
      return []
    }

    // Get user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, is_admin')

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError)
    }

    // Get admin emails
    const { data: adminEmails, error: adminError } = await supabase
      .from('admin_emails')
      .select('email')

    if (adminError) {
      console.error('Error fetching admin emails:', adminError)
    }

    const adminEmailSet = new Set(adminEmails?.map((a) => a.email) || [])
    const userRolesMap = new Map(
      userRoles?.map((r) => [r.user_id, r.is_admin]) || []
    )

    // If no users found, return sample data for development
    if (!usersWithAuth || usersWithAuth.length === 0) {
      return [
        {
          id: 'sample-1',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          displayName: 'Admin User',
          avatarUrl: null,
          bio: 'System Administrator',
          phone: '+1-555-0100',
          website: null,
          location: 'San Francisco, CA',
          company: 'LEED Admin',
          jobTitle: 'System Administrator',
          status: 'active',
          role: 'admin',
          isAdmin: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignInAt: new Date(),
          emailConfirmedAt: new Date(),
        },
        {
          id: 'sample-2',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          displayName: 'John Doe',
          avatarUrl: null,
          bio: 'LEED Consultant',
          phone: '+1-555-0101',
          website: 'https://johndoe.com',
          location: 'New York, NY',
          company: 'Green Building Solutions',
          jobTitle: 'Senior LEED Consultant',
          status: 'active',
          role: 'user',
          isAdmin: false,
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
          updatedAt: new Date(),
          lastSignInAt: new Date(Date.now() - 3600000), // 1 hour ago
          emailConfirmedAt: new Date(Date.now() - 86400000),
        },
        {
          id: 'sample-3',
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          displayName: 'Jane Smith',
          avatarUrl: null,
          bio: 'Sustainability Manager',
          phone: '+1-555-0102',
          website: null,
          location: 'Los Angeles, CA',
          company: 'EcoTech Corp',
          jobTitle: 'Sustainability Manager',
          status: 'inactive',
          role: 'user',
          isAdmin: false,
          createdAt: new Date(Date.now() - 172800000), // 2 days ago
          updatedAt: new Date(Date.now() - 86400000),
          lastSignInAt: new Date(Date.now() - 172800000),
          emailConfirmedAt: new Date(Date.now() - 172800000),
        },
      ]
    }

    // Transform the data to match our User schema
    const users: User[] = usersWithAuth.map((user: any) => {
      const isAdminByRole = userRolesMap.get(user.id) || false
      const isAdminByEmail = user.email ? adminEmailSet.has(user.email) : false
      const isAdmin = isAdminByRole || isAdminByEmail

      // Determine status based on email confirmation and last sign in
      let status: 'active' | 'inactive' | 'invited' | 'suspended' = 'invited'
      if (user.email_confirmed_at) {
        status = user.last_sign_in_at ? 'active' : 'inactive'
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        phone: user.phone,
        website: user.website,
        location: user.location,
        company: user.company,
        jobTitle: user.job_title,
        status,
        role: isAdmin ? 'admin' : 'user',
        isAdmin,
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at),
        lastSignInAt: user.last_sign_in_at
          ? new Date(user.last_sign_in_at)
          : null,
        emailConfirmedAt: user.email_confirmed_at
          ? new Date(user.email_confirmed_at)
          : null,
      }
    })

    return users
  } catch (error) {
    console.error('Error in fetchUsers:', error)
    return []
  }
}

// For backward compatibility, export an empty array initially
export const users: User[] = []
