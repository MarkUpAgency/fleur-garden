import React from "react";
import { Star } from "lucide-react";
import Image from "next/image";
import { Review } from "@/types";

export function ReviewCard({ review }: { review: Review }) {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          fill={i < rating ? "#F59E0B" : "none"}
          className="h-4 w-4 text-[#FF9500]"
        />
      );
    }
    return stars;
  };

  return (
    <div className="bg-card rounded-[12px] p-4 border border-[#F2F4F8] mt-12">
      <Image src="/svgs/comma.svg" alt={review.user_id.name} width={24} height={16} />
      <div className="flex space-x-4 mt-4">
        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white" >{review.user_id.name.charAt(0)}</div>
        <div>
          <h4 className="font-semibold text-foreground">{review.user_id.name} {review.user_id.surname}</h4>
          <p className="text-xs text-muted-foreground">{review.created_at}</p>
        </div>
        <div className="ml-auto flex items-center">{renderStars(review.star)}</div>
      </div>
      <p className="text-sm mt-2 text-muted-foreground">{review.description}</p>
    </div>
  );
}