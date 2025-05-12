import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-120px)] py-12 px-4">
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
        <Link href="/filters" passHref>
          <Button size="lg" variant="outline" className="px-8">
            Explore Filters
          </Button>
        </Link>
      </div>
    </div>
  );
}
