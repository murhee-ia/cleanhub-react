const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  ghost: 'text-primary hover:bg-primary/10',
}

export default function Button({ variant = 'primary', className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  )
}
