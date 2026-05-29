"use client";

import Image from "next/image";
import { getFoodImage } from "@/lib/foodImageMap";

interface Props {
  dishName: string;
  fallbackUrl?: string | null;
  size?: number;
}

export function FoodItemImage({ dishName, fallbackUrl, size = 80 }: Props) {
  const imageUrl = getFoodImage(dishName) ?? fallbackUrl ?? null;
  if (!imageUrl) return null;

  return (
    <div
      className="relative rounded-xl overflow-hidden flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <Image
        src={imageUrl}
        alt={dishName}
        fill
        className="object-cover"
        unoptimized
      />
    </div>
  );
}
