'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UtensilsCrossed } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getMeals, type EatsMeal } from '@/lib/api/eats';
import { MealCard } from './MealCard';
import { cn } from '@/lib/utils';

export function MenuGrid() {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['eats-meals'],
    queryFn: () => getMeals(),
  });

  const meals = Array.isArray(data?.data?.data) ? data.data.data : 
                Array.isArray(data?.data) ? (data.data as unknown as EatsMeal[]) : [];

  // Derive unique categories from fetched meals
  const categories = ['all', ...Array.from(new Set(meals.map((m) => m.category).filter(Boolean)))];

  const filtered =
    activeCategory === 'all'
      ? meals
      : meals.filter((m) => m.category === activeCategory);

  return (
    <div className="flex flex-col gap-4 min-h-0 flex-1">
      {/* Category filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
              activeCategory === cat
                ? 'bg-[#B01817] text-white border-[#B01817]'
                : 'border-border text-muted-foreground hover:border-[#B01817]/50 hover:text-foreground'
            )}
          >
            {cat === 'all' ? 'Tout' : cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <UtensilsCrossed className="size-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Aucun plat disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      )}
    </div>
  );
}
