import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Sliders } from 'lucide-react';
import { StaticFiltersPanel } from './static-filters-panel';
import { useTranslations } from 'next-intl';
import { VisuallyHidden } from '@/components/ui/visually-hidden';

interface MobileFilterDialogProps {
  triggerClassName?: string;
}

export function MobileFilterDialog({ triggerClassName }: MobileFilterDialogProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('filters');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 ${triggerClassName}`}
        >
          <Sliders className="h-4 w-4" />
          {t('title')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 h-[90vh] max-h-screen overflow-hidden [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>{t('title')}</DialogTitle>
        </VisuallyHidden>
        <StaticFiltersPanel
          onClose={() => setOpen(false)}
          className="border-none shadow-none rounded-none h-full"
        />
      </DialogContent>
    </Dialog>
  );
} 