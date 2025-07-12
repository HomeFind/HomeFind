'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from './locale-switcher';

export function Header() {
  const t = useTranslations('metadata');

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-none px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">RTD</h1>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}