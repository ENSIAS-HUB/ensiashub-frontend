'use client';

import Image from 'next/image';
import { Plus, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEatsStore } from '@/lib/store/eatsStore';
import type { EatsMeal } from '@/lib/api/eats';

interface MealCardProps {
  meal: EatsMeal;
}

export function MealCard({ meal }: MealCardProps) {
  const addToCart = useEatsStore((s) => s.addToCart);

  return (
    <div className="group relative rounded-xl border border-border bg-card overflow-hidden cursor-pointer hover:border-[#B01817]/40 transition-all duration-200">
      {/* Image */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        {meal.image_url ? (
          <Image
            src={meal.image_url}
            alt={meal.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <UtensilsCrossed className="size-8 text-muted-foreground/30" />
          </div>
        )}
        {!meal.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-xs text-white/70 font-mono">Indisponible</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium truncate">{meal.name}</p>
        {meal.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{meal.description}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-[#B01817]">
            {meal.price.toFixed(2)} MAD
          </span>
          <Button
            size="icon"
            disabled={!meal.available}
            className="size-7 bg-[#B01817] hover:bg-[#C41F1E] rounded-md"
            onClick={() =>
              addToCart({
                mealId: meal.id,
                name: meal.name,
                price: meal.price,
                quantity: 1,
                image: meal.image_url,
              })
            }
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
