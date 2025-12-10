import React from "react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"

import Container from "@/components/shared/container"
import { Button } from "@/components/ui/button"
import { Banner } from "@/types/home"

export function HeroBanner({
    banner
}: {
    banner: Banner
}) {
    return (
        <section className="w-full">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-2 rounded-xl overflow-hidden bg-background">
                    <div className="relative bg-[#F6F6F6] flex items-center">
                        <div className="w-full px-6 sm:px-10 py-10 md:py-16 text-center">
                            <p className="text-2xl text-center text-primary mb-4 uppercase">
                                BYREDO
                            </p>
                            <h1 className="text-3xl sm:text-4xl md:text-[56px] font-semibold leading-tight text-primary">
                                {banner.title}
                            </h1>

                            <p className="text-xl text-center text-muted-foreground mb-4 mt-3 uppercase">
                                {banner.description}
                            </p>
                            <div className="mt-8">
                                <Button asChild className="bg-white border border-primary text-primary hover:bg-primary hover:text-white">
                                    <Link href={banner.btn_link} aria-label="ctaText">
                                        {banner.btn_text}
                                        <span aria-hidden>→</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="hidden lg:block absolute right-0 top-0 h-full w-[30px] bg-foreground/80" />
                    </div>

                    <div className="relative h-[260px] sm:h-[320px] md:h-[420px] lg:h-[520px]">
                        <Image
                            src={banner.image}
                            alt="Banner image"
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority
                            className="object-cover"
                        />
                    </div>
                </div>
            </Container>
        </section>
    )
}

export default HeroBanner


