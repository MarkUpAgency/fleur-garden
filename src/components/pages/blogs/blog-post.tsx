"use client"
import { useQuery } from "@tanstack/react-query"
import Container from "@/components/shared/container"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { BlogPostHeader } from "@/components/pages/blogs/blog-post-header"
import { getBlogPostQuery } from "@/services/blogs/queries"
import { BlogCard } from "@/components/pages/blogs/blog-card"
import { useTranslations } from "next-intl"

interface BlogPostClientProps {
  locale: string
  slug: string
}

export function BlogPostClient({ locale, slug }: BlogPostClientProps) {
  const t = useTranslations("blogs")
  const { data, isLoading, isError } = useQuery(getBlogPostQuery(locale, slug))

  if (isLoading) {
    return (
      <div className="py-9">
        <Container>
          <div className="h-[560px] w-full animate-pulse bg-gray-100 rounded-xl" />
        </Container>
      </div>
    )
  }

  if (isError || !data?.data) {
    return (
      <div className="py-9">
        <Container>
          <p className="text-sm text-red-500">Məlumat tapılmadı.</p>
        </Container>
      </div>
    )
  }

  const post = data.data
  const otherBlogs = data.otherBlogs ?? []

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""

  return (
    <div className="py-9">
      <Container>
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">
                {t("title")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <g clipPath="url(#clip0_295_2185)">
                <path d="M11.3333 3.3335L4.66663 12.6668" stroke="#D3D3D7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </g>
              <defs>
                <clipPath id="clip0_295_2185">
                  <rect width="16" height="16" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium">{post.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <article>
          <BlogPostHeader title={post.title} heroImage={post.image} readingTime={post.read_min} shareUrl={shareUrl} />

          <div className="prose prose-gray max-w-none md:px-12">
            <div className="mb-8 text-[#77777B] leading-relaxed [&>span]:!text-[#77777B] [&>div]:!bg-white" dangerouslySetInnerHTML={{ __html: post.description }} />
          </div>
        </article>

        {otherBlogs.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">{t("similar_blogs")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherBlogs.map((b) => (
                <BlogCard key={b.slug} post={b} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  )
}


