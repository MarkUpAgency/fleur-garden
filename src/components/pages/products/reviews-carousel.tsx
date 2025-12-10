"use client"

import React from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Container from "@/components/shared/container";
import Autoplay from "embla-carousel-autoplay";
import { Star } from "lucide-react";
import { Review } from "@/types";
import { useTranslations } from "next-intl";

export function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
    const t = useTranslations("reviews")
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
                <Container className="md:!px-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-medium">{reviews.length} {t("review")}</h2>
                        <div className="flex items-center space-x-2">
                            <CarouselPrevious className="border w-12 h-12 rounded-full p-1 static translate-y-0" />
                            <CarouselNext className="border w-12 h-12 rounded-full p-1 static translate-y-0" />
                        </div>
                    </div>
                </Container>
                <CarouselContent>
                    {reviews.length > 0 ? reviews.map((review, index) => (
                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                            <ReviewCard review={review} />
                        </CarouselItem>
                    )) : <CarouselItem className="basis-full">
                        <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">{t("no_reviews")}</p>
                        </div>
                    </CarouselItem>}
                </CarouselContent>
            </Carousel>
        </div>
    );
}

function ReviewCard({ review }: { review: Review }) {
    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <Star
                    key={i}
                    fill={i < rating ? "#F59E0B" : "none"}
                    className="h-3 w-3 text-[#FF9500]"
                />
            );
        }
        return stars;
    };

    return (
        <div className="bg-card rounded-[12px] p-4 border border-[#F2F4F8] mt-12">
            <div className="flex space-x-4">
                <p className="w-10 h-10 bg-black rounded-full flex text-white items-center justify-center" >{review.user_id.name.charAt(0)}</p>
                <div>
                    <h4 className="font-semibold text-foreground">{review.user_id.name} {review.user_id.surname}</h4>
                    <p className="text-xs text-muted-foreground">{review.created_at}</p>
                </div>
                <div className="ml-auto flex items-center gap-1">{renderStars(review.star)}</div>
            </div>
            <p className="text-sm mt-2 text-muted-foreground">{review.description}</p>
        </div>
    );
}