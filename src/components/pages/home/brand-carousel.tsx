"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Partner } from "@/types/home"
import Image from "next/image"

export function BrandCarousel({ partners }: { partners: Partner[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const scrollWidth = scrollContainer.scrollWidth

    let scrollPosition = 0
    const speed = 1.0 // pixels per frame

    const animate = () => {
      scrollPosition += speed

      // Reset position when we've scrolled past half the content
      if (scrollPosition >= scrollWidth / 2) {
        scrollPosition = 0
      }

      scrollContainer.scrollLeft = scrollPosition
      requestAnimationFrame(animate)
    }

    const animationId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <div className="w-full overflow-hidden bg-background md:py-8">
      <div
        ref={scrollRef}
        className="flex justify-center gap-16 overflow-hidden"
        style={{
          scrollBehavior: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Duplicate the brands array to create seamless loop */}
        {[...partners].map((brand, index) => (
          <div
            key={`${brand}-${index}`}
            className={cn(
              "flex-shrink-0 flex items-center justify-center",
              "text-4xl font-medium",
              "hover:text-foreground transition-colors duration-300",
              "whitespace-nowrap select-none",
            )}
          >
            <Image src={brand.logo} alt={brand.name} width={150} height={150} />
          </div>
        ))}
      </div>
    </div>
  )
}
