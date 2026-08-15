import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  Check,
  Factory,
  FileCheck2,
  HeartHandshake,
  Hospital,
  Hotel,
  House,
  MapPin,
  Microscope,
  PartyPopper,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  Zap,
} from 'lucide-react'
import PublicNavbar from '../components/PublicNavbar'
import PaperCard from '../components/PaperCard'
import HeroArtwork from '../features/landing/HeroArtwork'
import LandingFooter from '../features/landing/LandingFooter'
import LandingLink from '../features/landing/LandingLink'
import RoleJourney from '../features/landing/RoleJourney'
import SectionIntro from '../features/landing/SectionIntro'

const CATEGORIES = [
  { icon: House, label: 'Residential' },
  { icon: Hotel, label: 'Hotel' },
  { icon: Hospital, label: 'Hospital' },
  { icon: Building2, label: 'Office' },
  { icon: Factory, label: 'Factory' },
  { icon: PartyPopper, label: 'Event cleanup' },
  { icon: Microscope, label: 'Research' },
]

const FEATURES = [
  { icon: Search, title: 'Open discovery', text: 'Guests can browse real, public cleaning opportunities before creating an account.', tone: 'yellow' },
  { icon: Bookmark, title: 'A cleaner’s shortlist', text: 'Save promising jobs, apply once, and follow every decision without losing the thread.', tone: 'green' },
  { icon: UsersRound, title: 'Job-by-job hiring', text: 'Employers review applicants in the context of the exact role they applied for.', tone: 'soft' },
  { icon: CalendarCheck2, title: 'Acceptance-built calendar', text: 'Only accepted work reaches a cleaner’s monthly calendar—nothing premature.', tone: 'strong' },
  { icon: Star, title: 'Earned reputation', text: 'Mutual ratings unlock after completion and stay tied to a real working relationship.', tone: 'green' },
  { icon: ShieldCheck, title: 'Visible accountability', text: 'Reports, moderation, warnings, and audit history help keep the community trustworthy.', tone: 'yellow' },
]

const FAQS = [
  { question: 'Can I browse jobs without an account?', answer: 'Yes. CleanHub keeps public job discovery open to guests. Create a cleaner account when you are ready to save or apply.' },
  { question: 'Who can create a CleanHub account?', answer: 'Cleaners and employers can register directly. Moderator accounts are created by the admin, and the platform has exactly one admin account.' },
  { question: 'Does CleanHub handle wages or payments?', answer: 'No. A listing may display compensation details, but payments, salaries, contracts, and invoices are arranged outside CleanHub.' },
  { question: 'When does a job appear on a cleaner’s calendar?', answer: 'Only when an employer accepts that cleaner’s application. Saving or applying to a job never creates a calendar entry.' },
  { question: 'How do ratings work?', answer: 'Each side may leave one rating after completing their own side of the job. Cleaner-to-employer and employer-to-cleaner reviews are independent.' },
  { question: 'What happens if two jobs overlap?', answer: 'CleanHub warns cleaners about a schedule clash and the API blocks applications that overlap work they have already accepted.' },
]

const BENEFITS = [
  'Purpose-built for cleaning work—not squeezed into a generic job board.',
  'One clear path from discovery to application, acceptance, completion, and trust.',
  'Public browsing lowers the barrier for cleaners exploring their next move.',
  'Role-aware workspaces keep each person focused on what they can actually do.',
]

const BENEFIT_NOTES = [
  { icon: Zap, modifier: 'one', title: 'Fast to understand', text: 'Statuses, next steps, and role-specific actions stay visible.' },
  { icon: HeartHandshake, modifier: 'two', title: 'Human on both sides', text: 'Profiles and work history add context beyond a single form.' },
  { icon: FileCheck2, modifier: 'three', title: 'Clear boundaries', text: 'CleanHub recruits and records trust. It never processes pay or contracts.' },
]

const PRINCIPLES = [
  { icon: CalendarCheck2, title: 'Acceptance means commitment', text: 'Only accepted work reaches a cleaner’s calendar.' },
  { icon: BriefcaseBusiness, title: 'Applications stay coherent', text: 'One cleaner, one durable application, one job context.' },
  { icon: Star, title: 'Reviews are earned', text: 'Ratings come from real, completed working relationships.' },
  { icon: ShieldCheck, title: 'Safety has a workflow', text: 'Reports reach moderators, with admin escalation when needed.' },
]

