import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Sliders } from 'lucide-react';
import { FiltersPanel } from './filters-panel';

interface MobileFilterDialogProps {
  triggerClassName?: string;
}

export function MobileFilterDialog({ triggerClassName }: MobileFilterDialogProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`gap-2 ${triggerClassName}`}
        >
          <Sliders className="h-4 w-4" />
          Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 h-[90vh] max-h-screen overflow-hidden">
        <FiltersPanel 
          onClose={() => setOpen(false)} 
          className="border-none shadow-none rounded-none h-full"
        />
      </DialogContent>
    </Dialog>
  );
} 