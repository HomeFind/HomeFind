import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="w-full max-w-none px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] py-12">
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">
        Find Your Dream Home
      </h1>
      <p className="text-xl text-muted-foreground text-center mb-8 max-w-2xl">
        Discover properties with our advanced filtering system - easily find what you're looking for using our powerful filters
      </p>
      <div className="flex gap-4">
        <Link href="/listings" passHref>
          <Button size="lg" className="px-8">
            Browse Listings
          </Button>
        </Link>
      </div>
    </div>
  );
}
