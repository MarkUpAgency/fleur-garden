import { dehydrate } from "@tanstack/react-query"
import { getServerQueryClient } from "@/providers/server"
import { getBlogPostQuery } from "@/services/blogs/queries"
import { HydrationBoundary } from "@/providers/HydrationBoundary"
import { BlogPostClient } from "@/components/pages/blogs/blog-post"

interface BlogPostPageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, id } = await params
  const queryClient = getServerQueryClient()

  await queryClient.prefetchQuery(getBlogPostQuery(locale, id))
  const state = dehydrate(queryClient)

  return (
    <HydrationBoundary state={state}>
      <BlogPostClient locale={locale} slug={id} />
    </HydrationBoundary>
  )
}
