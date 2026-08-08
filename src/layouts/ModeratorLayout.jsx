import { Flag } from 'lucide-react'
import ConsoleShell from '../components/ConsoleShell'

const LINKS = [{ to: '/moderator', label: 'Reports', icon: Flag, end: true }]

export default function ModeratorLayout() {
  return <ConsoleShell title="Moderation" links={LINKS} />
}
