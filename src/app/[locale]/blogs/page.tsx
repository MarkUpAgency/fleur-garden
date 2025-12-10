"use client"
import { BlogCard } from "@/components/pages/blogs/blog-card"
import Container from "@/components/shared/container"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { getBlogs } from "@/services/blogs/api"
import { useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"

export default function BlogGrid() {
    const t = useTranslations("blogs")
    const { locale } = useParams<{ locale: string }>()
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400)
        return () => clearTimeout(t)
    }, [search])

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        isLoading,
        isError,
    } = useInfiniteQuery({
        queryKey: ["blogs", locale, { search: debouncedSearch }],
        queryFn: ({ pageParam }) => getBlogs(locale, pageParam ?? 1, debouncedSearch || undefined),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const nextUrl = lastPage.links?.next
            if (!nextUrl) return undefined
            const url = new URL(nextUrl)
            const pageParam = url.searchParams.get("page")
            return pageParam ? Number(pageParam) : undefined
        },
    })

    const posts = useMemo(() => (data?.pages ?? []).flatMap((p) => p.data), [data])

    const sentinelRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!sentinelRef.current) return
        if (!hasNextPage || isFetchingNextPage) return
        const observer = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) fetchNextPage()
        }, { rootMargin: "200px" })
        const el = sentinelRef.current
        observer.observe(el)
        return () => observer.unobserve(el)
    }, [fetchNextPage, hasNextPage, isFetchingNextPage])

    return (
        <section className="w-full py-9">
            <Container>
                <div className="mb-12">
                    <h1 className="text-[32px] font-semibold text-foreground mb-8">{t("title")}</h1>
                    <div className="relative w-full sm:w-2/3 lg:w-1/3">
                        <Input
                            type="text"
                            placeholder="Search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-4 pr-12 h-12 py-4 border border-gray-300 rounded-[16px] focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                        <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                </div>
                <div className="space-y-8">
                    {isError && <p className="text-sm text-red-500">Xəta baş verdi.</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <BlogCard key={post.slug} post={post} />
                        ))}
                        {(isLoading || isFetchingNextPage) && Array.from({ length: 6 }).map((_, i) => (
                            <div key={`skeleton-${i}`} className="animate-pulse h-64 bg-gray-100 rounded-lg" />
                        ))}
                    </div>

                    <div ref={sentinelRef} className="h-10" />
                    {!hasNextPage && status === "success" && posts.length === 0 && (
                        <p className="text-center text-muted-foreground">Məlumat tapılmadı</p>
                    )}
                </div>
            </Container>
        </section>
    )
}
