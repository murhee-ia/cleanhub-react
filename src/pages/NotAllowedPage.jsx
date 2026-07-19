import { Link } from 'react-router-dom'

export default function NotAllowedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center p-8 text-center">
      <h1 className="m-0 font-serif text-3xl text-foreground">Not allowed</h1>
      <p className="mt-2 text-muted">
        Your account doesn&apos;t have access to that page.
      </p>
      <Link to="/" className="mt-4 text-primary underline">
        Back to home
      </Link>
    </main>
  )
}