export default function HomePage() {
  return (
    <div className="landing-page">
      <PublicNavbar />
      <main>
        <section className="landing-hero" aria-labelledby="landing-hero-title">
          <div className="landing-shell landing-hero__grid">
            <div className="landing-hero__copy">
              <p className="landing-kicker"><Sparkles size={15} aria-hidden="true" /> Cleaning work, finally in focus</p>
              <h1 id="landing-hero-title">Cleaning work deserves a place of <span>its own.</span></h1>
              <p className="landing-hero__lede">
                Find the right cleaning job. Hire the right person. Keep every application, accepted date, and earned review connected in one lively hub.
              </p>
              <div className="landing-hero__actions">
                <LandingLink to="/jobs" showArrow>Explore open jobs</LandingLink>
                <LandingLink to="/register" variant="secondary">Join as cleaner or employer</LandingLink>
              </div>
              <ul className="landing-hero__proof" aria-label="CleanHub highlights">
                <li><Check size={15} aria-hidden="true" /> Browse before signing up</li>
                <li><Check size={15} aria-hidden="true" /> Built for both sides of the job</li>
                <li><Check size={15} aria-hidden="true" /> No payment processing</li>
              </ul>
            </div>
            <HeroArtwork />
          </div>

          <div className="landing-category-marquee" aria-label="Cleaning work categories">
            <div className="landing-category-marquee__track">
              {[...CATEGORIES, ...CATEGORIES].map((category, index) => {
                const Icon = category.icon
                return <span key={`${category.label}-${index}`}><Icon size={18} aria-hidden="true" /> {category.label}</span>
              })}
            </div>
          </div>
        </section>

        <section className="landing-section landing-problem" id="about">
          <div className="landing-shell landing-problem__grid">
            <div className="landing-problem__statement">
              <span className="landing-stamp">The big idea</span>
              <h2>Essential work should not feel invisible.</h2>
            </div>
            <PaperCard className="landing-problem__card" flat>
              <p className="landing-problem__dropcap">Cleaners keep homes, hotels, hospitals, offices, factories, and public spaces moving.</p>
              <p>Yet finding the next opportunity—or the right person—still happens across generic listings and scattered conversations.</p>
              <p><strong>CleanHub gives that entire recruitment journey a home designed around the work itself.</strong></p>
            </PaperCard>
          </div>
        </section>

        <section className="landing-section landing-how" id="how-it-works">
          <div className="landing-shell">
            <SectionIntro
              eyebrow="Two roles · one clear workflow"
              title="Pick your path. See the whole journey."
              copy="CleanHub grows with your responsibility—from a first look at public jobs to a completed relationship and an earned review."
            />
            <RoleJourney />
          </div>
        </section>

        <section className="landing-section landing-features" id="features">
          <div className="landing-shell">
            <SectionIntro
              align="center"
              eyebrow="The useful stuff"
              title="Everything has a reason to be here."
              copy="Each feature protects momentum, context, or trust—often all three."
            />
            <div className="landing-feature-grid">
              {FEATURES.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <PaperCard className={`landing-feature-card landing-feature-card--${feature.tone}`} key={feature.title} flat>
                    <div className="landing-feature-card__top">
                      <span className="landing-feature-card__number">0{index + 1}</span>
                      <span className="landing-feature-card__icon"><Icon size={25} strokeWidth={2.2} aria-hidden="true" /></span>
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                  </PaperCard>
                )
              })}
            </div>
          </div>
        </section>

        <section className="landing-section landing-benefits" id="benefits">
          <div className="landing-shell landing-benefits__layout">
            <div>
              <SectionIntro
                eyebrow="Why CleanHub"
                title="Less chasing. More clarity. Better-fit work."
                copy="The product keeps the important context close and the rules honest on both sides."
              />
              <ul className="landing-benefit-list">
                {BENEFITS.map((benefit) => <li key={benefit}><Check size={18} aria-hidden="true" /> <span>{benefit}</span></li>)}
              </ul>
              <LandingLink to="/register" showArrow>Make CleanHub yours</LandingLink>
            </div>
            <div className="landing-benefit-board">
              {BENEFIT_NOTES.map((note) => {
                const Icon = note.icon
                return (
                  <PaperCard className={`landing-benefit-note landing-benefit-note--${note.modifier}`} flat key={note.title}>
                    <Icon size={27} aria-hidden="true" />
                    <h3>{note.title}</h3>
                    <p>{note.text}</p>
                  </PaperCard>
                )
              })}
              <div className="landing-benefit-board__bubble">Good work<br />travels further!</div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-principles">
          <div className="landing-shell">
            <div className="landing-principles__heading">
              <p className="landing-kicker">Rules that earn confidence</p>
              <h2>A job board with a backbone.</h2>
            </div>
            <div className="landing-principles__grid">
              {PRINCIPLES.map((principle, index) => {
                const Icon = principle.icon
                return (
                  <article key={principle.title}>
                    <span>0{index + 1}</span>
                    <Icon aria-hidden="true" />
                    <h3>{principle.title}</h3>
                    <p>{principle.text}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="landing-section landing-faq" id="faq">
          <div className="landing-shell landing-faq__layout">
            <div className="landing-faq__intro">
              <SectionIntro eyebrow="Questions, meet answers" title="The before-you-ask desk." copy="A quick guide to the rules people care about most." />
              <div className="landing-faq__doodle" aria-hidden="true">?</div>
            </div>
            <div className="landing-faq__list">
              {FAQS.map((faq, index) => (
                <details key={faq.question} name="cleanhub-faq">
                  <summary><span>0{index + 1}</span>{faq.question}<span className="landing-faq__plus">+</span></summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-final-cta" aria-labelledby="landing-cta-title">
          <div className="landing-shell landing-final-cta__inner">
            <span className="landing-final-cta__sticker" aria-hidden="true"><Bell size={22} /> Fresh opportunities</span>
            <p className="landing-kicker">Your next clean start</p>
            <h2 id="landing-cta-title">Good work is already out there.<br /><span>Let’s help you find it.</span></h2>
            <p>Browse first. Join when you are ready. Keep every next step in one place.</p>
            <div className="landing-final-cta__actions">
              <LandingLink to="/jobs" showArrow>Browse cleaning jobs</LandingLink>
              <LandingLink to="/register" variant="light">Create your account</LandingLink>
            </div>
            <div className="landing-final-cta__location" aria-hidden="true"><MapPin size={18} /> Clean work, wherever it happens.</div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  )
}
