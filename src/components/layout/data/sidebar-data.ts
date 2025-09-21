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
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: 'Feedback',
          url: '/apps',
          icon: MessageSquare,
        },
        {
          title: 'Contact Requests',
          url: '/chats',
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
