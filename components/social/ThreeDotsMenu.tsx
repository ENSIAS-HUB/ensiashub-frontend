'use client';

import { useState } from 'react';
import {
  Bookmark,
  Copy,
  Flag,
  MoreHorizontal,
  Share2,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ShareModal } from './ShareModal';
import type { SocialableType, ReportReason } from '@/lib/types/social';
import { useSaveToggle, useReport } from '@/lib/hooks/useSocial';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ThreeDotsMenuProps {
  type: SocialableType;
  id: string | number;
  isSaved?: boolean;
  resourceUrl?: string;
  canDelete?: boolean;
  onDelete?: () => void;
}

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate', label: 'Contenu inapproprié' },
  { value: 'harassment', label: 'Harcèlement' },
  { value: 'misinformation', label: 'Désinformation' },
  { value: 'other', label: 'Autre' },
];

export function ThreeDotsMenu({
  type,
  id,
  isSaved = false,
  resourceUrl,
  canDelete = false,
  onDelete,
}: ThreeDotsMenuProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>('spam');
  const [reportDetails, setReportDetails] = useState('');

  const { save, unsave } = useSaveToggle(type, id);
  const reportMutation = useReport(type, id);

  const handleCopyLink = async () => {
    const url = resourceUrl ?? window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Lien copié !');
    } catch {
      toast.error('Impossible de copier le lien');
    }
  };

  const handleSaveToggle = () => {
    if (isSaved) {
      unsave.mutate();
    } else {
      save.mutate();
    }
  };

  const handleReport = () => {
    reportMutation.mutate(
      { reason: reportReason, details: reportDetails || undefined },
      { onSuccess: () => { setReportOpen(false); setReportDetails(''); } }
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0 text-muted-foreground"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleSaveToggle}>
            <Bookmark className="size-3.5 mr-1.5" />
            {isSaved ? 'Retirer la sauvegarde' : 'Sauvegarder'}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShareOpen(true)}>
            <Share2 className="size-3.5 mr-1.5" />
            Partager
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleCopyLink}>
            <Copy className="size-3.5 mr-1.5" />
            Copier le lien
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setReportOpen(true)}
          >
            <Flag className="size-3.5 mr-1.5" />
            Signaler
          </DropdownMenuItem>

          {canDelete && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="size-3.5 mr-1.5" />
              Supprimer
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Share modal */}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        type={type}
        id={id}
        resourceUrl={resourceUrl}
      />

      {/* Report dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Flag className="size-4" />
              Signaler ce contenu
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Select
              value={reportReason}
              onValueChange={(v) => setReportReason(v as ReportReason)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une raison" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Détails supplémentaires (optionnel)"
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              rows={3}
              maxLength={1000}
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setReportOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReport}
              disabled={reportMutation.isPending}
            >
              Envoyer le signalement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
