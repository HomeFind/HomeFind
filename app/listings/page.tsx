'use client';

import React from 'react';
import { FiltersPanel, FilterProvider, MobileFilterDialog } from '@/components/filters';

export default function ListingsPage() {
  return (
    <div className="container mx-auto py-8">
      <FilterProvider>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Filter Panel - Visible on desktop */}
          <div className="hidden md:block w-full md:w-80 shrink-0">
            <FiltersPanel />
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Property Listings</h1>
              
              {/* Mobile Filter Button - Opens filter dialog on mobile */}
              <div className="md:hidden">
                <MobileFilterDialog />
              </div>
            </div>
            
            {/* Placeholder for actual listing items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div 
                  key={i} 
                  className="bg-card rounded-lg shadow-sm border overflow-hidden"
                >
                  <div className="aspect-video bg-muted" />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">Example Property {i + 1}</h3>
                    <p className="text-muted-foreground text-sm mb-2">
                      {['City Center', 'Downtown', 'Suburb'][i % 3]}
                    </p>
                    <div className="flex justify-between">
                      <span className="font-medium text-primary">
                        ${Math.floor(Math.random() * 300000) + 100000}
                      </span>
                      <span className="text-sm">
                        {Math.floor(Math.random() * 5) + 1} bd | {Math.floor(Math.random() * 3) + 1} ba
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FilterProvider>
    </div>
  );
} 