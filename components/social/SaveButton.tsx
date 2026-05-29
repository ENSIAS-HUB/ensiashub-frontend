"use client";

import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SocialableType } from "@/lib/types/social";
import { useSaveToggle } from "@/lib/hooks/useSocial";

interface SaveButtonProps {
  type: SocialableType;
  id: string | number;
  isSaved: boolean;
  onToggle?: (saved: boolean) => void;
  className?: string;
}

export function SaveButton({
  type,
  id,
  isSaved,
  onToggle,
  className,
}: SaveButtonProps) {
  const { save, unsave } = useSaveToggle(type, id);

  const handleClick = () => {
    if (isSaved) {
      unsave.mutate(undefined, { onSuccess: () => onToggle?.(false) });
    } else {
      save.mutate(undefined, { onSuccess: () => onToggle?.(true) });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "gap-1.5 text-xs h-8",
        isSaved ? "text-[#B01817]" : "text-muted-foreground",
        className,
      )}
      onClick={handleClick}
      disabled={save.isPending || unsave.isPending}
    >
      <Bookmark
        className="size-4"
        fill={isSaved ? "#B01817" : "none"}
        stroke={isSaved ? "#B01817" : "currentColor"}
      />
    </Button>
  );
}
