/**
 * Button — neo-brutalist button system.
 * Variants: primary (green + hard shadow), secondary (yellow), ghost (outlined),
 * icon (no border/background, for chromeless icon-only actions), danger (red).
 */

const BASE =
  'inline-flex items-center justify-center gap-1.5 font-semibold transition-all duration-100 disabled:cursor-not-allowed disabled:opacity-55 select-none'

const VARIANTS = {
  primary: {
    style: {
      background: 'var(--color-primary)',
      color: '#ffffff',
      border: '2px solid var(--border)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-btn)',
      fontFamily: 'var(--heading)',
      fontSize: '14px',
      fontWeight: 700,
      padding: '8px 18px',
      cursor: 'pointer',
    },
    hover: {
      boxShadow: '1px 1px 0 #1a1a1a',
      transform: 'translate(2px, 2px)',
    },
  },
  secondary: {
    style: {
      background: 'var(--color-highlight-strong)',
      color: 'var(--color-foreground)',
      border: '2px solid var(--border)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-btn)',
      fontFamily: 'var(--heading)',
      fontSize: '14px',
      fontWeight: 700,
      padding: '8px 18px',
      cursor: 'pointer',
    },
    hover: {
      boxShadow: '1px 1px 0 #1a1a1a',
      transform: 'translate(2px, 2px)',
    },
  },
  ghost: {
    style: {
      background: 'transparent',
      color: 'var(--color-primary)',
      border: '2px solid var(--color-primary)',
      borderRadius: 'var(--radius)',
      boxShadow: 'none',
      fontFamily: 'var(--heading)',
      fontSize: '14px',
      fontWeight: 600,
      padding: '7px 16px',
      cursor: 'pointer',
    },
    hover: {
      background: 'var(--color-primary-hover)',
      color: '#ffffff',
    },
  },
  icon: {
    style: {
      background: 'transparent',
      color: 'var(--color-primary)',
      border: 'none',
      borderRadius: 'var(--radius)',
      boxShadow: 'none',
      padding: '4px',
      cursor: 'pointer',
    },
    hover: {
      background: 'var(--color-highlight-soft)',
    },
  },
  danger: {
    style: {
      background: 'var(--color-danger)',
      color: '#ffffff',
      border: '2px solid var(--border)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-btn)',
      fontFamily: 'var(--heading)',
      fontSize: '14px',
      fontWeight: 700,
      padding: '8px 18px',
      cursor: 'pointer',
    },
    hover: {
      boxShadow: '1px 1px 0 #1a1a1a',
      transform: 'translate(2px, 2px)',
    },
  },
  dark: {
    style: {
      background: 'var(--color-surface)',
      color: 'var(--color-foreground)',
      border: '2px solid var(--border)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-btn)',
      fontFamily: 'var(--heading)',
      fontSize: '14px',
      fontWeight: 600,
      padding: '7px 16px',
      cursor: 'pointer',
    },
    hover: {
      background: 'var(--color-foreground)',
      color: 'var(--color-surface)',
      boxShadow: '1px 1px 0 #1a1a1a',
      transform: 'translate(2px, 2px)',
    },
  },
  complete: {
    style: {
      background: 'var(--color-highlight-soft)',
      color: 'var(--color-foreground)',
      border: '2px solid var(--border)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-btn)',
      fontFamily: 'var(--heading)',
      fontSize: '14px',
      fontWeight: 700,
      padding: '8px 18px',
      cursor: 'pointer',
    },
    hover: {
      boxShadow: '1px 1px 0 #1a1a1a',
      transform: 'translate(2px, 2px)',
    },
  },
}

export default function Button({ variant = 'primary', className = '', style: extStyle = {}, ...props }) {
  const v = VARIANTS[variant] ?? VARIANTS.primary

  return (
    <button
      className={`${BASE} ${className}`}
      style={{ ...v.style, ...extStyle }}
      onMouseEnter={(e) => {
        if (!props.disabled) {
          Object.assign(e.currentTarget.style, v.hover)
        }
      }}
      onMouseLeave={(e) => {
        if (!props.disabled) {
          Object.assign(e.currentTarget.style, v.style, extStyle)
        }
      }}
      {...props}
    />
  )
}
