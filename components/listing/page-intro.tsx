import { Breadcrumbs } from '@/components/breadcrumbs'

export function PageIntro({
  title,
  description,
  crumbs,
}: {
  title: string
  description?: string
  crumbs: { label: string; href?: string }[]
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-8 md:px-6">
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-balance md:text-4xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">{description}</p>}
    </div>
  )
}
