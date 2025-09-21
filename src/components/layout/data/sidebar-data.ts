import {
  LayoutDashboard,
  ListTodo,
  MessageSquare,
  Users,
  MessagesSquare,
  Leaf,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Loading...',
    email: 'loading@example.com',
    avatar: '',
  },
  teams: [
    {
      name: 'LEED Admin',
      logo: Leaf,
      plan: 'management',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Categories',
          url: '/categories',
          icon: ListTodo,
        },
        {
          title: 'Feedback',
          url: '/feedbacks',
          icon: MessageSquare,
        },
        {
          title: 'Contact Requests',
          url: '/contacts',
          icon: MessagesSquare,
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
      ],
    },
  ],
}
