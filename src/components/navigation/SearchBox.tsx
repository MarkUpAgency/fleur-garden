"use client"

import { useRouter } from "@/i18n/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { History, Search, Star, X } from "lucide-react"
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover"
import { useTranslations } from "next-intl"
import Image from "next/image"

interface SearchBoxProps {
  initialQuery?: string
  className?: string
  latestProducts?: import("@/types").Product[]
}

export function SearchBox({ initialQuery = "", className, latestProducts = [] }: SearchBoxProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [open, setOpen] = useState(false)
  const [version, setVersion] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const t = useTranslations("product_grid")

  const storageKey = "recent-searches"
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(storageKey)
      setRecentSearches(raw ? (JSON.parse(raw) as string[]) : [])
    } catch {
      setRecentSearches([])
    }
  }, [version])

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  const persistRecent = useCallback((term: string) => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(storageKey)
      const list: string[] = raw ? (JSON.parse(raw) as string[]) : []
      const next = [term, ...list.filter((x) => x.toLowerCase() !== term.toLowerCase())].slice(0, 8)
      window.localStorage.setItem(storageKey, JSON.stringify(next))
      setVersion((v) => v + 1)
    } catch {
      // ignore persistence errors
    }
  }, [])

  const clearRecent = useCallback(() => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.removeItem(storageKey)
      setVersion((v) => v + 1)
    } catch {
      // ignore
    }
  }, [])

  const removeRecent = useCallback((term: string) => {
    if (typeof window === "undefined") return
    try {
      const next = recentSearches.filter((x) => x !== term)
      window.localStorage.setItem(storageKey, JSON.stringify(next))
      setRecentSearches(next)
      setVersion((v) => v + 1)
    } catch {
      // ignore
    }
  }, [recentSearches])

  const go = useCallback(() => {
    const trimmed = query.trim()
    if (!trimmed) return
    router.push(`/search?search=${encodeURIComponent(trimmed)}`)
    persistRecent(trimmed)
    setQuery("")
    setOpen(false)
  }, [router, query, persistRecent])

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      go()
      setQuery("")
    }
  }, [go])

  return (
    <div ref={containerRef} className={`relative w-full ${className ?? ""}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="relative w-full">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              onClick={() => setOpen(true)}
              onKeyDown={onKeyDown}
              placeholder={t("search")}
              className="w-full pl-4 pr-12 h-12 py-4 border border-gray-300 rounded-[16px] focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
            <Button
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white rounded-full w-8 h-8 p-0 hover:bg-gray-800"
              onClick={go}
              aria-label="search"
              type="button"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </PopoverAnchor>
        <PopoverContent align="start" sideOffset={8} className="w-[min(500px,90vw)] p-0 rounded-2xl border shadow-xl">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-base font-semibold">{t("last_searches")}</p>
              <button onClick={clearRecent} className="text-sm text-muted-foreground hover:text-foreground">{t("clear")}</button>
            </div>
            <div className="space-y-2 h-[200px] overflow-y-auto">
              {recentSearches.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("no_searches")}</p>
              ) : (
                recentSearches.map((item) => (
                  <div key={item}>
                    <button
                      onClick={() => {
                        setQuery(item)
                        router.push(`/search?search=${encodeURIComponent(item)}`)
                        persistRecent(item)
                        setOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <History size={14} />
                        <span>{item}</span>
                      </div>
                      <button
                        type="button"
                        aria-label="remove-recent"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeRecent(item)
                        }}
                        className="p-1 rounded hover:bg-muted/60"
                      >
                        <X size={14} />
                      </button>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* <div className="h-px bg-border my-4" /> */}
            {/* <div className="mb-3">
              <p className="text-base font-semibold">{t("most_searched")}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                "YSL Libre Parfüm",
                "YSL Libre",
                "Gucci parfüm",
                "Chanel",
                "Dior",
                "Calvin Klein",
                "Armani",
              ].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setQuery(term)
                    router.push(`/search?search=${encodeURIComponent(term)}`)
                    persistRecent(term)
                    setOpen(false)
                  }}
                  className="px-4 py-2 rounded-[8px] bg-[#FAFCFF] border border-[#F2F4F8] hover:bg-muted text-sm font-medium"
                >
                  {term}
                </button>
              ))}
            </div> */}

            {latestProducts && latestProducts.length > 0 && (
              <>
                <div className="h-px bg-border my-4" />
                <div className="mb-3">
                  <p className="text-base font-semibold">{t("title")}</p>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {latestProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        router.push(`/products/${p.slug}`)
                        setOpen(false)
                      }}
                      className="min-w-[280px] flex items-center gap-4 rounded-2xl border px-4 py-3 hover:bg-muted/50"
                    >
                      {
                        p.image && p.image !== null && p.image !== 'null' ? (
                          <Image width={56} height={90} src={p.thumb_image || p.image} alt={p.name} className="w-[64px] h-[90px] object-cover rounded-xl bg-white" />
                        ) : (
                          <div className="w-full h-full bg-[#F2F4F8] rounded-md">
                            <span className="text-[#77777B] text-xs">No Image</span>
                          </div>
                        )
                      }
                      <div className="text-left w-full h-full flex flex-col justify-between">
                        <div className="w-full">
                          <div className="flex items-center justify-between w-full">
                            <p className="font-medium leading-tight truncate max-w-[180px]">{p.name}</p>
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="w-4 h-4 fill-[#FF9500] text-[#FF9500]" />
                              <span className="text-sm text-[#FF9500]">{p.star}</span>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm truncate max-w-[180px]">{p.brand_name}</p>
                        </div>
                        <p className="text-foreground font-semibold mt-1 text-sm">{p.price} USD</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}


