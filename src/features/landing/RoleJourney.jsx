import { BriefcaseBusiness, CalendarCheck2, Check, Search, Send, Star, UsersRound } from 'lucide-react'
import { useState } from 'react'

const JOURNEYS = {
  cleaner: {
    label: 'I clean',
    intro: 'Turn your skills into a clear profile, then keep every opportunity and decision in one place.',
    steps: [
      { icon: Search, title: 'Find the right fit', text: 'Browse public work by category, place, date, and keyword.' },
      { icon: Send, title: 'Apply with context', text: 'Share a short message, résumé, and your complete cleaner profile.' },
      { icon: CalendarCheck2, title: 'Stay on schedule', text: 'Accepted jobs appear automatically on your monthly calendar.' },
      { icon: Star, title: 'Build trust', text: 'After completion, rate employers and grow a visible work history.' },
    ],
  },
  employer: {
    label: 'I hire',
    intro: 'Post a real cleaning need, keep candidates tied to the right job, and make confident decisions.',
    steps: [
      { icon: BriefcaseBusiness, title: 'Post with clarity', text: 'Describe the work, location, schedule, needs, and display-only pay.' },
      { icon: UsersRound, title: 'Review one job at a time', text: 'Compare profiles, résumés, ratings, messages, and private notes.' },
      { icon: Check, title: 'Choose your cleaner', text: 'Accept or reject applicants with the full relationship in view.' },
      { icon: Star, title: 'Carry trust forward', text: 'Complete the job, leave a review, and strengthen future hiring.' },
    ],
  },
}

export default function RoleJourney() {
  const [activeRole, setActiveRole] = useState('cleaner')
  const journey = JOURNEYS[activeRole]

  return (
    <div className="landing-journey">
      <div className="landing-role-toggle" aria-label="Choose a CleanHub journey" role="group">
        {Object.entries(JOURNEYS).map(([role, item]) => (
          <button
            className={activeRole === role ? 'is-active' : ''}
            key={role}
            type="button"
            aria-pressed={activeRole === role}
            onClick={() => setActiveRole(role)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="landing-journey__intro" aria-live="polite">{journey.intro}</p>
      <ol className="landing-journey__steps">
        {journey.steps.map((step, index) => {
          const Icon = step.icon
          return (
            <li key={step.title}>
              <span className="landing-journey__number">0{index + 1}</span>
              <span className="landing-journey__icon"><Icon size={23} strokeWidth={2.2} aria-hidden="true" /></span>
              <div><h3>{step.title}</h3><p>{step.text}</p></div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
