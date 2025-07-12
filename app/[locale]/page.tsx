import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('home');

  return (
    <div className="w-full max-w-none px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] py-12">
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">
        {t('title')}
      </h1>
      <p className="text-xl text-muted-foreground text-center mb-8 max-w-2xl">
        {t('subtitle')}
      </p>
      <div className="flex gap-4">
        <Link href="/listings" passHref>
          <Button size="lg" className="px-8">
            {t('browseListings')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
