import { MapPin } from 'lucide-react'
import RatingSummary from '../../components/RatingSummary'
import DocumentList from './DocumentList'
import { Avatar, Stat, Section, ProfileShell } from './ProfileLayout'

export default function EmployerProfileView({ profile }) {
  const employerType = (profile.employer_type || '').replace(/_/g, ' ')
  const location = [profile.city, profile.country].filter(Boolean).join(', ')

  const header = (
    <div className="flex flex-col gap-3">
      <Avatar src={profile.photo_url} name={profile.full_name} />
      <div className="flex flex-col gap-1">
        <h1 className="m-0 font-serif text-2xl text-foreground">{profile.full_name}</h1>
        {employerType && <p className="text-sm capitalize text-muted">{employerType}</p>}
        {location && (
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <MapPin className="size-4" aria-hidden="true" />
            {location}
          </p>
        )}
        <RatingSummary average={profile.rating_average} count={profile.rating_count} />
      </div>
    </div>
  )

  const stats = (
    <>
      <Stat label="Posted jobs" value={profile.posted_jobs_count ?? 0} />
      <Stat label="Completed jobs" value={profile.completed_jobs_count ?? 0} />
    </>
  )

  return (
    <ProfileShell header={header} stats={stats}>
      {profile.about && (
        <Section title="About">
          <p className="whitespace-pre-line text-foreground">{profile.about}</p>
        </Section>
      )}
      {(profile.contact_person_name || profile.contact_person_contact) && (
        <Section title="Contact">
          {profile.contact_person_name && (
            <p className="text-foreground">{profile.contact_person_name}</p>
          )}
          {profile.contact_person_contact && (
            <p className="text-sm text-muted">{profile.contact_person_contact}</p>
          )}
        </Section>
      )}
      {profile.address && (
        <Section title="Address">
          <p className="text-foreground">{profile.address}</p>
        </Section>
      )}
      <Section title="Documents">
        <DocumentList documents={profile.documents} />
      </Section>
    </ProfileShell>
  )
}
