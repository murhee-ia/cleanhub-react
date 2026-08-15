import { Bookmark, CalendarCheck2, Check, MapPin, Search, Sparkles, Star } from 'lucide-react'

const ARTWORK_JOBS = [
  { label: 'Featured opening', title: 'Hotel housekeeping crew', location: 'Cebu City · Sep 15' },
  { label: 'Fresh today', title: 'Office deep-clean team', location: 'Makati · Sep 18', secondary: true },
]

function ArtworkJob({ job }) {
  return (
    <article className={`landing-art-job${job.secondary ? ' landing-art-job--secondary' : ''}`}>
      <div className="landing-art-job__icon"><Sparkles size={20} aria-hidden="true" /></div>
      <div>
        <p className="landing-art-job__label">{job.label}</p>
        <h3>{job.title}</h3>
        <p className="landing-art-job__meta"><MapPin size={13} aria-hidden="true" /> {job.location}</p>
      </div>
      <Bookmark className="landing-art-job__bookmark" size={19} aria-hidden="true" />
    </article>
  )
}

export default function HeroArtwork() {
  return (
    <div className="landing-hero-art" aria-label="A playful CleanHub job search and applicant workspace illustration" role="img">
      <span className="landing-hero-art__burst" aria-hidden="true">Now hiring!</span>
      <span className="landing-hero-art__spark landing-hero-art__spark--one" aria-hidden="true">✦</span>
      <span className="landing-hero-art__spark landing-hero-art__spark--two" aria-hidden="true">✦</span>

      <div className="landing-window landing-window--jobs">
        <div className="landing-window__bar">
          <span /><span /><span />
          <p>cleanhub / find work</p>
        </div>
        <div className="landing-window__body">
          <div className="landing-art-search">
            <Search size={18} aria-hidden="true" />
            <span>Search cleaning jobs...</span>
          </div>
          <div className="landing-art-chips" aria-hidden="true">
            <span>Residential</span><span>Hotel</span><span>Office</span>
          </div>
          {ARTWORK_JOBS.map((job) => <ArtworkJob job={job} key={job.title} />)}
        </div>
      </div>

      <div className="landing-window landing-window--profile">
        <div className="landing-window__bar">
          <span /><span /><span />
          <p>applicant profile</p>
        </div>
        <div className="landing-profile-card">
          <div className="landing-profile-card__avatar" aria-hidden="true">JC</div>
          <div>
            <h3>Jamie Cleaner</h3>
            <p><Star size={14} fill="currentColor" aria-hidden="true" /> 4.9 · 28 jobs</p>
          </div>
          <span className="landing-profile-card__status"><Check size={13} aria-hidden="true" /> Verified</span>
        </div>
      </div>

      <div className="landing-art-calendar">
        <CalendarCheck2 size={21} aria-hidden="true" />
        <div><span>Accepted!</span><strong>Added to your calendar</strong></div>
      </div>
    </div>
  )
}
