"use client"

import * as React from "react"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    CarouselApi,
} from "@/components/ui/carousel"
import Image from "next/image"
import { Slider } from "@/types/home"

export function ProductCarousel({ sliders }: { sliders: Slider[] }) {
    const [api, setApi] = React.useState<CarouselApi>()
    const [current, setCurrent] = React.useState(0)
    const [count, setCount] = React.useState(0)

    React.useEffect(() => {
        if (!api) {
            return
        }

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap() + 1)

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1)
        })
    }, [api])

    return (
        <div className="relative w-full h-[137px] md:h-[549px]">
            {/* Hero Banner */}
            <div className="relative flex items-center justify-center overflow-hidden">
                {/* Carousel */}
                <div className="w-full">
                    <Carousel
                        setApi={setApi}
                        className="w-full"
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                    >
                        <CarouselContent className="-ml-2 md:-ml-4">
                            {sliders.map((slider) => (
                                <CarouselItem key={slider.image} className="pl-0">
                                    <div className="border-0 bg-card/50 transition-all duration-300 hover:scale-105">
                                        <div>
                                            <div className="relative overflow-hidden">
                                                <Image
                                                    width={100}
                                                    height={100}
                                                    src={slider.image}
                                                    unoptimized
                                                    alt={`Product ${slider.image}`}
                                                    className="w-full h-[137px] md:h-[549px] object-cover"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        {/* Navigation Arrows */}
                        <CarouselPrevious className="hidden md:flex -left-12 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card" />
                        <CarouselNext className="hidden md:flex -right-12 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card" />
                    </Carousel>

                    {/* Dots Indicator */}
                    <div className="flex justify-center mt-8 space-x-2 absolute bottom-4 left-0 right-0">
                        {Array.from({ length: count }).map((_, index) => (
                            <button
                                key={index}
                                className={`w-6 h-1 rounded-full transition-all duration-300 ${index + 1 === current
                                    ? "bg-primary w-8"
                                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                                    }`}
                                onClick={() => api?.scrollTo(index)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}