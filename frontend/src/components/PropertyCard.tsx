import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  country: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  status: string;
  featured: boolean;
  images: { imageUrl: string }[];
  agent?: { id: string; name: string; avatar?: string };
}

interface PropertyCardProps {
  property: Property;
  isFavoritedInitially?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, isFavoritedInitially = false }) => {
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(isFavoritedInitially);
  const [loading, setLoading] = useState(false);

  const getBadgeType = () => {
    if (property.featured) return { label: 'Exclusive', class: 'bg-secondary-container text-on-secondary-container' };
    if (property.price > 2000000) return { label: 'Luxury', class: 'bg-primary text-on-primary' };
    return { label: 'New Listing', class: 'bg-primary/95 text-on-primary' };
  };

  const badge = getBadgeType();

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please log in to save properties');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/properties/favorites', { propertyId: property.id });
      if (res.data.success) {
        setIsFavorited(res.data.favorited);
      }
    } catch (error) {
      console.error('Failed to toggle favorite', error);
    } finally {
      setLoading(false);
    }
  };

  const mainImage = property.images && property.images.length > 0
    ? property.images[0].imageUrl
    : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800';

  return (
    <Link
      to={`/properties/${property.id}`}
      className="property-card group bg-surface-container-lowest rounded-lg border border-outline-variant/30 overflow-hidden transition-standard hover:shadow-lg hover:border-primary/30 flex flex-col h-full"
    >
      <div className="relative h-64 overflow-hidden shrink-0">
        <img
          src={mainImage}
          alt={property.title}
          className="property-image w-full h-full object-cover transition-standard duration-500 group-hover:scale-105"
        />
        <span className={`absolute top-4 left-4 px-3 py-1 rounded-full font-label-sm text-label-sm shadow-md ${badge.class}`}>
          {badge.label}
        </span>
        <button
          onClick={handleFavoriteToggle}
          disabled={loading}
          className="absolute top-4 right-4 bg-surface/80 hover:bg-surface text-error p-2 rounded-full backdrop-blur-sm shadow-md transition-all active:scale-90"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: `'FILL' ${isFavorited ? 1 : 0}` }}
          >
            favorite
          </span>
        </button>
      </div>
      <div className="p-6 flex flex-col justify-between flex-grow">
        <div>
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="font-headline-md text-headline-md text-on-background group-hover:text-primary transition-colors text-[20px] line-clamp-1">
              {property.title}
            </h3>
            <p className="text-primary font-bold text-lg whitespace-nowrap">
              ${property.price.toLocaleString()}
            </p>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1 mb-4">
            <span className="material-symbols-outlined text-sm text-primary">location_on</span>
            {property.city}, {property.state}
          </p>
        </div>
        <div className="flex justify-between border-t border-outline-variant/20 pt-4 mt-auto">
          <div className="flex items-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">bed</span>
            <span className="font-label-md text-label-md">{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">bathtub</span>
            <span className="font-label-md text-label-md">{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">square_foot</span>
            <span className="font-label-md text-label-md">{property.area.toLocaleString()} sqft</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
