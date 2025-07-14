// TODO [DEPRECATED]: Commented out dynamic filter components
// export { AttributeFilter } from './attribute-filter';
// export { FiltersPanel } from './filters-panel';
// export { SelectFilter } from './select-filter';
// export { RangeFilter } from './range-filter';
// export { ToggleFilter } from './toggle-filter';

// NEW: Static filters panel
export { StaticFiltersPanel } from './static-filters-panel';
export { MobileFilterDialog } from './mobile-filter-dialog';

// For pages that need URL persistence (like listings page), use these exports
export { FilterProvider, FilterProviderWithSearchParams } from './filter-context';

// The filters page uses FilterProviderLocal which exports useFilters with the same interface
// but we need to make sure that the original useFilters is also exported for other pages
export { useFilters } from './filter-context';

export { AppliedFilters } from './applied-filters'; 