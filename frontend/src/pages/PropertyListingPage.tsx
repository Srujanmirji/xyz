import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { PropertyCard, type Property } from '../components/PropertyCard';

export const PropertyListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(true); // Default to split-screen map search

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [type, setType] = useState(searchParams.get('type') || 'Property Type');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [bathrooms, setBathrooms] = useState(searchParams.get('bathrooms') || '');
  const [sortBy, setSortBy] = useState('date-desc');

  // Map States
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [nearbyFilter, setNearbyFilter] = useState<'schools' | 'hospitals' | 'restaurants' | null>(null);

  // Mock nearby places generator
  const getNearbyPlaces = (prop: Property | null, filter: string | null) => {
    if (!prop) return [];
    if (!filter) return [];
    if (filter === 'schools') {
      return [
        { name: `${prop.city} High School`, distance: '0.8 miles', rating: '9/10' },
        { name: 'Pinecrest Elementary School', distance: '1.2 miles', rating: '8/10' },
      ];
    }
    if (filter === 'hospitals') {
      return [
        { name: `${prop.city} Memorial Hospital`, distance: '2.3 miles', rating: '24/7' },
        { name: 'Oakridge Medical Center', distance: '3.1 miles', rating: 'Urgent Care' },
      ];
    }
    return [
      { name: 'The Glass Bistro', distance: '0.3 miles', rating: '$$$' },
      { name: 'Skywood Cafe & Bakery', distance: '0.5 miles', rating: '$$' },
    ];
  };

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (city) params.append('city', city);
      if (type && type !== 'Property Type') params.append('type', type);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (bedrooms) params.append('bedrooms', bedrooms);
      if (bathrooms) params.append('bathrooms', bathrooms);
      if (sortBy) params.append('sortBy', sortBy);

      const res = await axios.get(`/properties?${params.toString()}`);
      if (res.data.success) {
        setProperties(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedProperty(res.data.data[0]);
        } else {
          setSelectedProperty(null);
        }
      }
    } catch (error) {
      console.error('Error loading properties', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [searchParams, sortBy]);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (city) params.append('city', city);
    if (type && type !== 'Property Type') params.append('type', type);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (bedrooms) params.append('bedrooms', bedrooms);
    if (bathrooms) params.append('bathrooms', bathrooms);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setCity('');
    setType('Property Type');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setBathrooms('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="pt-20 min-h-screen flex flex-col bg-background">
      {/* Search Header Bar */}
      <div className="bg-surface-container border-b border-outline-variant/30 px-gutter py-4 sticky top-16 z-20 transition-colors duration-200">
        <form
          onSubmit={applyFilters}
          className="max-w-container-max mx-auto flex flex-wrap gap-3 items-center justify-between"
        >
          <div className="flex flex-wrap gap-2 flex-grow max-w-4xl">
            <input
              type="text"
              placeholder="Search by keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-sm text-on-background placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
            />
            <input
              type="text"
              placeholder="City..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-sm text-on-background placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none w-28"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-sm text-on-background focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
            >
              <option>Property Type</option>
              <option>Apartment</option>
              <option>Villa</option>
              <option>House</option>
              <option>Commercial</option>
            </select>
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-sm text-on-background placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none w-28"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-sm text-on-background placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none w-28"
            />
            <input
              type="number"
              placeholder="Beds"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-sm text-on-background placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none w-16"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-primary text-on-primary text-sm font-label-md px-5 py-2 rounded-lg hover:bg-primary-container active:scale-95 transition-all"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="bg-surface-container-high text-on-background text-sm font-label-md px-4 py-2 rounded-lg hover:bg-surface-container-highest transition-all"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="border border-outline-variant text-on-background text-sm font-label-md px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-surface-container-low transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">map</span>
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
        </form>
      </div>

      {/* Main Listing Layout split */}
      <div className="flex-grow flex relative">
        {/* Left Side: Property Cards Grid */}
        <div className={`flex-1 px-gutter py-6 overflow-y-auto ${showMap ? 'max-w-xl lg:max-w-3xl' : 'max-w-container-max mx-auto'}`}>
          <div className="flex justify-between items-center mb-6">
            <p className="text-on-surface-variant text-sm">
              Found <span className="font-bold text-on-background">{properties.length}</span> properties
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant font-label-md">Sort By</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface border border-outline-variant/50 rounded-lg px-2 py-1 text-xs text-on-background focus:outline-none"
              >
                <option value="date-desc">Newest Listings</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="area-desc">Square Footage</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className={`grid gap-6 ${showMap ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4'}`}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-surface-container rounded-lg h-80" />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className={`grid gap-6 ${showMap ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4'}`}>
              {properties.map((property) => (
                <div
                  key={property.id}
                  onClick={() => setSelectedProperty(property)}
                  className={`cursor-pointer rounded-lg border transition-all ${
                    selectedProperty?.id === property.id
                      ? 'ring-2 ring-primary border-transparent'
                      : 'border-transparent'
                  }`}
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-surface-container rounded-xl border border-outline-variant/25">
              <span className="material-symbols-outlined text-[48px] text-outline mb-2">search_off</span>
              <p className="text-on-surface-variant font-bold">No properties matched your criteria.</p>
              <button onClick={clearFilters} className="text-primary mt-2 text-sm hover:underline">Reset filters</button>
            </div>
          )}
        </div>

        {/* Right Side: Map search panel */}
        {showMap && (
          <div className="hidden md:block flex-1 sticky top-[136px] h-[calc(100vh-136px)] bg-surface-container-low border-l border-outline-variant/30 overflow-hidden">
            {/* Interactive Mock Map Canvas */}
            <div className="w-full h-[65%] bg-surface-container-high relative flex items-center justify-center overflow-hidden">
              {/* Map grids/topography simulation */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#fff_1px,transparent_1px)]"></div>
              
              {/* Map search suggestions / Directions indicator */}
              <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
                <div className="bg-surface/90 backdrop-blur-md px-4 py-2 rounded-lg border border-outline-variant/30 flex items-center gap-2 text-xs flex-grow max-w-sm">
                  <span className="material-symbols-outlined text-primary text-[16px]">navigation</span>
                  <span className="text-on-background line-clamp-1">
                    {selectedProperty
                      ? `Directions to ${selectedProperty.address}`
                      : 'Select a property to get details'}
                  </span>
                </div>
              </div>

              {/* Property pins rendering */}
              {properties.map((prop, idx) => {
                // Generate a pseudo-random position on the map canvas
                const leftPercent = 20 + ((idx * 27) % 60);
                const topPercent = 20 + ((idx * 33) % 60);

                const isSelected = selectedProperty?.id === prop.id;

                return (
                  <button
                    key={prop.id}
                    onClick={() => setSelectedProperty(prop)}
                    style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-1.5 rounded-full shadow-lg border transition-all duration-300 ${
                      isSelected
                        ? 'bg-primary text-on-primary scale-110 z-10 border-primary'
                        : 'bg-surface text-on-background hover:bg-surface-container border-outline-variant/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">home</span>
                    <span className="text-xs font-bold font-geist">${(prop.price / 1000000).toFixed(1)}M</span>
                  </button>
                );
              })}

              <span className="text-outline text-xs absolute bottom-4 right-4 bg-surface/80 px-2 py-1 rounded">
                Interactive Map Exploration
              </span>
            </div>

            {/* Selected Property Details Context (Schools, Hospitals, Restaurants) */}
            <div className="h-[35%] p-6 border-t border-outline-variant/30 overflow-y-auto bg-surface flex flex-col justify-between">
              {selectedProperty ? (
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        {selectedProperty.type} • {selectedProperty.bedrooms} Beds
                      </span>
                      <h4 className="font-bold text-on-background text-lg leading-tight mt-0.5">
                        {selectedProperty.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {selectedProperty.address}, {selectedProperty.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary text-lg">
                        ${selectedProperty.price.toLocaleString()}
                      </p>
                      <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold">
                        {selectedProperty.status}
                      </span>
                    </div>
                  </div>

                  {/* Amenities / Proximity context toggles */}
                  <div className="flex gap-2 mt-4 border-t border-outline-variant/10 pt-4">
                    <button
                      onClick={() => setNearbyFilter(nearbyFilter === 'schools' ? null : 'schools')}
                      className={`px-3 py-1 rounded-full text-xs font-label-md flex items-center gap-1 border transition-all ${
                        nearbyFilter === 'schools'
                          ? 'bg-primary/10 border-primary text-primary font-bold'
                          : 'border-outline-variant/40 hover:bg-surface-container-low'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">school</span> Schools
                    </button>
                    <button
                      onClick={() => setNearbyFilter(nearbyFilter === 'hospitals' ? null : 'hospitals')}
                      className={`px-3 py-1 rounded-full text-xs font-label-md flex items-center gap-1 border transition-all ${
                        nearbyFilter === 'hospitals'
                          ? 'bg-primary/10 border-primary text-primary font-bold'
                          : 'border-outline-variant/40 hover:bg-surface-container-low'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">local_hospital</span> Medical
                    </button>
                    <button
                      onClick={() => setNearbyFilter(nearbyFilter === 'restaurants' ? null : 'restaurants')}
                      className={`px-3 py-1 rounded-full text-xs font-label-md flex items-center gap-1 border transition-all ${
                        nearbyFilter === 'restaurants'
                          ? 'bg-primary/10 border-primary text-primary font-bold'
                          : 'border-outline-variant/40 hover:bg-surface-container-low'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">restaurant</span> Restaurants
                    </button>
                  </div>

                  {/* Render nearby details list */}
                  {nearbyFilter && (
                    <div className="mt-3 bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20 flex flex-col gap-2">
                      {getNearbyPlaces(selectedProperty, nearbyFilter).map((place, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span className="text-on-background font-medium">{place.name}</span>
                          <div className="flex gap-2 text-on-surface-variant font-geist">
                            <span>{place.distance}</span>
                            <span className="text-primary font-bold">{place.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-on-surface-variant text-sm">
                  Select a property on the map or list to view neighborhood insights.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
