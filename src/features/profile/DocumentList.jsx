import { FileText } from 'lucide-react'

// documents: array of { name, url } (name = original filename), per the resource.
export default function DocumentList({ documents = [], emptyLabel = 'No documents uploaded' }) {
  if (!documents.length) {
    return <p className="text-sm text-muted">{emptyLabel}</p>
  }
  return (
    <ul className="flex flex-col gap-2">
      {documents.map((doc) => (
        <li key={doc.url}>
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary underline"
          >
            <FileText className="size-4" aria-hidden="true" />
            {doc.name}
          </a>
        </li>
      ))}
    </ul>
  )
}
