import { LayoutDashboard, Users, Briefcase, Tags, ShieldCheck, Settings, ScrollText } from 'lucide-react'
import ConsoleShell from '../components/ConsoleShell'

const LINKS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/moderators', label: 'Moderators', icon: ShieldCheck },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/audit-logs', label: 'Audit log', icon: ScrollText },
]

export default function AdminLayout() {
  return <ConsoleShell title="Admin" links={LINKS} />
}
