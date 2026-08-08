import { Link } from 'react-router-dom'
import { MapPin, Info, Phone, FileText, Briefcase, Star } from 'lucide-react'
import PaperCard from '../../components/PaperCard'
import RatingSummary from '../../components/RatingSummary'
import EmployerJobsSection from '../jobs/EmployerJobsSection'
import ReviewsSection from '../ratings/ReviewsSection'
import ReportButton from '../reports/ReportButton'
import DocumentList from './DocumentList'
import { Avatar, Stat, BoxCard } from './ProfileLayout'

export default function EmployerProfileView({ profile, isOwnProfile = false }) {
  const employerType = (profile.employer_type || '').replace(/_/g, ' ')
  const location = [profile.city, profile.country].filter(Boolean).join(', ')

  return (
    <PaperCard className="relative w-full p-6 sm:p-10">
      <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">

        {/* ── Left Column: Identity & Stats ── */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', background: 'var(--color-surface)', border: '2px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <Avatar src={profile.photo_url} name={profile.full_name} />
            </div>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h1 style={{ fontFamily: 'var(--heading)', fontWeight: 700, fontSize: '20px', color: 'var(--color-foreground)', margin: 0, lineHeight: 1.2 }}>
                {profile.full_name}
              </h1>
              <p style={{ fontSize: '12px', color: 'var(--color-muted)', margin: 0 }}>
                Employer{employerType ? ` · ${employerType}` : ''}
              </p>
              {location && (
                <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-muted)', margin: 0 }}>
                  <MapPin style={{ width: '12px', height: '12px' }} /> {location}
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                <RatingSummary average={profile.rating_average} count={profile.rating_count} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px', paddingTop: '16px', borderTop: '1.5px solid rgba(0,0,0,0.1)' }}>
              <Stat label="Jobs Posted" value={profile.posted_jobs_count ?? 0} />
              <Stat label="Rating" value={profile.rating_average > 0 ? Number(profile.rating_average).toFixed(1) : '-'} />
            </div>

            {isOwnProfile && (
              <div style={{ marginTop: '4px' }}>
                <Link
                  to="/employer/profile/edit"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontFamily: 'var(--heading)',
                    fontWeight: 700,
                    fontSize: '13px',
                    color: 'var(--color-foreground)',
                    textDecoration: 'none',
                    background: 'var(--color-highlight)',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-btn-sm)',
                    padding: '10px 16px',
                    transition: 'box-shadow 0.1s, transform 0.1s',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '1px 1px 0 #1a1a1a'; e.currentTarget.style.transform = 'translate(1px,1px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-btn-sm)'; e.currentTarget.style.transform = 'none' }}
                >
                  ✏ Edit profile
                </Link>
              </div>
            )}

            {!isOwnProfile && (
              <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'center' }}>
                <ReportButton reportableType="user" reportableId={profile.user_id} />
              </div>
            )}
          </div>
        </aside>

        {/* ── Right Column: Details ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {profile.about && (
            <BoxCard icon={Info} title="About">
              <p style={{ whiteSpace: 'pre-line', color: 'var(--color-foreground)', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
                {profile.about}
              </p>
            </BoxCard>
          )}

          <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {(profile.contact_person_name || profile.contact_person_contact) && (
              <BoxCard icon={Phone} title="Contact Person">
                {profile.contact_person_name && (
                  <p style={{ fontFamily: 'var(--heading)', fontWeight: 600, fontSize: '15px', color: 'var(--color-foreground)', margin: '0 0 4px' }}>
                    {profile.contact_person_name}
                  </p>
                )}
                {profile.contact_person_contact && (
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', margin: 0 }}>
                    {profile.contact_person_contact}
                  </p>
                )}
              </BoxCard>
            )}

            {profile.address && (
              <BoxCard icon={MapPin} title="Address">
                <p style={{ fontSize: '14px', color: 'var(--color-foreground)', lineHeight: 1.6, margin: 0 }}>
                  {profile.address}
                </p>
              </BoxCard>
            )}
          </div>

          <BoxCard icon={FileText} title="Documents">
            <DocumentList documents={profile.documents} />
          </BoxCard>

          <BoxCard icon={Briefcase} title="Job Posts">
            <EmployerJobsSection employerId={profile.user_id} isOwnProfile={isOwnProfile} />
          </BoxCard>

          <BoxCard icon={Star} title="Reviews">
            <ReviewsSection role="employer" userId={profile.user_id} />
          </BoxCard>

        </div>
      </div>
    </PaperCard>
  )
}
