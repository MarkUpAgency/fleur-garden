"use client"

import React from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { ReviewCard } from "@/components/pages/home/review-card";
import Container from "@/components/shared/container";
import Autoplay from "embla-carousel-autoplay";
import { useTranslations } from "next-intl";
import { Review } from "@/types";

export function CarouselWithReviews({ comments }: { comments: Review[] }) {
    const t = useTranslations("reviews")

    if (comments.length === 0) return null;

    return (
        <div className="px-4 md:px-0 pb-[72px]">
            <Carousel
                plugins={[
                    Autoplay({
                        delay: 3000, // Autoplay delay in milliseconds (e.g., 3 seconds)
                        stopOnInteraction: false, // Optional: Set to true to stop autoplay on user interaction
                    }),
                ]}
                className="mt-4">
                <Container>
                    <div className="flex items-center justify-between">
                        <h2 className="text-[36px] font-medium">{t("title")}</h2>
                        <div className="flex items-center space-x-2">
                            <CarouselPrevious className="border w-12 h-12 rounded-full p-1 static translate-y-0" />
                            <CarouselNext className="border w-12 h-12 rounded-full p-1 static translate-y-0" />
                        </div>
                    </div>
                </Container>
                <CarouselContent>
                    {comments.map((review, index) => (
                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4">
                            <ReviewCard review={review} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
}