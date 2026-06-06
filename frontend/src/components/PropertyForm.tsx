import React, { useState } from 'react';
import axios from 'axios';

interface PropertyFormProps {
  defaultListingType?: 'SALE' | 'RENT';
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({ defaultListingType = 'SALE', onSuccess, onCancel }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newType, setNewType] = useState('Apartment');
  const [newBeds, setNewBeds] = useState('2');
  const [newBaths, setNewBaths] = useState('2');
  const [newArea, setNewArea] = useState('1200');
  const [newAmenities, setNewAmenities] = useState('');
  const [newImages, setNewImages] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice || !newAddress || !newCity) return;

    setFormLoading(true);
    try {
      const imgArray = newImages
        ? newImages.split(',').map((s) => s.trim())
        : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'];

      const res = await axios.post('/properties', {
        title: newTitle,
        price: newPrice,
        address: newAddress,
        city: newCity,
        type: newType,
        listingType: defaultListingType,
        bedrooms: newBeds,
        bathrooms: newBaths,
        area: newArea,
        description: newDesc,
        amenities: newAmenities,
        images: imgArray,
      });

      if (res.data.success) {
        setNewTitle('');
        setNewPrice('');
        setNewAddress('');
        setNewCity('');
        setNewAmenities('');
        setNewImages('');
        setNewDesc('');
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Failed to create property', error);
      alert('Failed to submit listing. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreateProperty} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="block text-xs font-label-md text-on-surface-variant">Listing Title</label>
        <input
          type="text"
          required
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Azure Heights Villa"
          className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-label-md text-on-surface-variant">Price (₹) {defaultListingType === 'RENT' ? '/ month' : ''}</label>
        <input
          type="number"
          required
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          placeholder={defaultListingType === 'RENT' ? "2500" : "2450000"}
          className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-label-md text-on-surface-variant">Street Address</label>
        <input
          type="text"
          required
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          placeholder="100 Crestview Dr"
          className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-label-md text-on-surface-variant">City</label>
        <input
          type="text"
          required
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
          placeholder="Los Angeles"
          className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-label-md text-on-surface-variant">Type</label>
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option>Apartment</option>
          <option>Villa</option>
          <option>House</option>
          <option>Commercial</option>
        </select>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <label className="block text-xs font-label-md text-on-surface-variant">Beds</label>
          <input
            type="number"
            value={newBeds}
            onChange={(e) => setNewBeds(e.target.value)}
            className="w-full bg-background border border-outline-variant rounded-lg px-2 py-2 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-label-md text-on-surface-variant">Baths</label>
          <input
            type="number"
            value={newBaths}
            onChange={(e) => setNewBaths(e.target.value)}
            className="w-full bg-background border border-outline-variant rounded-lg px-2 py-2 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-label-md text-on-surface-variant">Area (sqft)</label>
          <input
            type="number"
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            className="w-full bg-background border border-outline-variant rounded-lg px-2 py-2 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
      <div className="space-y-1 md:col-span-2">
        <label className="block text-xs font-label-md text-on-surface-variant">Amenities (comma separated)</label>
        <input
          type="text"
          value={newAmenities}
          onChange={(e) => setNewAmenities(e.target.value)}
          placeholder="Pool, Home Automation, Solar Panels"
          className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="space-y-1 md:col-span-2">
        <label className="block text-xs font-label-md text-on-surface-variant">Image URLs (comma separated)</label>
        <input
          type="text"
          value={newImages}
          onChange={(e) => setNewImages(e.target.value)}
          placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
          className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="space-y-1 md:col-span-2">
        <label className="block text-xs font-label-md text-on-surface-variant">Property Description</label>
        <textarea
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          placeholder="Detail the layout, structures, context, and premium features..."
          rows={4}
          className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="md:col-span-2 pt-4 flex gap-4 justify-end border-t border-outline-variant/20">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-surface-container-high hover:bg-surface-container-highest text-on-background px-6 py-2 rounded-lg text-sm font-label-md transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={formLoading}
          className="bg-primary text-on-primary px-6 py-2 rounded-lg text-sm font-label-md hover:bg-primary-container transition-colors disabled:opacity-50"
        >
          {formLoading ? 'Submitting...' : 'Submit Listing'}
        </button>
      </div>
    </form>
  );
};
