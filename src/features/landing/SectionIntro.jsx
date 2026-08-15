export default function SectionIntro({ align = 'left', eyebrow, title, copy }) {
  return (
    <div className={`landing-section-intro landing-section-intro--${align}`}>
      <p className="landing-kicker">{eyebrow}</p>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  )
}
