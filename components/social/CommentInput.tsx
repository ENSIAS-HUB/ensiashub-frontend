'use client';

import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface CommentInputProps {
  placeholder?: string;
  onSubmit: (content: string) => void;
  isLoading?: boolean;
  autoFocus?: boolean;
  className?: string;
  compact?: boolean;
}

export function CommentInput({
  placeholder = 'Écrire un commentaire…',
  onSubmit,
  isLoading = false,
  autoFocus = false,
  className,
  compact = false,
}: CommentInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn('flex gap-2 items-end', className)}>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={compact ? 1 : 2}
        className={cn(
          'resize-none flex-1 text-sm min-h-0',
          compact && 'py-1.5'
        )}
        disabled={isLoading}
      />
      <Button
        size="sm"
        className="h-8 w-8 p-0 shrink-0"
        onClick={handleSubmit}
        disabled={!value.trim() || isLoading}
      >
        <Send className="size-3.5" />
      </Button>
    </div>
  );
}
