import { MapPin } from 'lucide-react'
import RatingSummary from '../../components/RatingSummary'
import DocumentList from './DocumentList'
import { Avatar, Stat, Section, TagList, ProfileShell } from './ProfileLayout'

export default function CleanerProfileView({ profile }) {
  const location = [profile.city, profile.country].filter(Boolean).join(', ')

  const header = (
    <div className="flex flex-col gap-3">
      <Avatar src={profile.photo_url} name={profile.full_name} />
      <div className="flex flex-col gap-1">
        <h1 className="m-0 font-serif text-2xl text-foreground">{profile.full_name}</h1>
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

  const stats = <Stat label="Completed jobs" value={profile.completed_jobs_count ?? 0} />

  return (
    <ProfileShell header={header} stats={stats}>
      {profile.bio && (
        <Section title="About">
          <p className="whitespace-pre-line text-foreground">{profile.bio}</p>
        </Section>
      )}
      <Section title="Cleaning categories">
        <TagList
          items={(profile.cleaning_categories ?? []).map((category) => category.name)}
          emptyLabel="No categories listed"
        />
      </Section>
      <Section title="Languages">
        <TagList items={profile.languages} emptyLabel="No languages listed" />
      </Section>
      <Section title="Documents">
        <DocumentList documents={profile.documents} />
      </Section>
    </ProfileShell>
  )
}
