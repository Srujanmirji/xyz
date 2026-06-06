import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapView } from '../components/MapView';

// Amenities choices
const AMENITIES_LIST = [
  'WiFi', 'Parking', 'Swimming Pool', 'Gym', 'Security', 'Balcony', 
  'Elevator', 'Garden', 'Solar Panels', 'Home Automation', 'Power Backup', 'EV Charging'
];

// Mock preset image pool for Drag & Drop preview fallback
const MOCK_PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800',
];

export const RentPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 1. Basic Info State
  const [title, setTitle] = useState('');
  const [rent, setRent] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [type, setType] = useState('Apartment');
  const [availableFrom, setAvailableFrom] = useState('');

  // 2. Location State
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // 3. Details State
  const [bedrooms, setBedrooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('2');
  const [area, setArea] = useState('1200');
  const [parkingSpaces, setParkingSpaces] = useState('1');
  const [furnished, setFurnished] = useState(false);
  const [petFriendly, setPetFriendly] = useState(false);

  // 4. Amenities State
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // 5. Media State
  const [images, setImages] = useState<string[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState<number>(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 6. Description State
  const [description, setDescription] = useState('');
  const [isAiWriting, setIsAiWriting] = useState(false);

  // Auto-save & Status state
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem('rental_listing_draft');
    if (draft) {
      try {
        const data = JSON.parse(draft);
        setTitle(data.title || '');
        setRent(data.rent || '');
        setSecurityDeposit(data.securityDeposit || '');
        setType(data.type || 'Apartment');
        setAvailableFrom(data.availableFrom || '');
        setAddress(data.address || '');
        setCity(data.city || '');
        setState(data.state || '');
        setZipCode(data.zipCode || '');
        setCoords(data.coords || null);
        setBedrooms(data.bedrooms || '2');
        setBathrooms(data.bathrooms || '2');
        setArea(data.area || '1200');
        setParkingSpaces(data.parkingSpaces || '1');
        setFurnished(data.furnished || false);
        setPetFriendly(data.petFriendly || false);
        setSelectedAmenities(data.selectedAmenities || []);
        setImages(data.images || []);
        setCoverImageIndex(data.coverImageIndex || 0);
        setDescription(data.description || '');
      } catch (e) {
        console.error('Error loading draft', e);
      }
    }
  }, []);

  // Save draft logic (auto-saves 1.5 seconds after user stops typing)
  useEffect(() => {
    if (!title && !address && !description && images.length === 0) return;
    setSaveStatus('saving');

    const timer = setTimeout(() => {
      const draftObj = {
        title, rent, securityDeposit, type, availableFrom,
        address, city, state, zipCode, coords,
        bedrooms, bathrooms, area, parkingSpaces, furnished, petFriendly,
        selectedAmenities, images, coverImageIndex, description
      };
      localStorage.setItem('rental_listing_draft', JSON.stringify(draftObj));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    title, rent, securityDeposit, type, availableFrom,
    address, city, state, zipCode, coords,
    bedrooms, bathrooms, area, parkingSpaces, furnished, petFriendly,
    selectedAmenities, images, coverImageIndex, description
  ]);

  // Handle location selection from MapView
  const handleLocationSelect = (lat: number, lng: number, formattedAddress?: string) => {
    setCoords({ lat, lng });
    if (formattedAddress) {
      const parts = formattedAddress.split(',').map(s => s.trim());
      if (parts.length > 0) setAddress(parts[0]);
      if (parts.length > 1) setCity(parts[1]);
      if (parts.length > 2) setState(parts[2]);
    }
  };

  // Toggle amenities
  const handleToggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const compressImage = (base64Str: string, maxWidth = 1024, maxHeight = 1024, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64Str);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  // Real file processing helper using FileReader
  const processFiles = (files: FileList) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    setUploadProgress(10);
    
    let processedCount = 0;
    const newImages: string[] = [];

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        if (result) {
          try {
            const compressed = await compressImage(result);
            newImages.push(compressed);
          } catch (err) {
            newImages.push(result);
          }
        }
        processedCount++;
        
        // Update progress
        setUploadProgress(Math.round((processedCount / fileList.length) * 100));

        if (processedCount === fileList.length) {
          setImages((prev) => {
            const updated = [...prev];
            newImages.forEach(img => {
              if (!updated.includes(img)) updated.push(img);
            });
            return updated;
          });
          setTimeout(() => setUploadProgress(null), 1000);
        }
      };
      reader.onerror = () => {
        processedCount++;
        if (processedCount === fileList.length) {
          setTimeout(() => setUploadProgress(null), 1000);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Drag & Drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Trigger file selection input dialog
  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  // Easy fallback to mock photos if the user wants them
  const handleAddMockPhotos = () => {
    setUploadProgress(20);
    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setUploadProgress(null), 800);
          
          const nextPreset = MOCK_PRESET_IMAGES.find(url => !images.includes(url)) || MOCK_PRESET_IMAGES[0];
          setImages((prevImgs) => [...prevImgs, nextPreset]);
          return 100;
        }
        return prev + 40;
      });
    }, 200);
  };

  // Manual URL Add fallback
  const handleAddImageUrl = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      setImages([...images, url]);
    }
  };

  // AI Description writer effect
  const handleGenerateAiDescription = () => {
    if (!title || !rent) {
      alert("Please fill out the Property Title and Rent first so the AI has context.");
      return;
    }
    setIsAiWriting(true);

    const generated = `Welcome to this premium ${bedrooms} BR, ${bathrooms} BA ${type.toLowerCase()} located in the heart of ${city || 'the city'}. Boasting an expansive ${area} sqft of meticulously designed interior space, this residence is offered at ₹${rent}/month (deposit: ₹${securityDeposit || parseInt(rent) * 1.5}).

Enjoy a fully functional layout equipped with premium finishes${selectedAmenities.length > 0 ? `, including ${selectedAmenities.slice(0, 4).join(', ')}` : ''}. Perfect for tenants looking for a blend of comfort and convenience. Pet friendly: ${petFriendly ? 'Yes' : 'No'}. Furnished: ${furnished ? 'Yes' : 'No'}. Available starting ${availableFrom || 'next month'}. Contact us today to schedule a verified private tour!`;

    let currentLength = 0;
    setDescription('');

    const interval = setInterval(() => {
      if (currentLength < generated.length) {
        setDescription(prev => prev + generated[currentLength]);
        currentLength++;
      } else {
        clearInterval(interval);
        setIsAiWriting(false);
      }
    }, 15);
  };

  // Calculation values for sidebar
  const parseNum = (val: string, def = 0) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? def : parsed;
  };

  // Check form completeness percentage
  const getCompleteness = () => {
    let score = 0;
    let total = 8;

    if (title.trim().length > 3) score++;
    if (parseNum(rent) > 0) score++;
    if (address.trim().length > 3) score++;
    if (city.trim().length > 1) score++;
    if (coords !== null) score++;
    if (selectedAmenities.length >= 2) score++;
    if (images.length >= 1) score++;
    if (description.trim().length > 10) score++;

    return Math.round((score / total) * 100);
  };

  const completeness = getCompleteness();

  const getMissingInfo = () => {
    const missing = [];
    if (title.trim().length <= 3) missing.push("Set property title (min 4 chars)");
    if (parseNum(rent) <= 0) missing.push("Enter monthly rent price");
    if (address.trim().length <= 3) missing.push("Enter street address");
    if (city.trim().length <= 1) missing.push("Enter city name");
    if (coords === null) missing.push("Pin property location on map");
    if (selectedAmenities.length < 2) missing.push("Select at least 2 amenities");
    if (images.length < 1) missing.push("Add at least 1 property photo");
    if (description.trim().length <= 10) missing.push("Write description (min 10 chars)");
    return missing;
  };

  // Dynamic Rent Insights calculation
  const getAverageRentInArea = () => {
    const base = type === 'House' ? 3200 : type === 'Villa' ? 5500 : 2200;
    const bedMultiplier = parseNum(bedrooms, 2) * 450;
    const locBonus = city.toLowerCase() === 'new york' || city.toLowerCase() === 'los angeles' ? 800 : 200;
    return base + bedMultiplier + locBonus;
  };

  const getDemandScore = () => {
    if (parseNum(rent) > getAverageRentInArea() + 500) return { label: 'Medium', color: 'text-primary bg-primary/10' };
    if (selectedAmenities.length > 5 || petFriendly) return { label: 'High', color: 'text-success bg-success-container text-on-success-container' };
    return { label: 'Good', color: 'text-secondary bg-surface-container-high' };
  };

  const avgRent = getAverageRentInArea();
  const demand = getDemandScore();

  // Save Draft manually
  const handleSaveDraft = () => {
    const draftObj = {
      title, rent, securityDeposit, type, availableFrom,
      address, city, state, zipCode, coords,
      bedrooms, bathrooms, area, parkingSpaces, furnished, petFriendly,
      selectedAmenities, images, coverImageIndex, description
    };
    localStorage.setItem('rental_listing_draft', JSON.stringify(draftObj));
    alert("Draft saved successfully!");
  };

  // Publish Listing
  const handlePublish = async () => {
    if (completeness < 100) {
      alert("Please resolve all missing information alerts before publishing.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDesc = `${description}

---
• Security Deposit: ₹${securityDeposit || parseNum(rent) * 1.5}
• Available From: ${availableFrom || 'Negotiable'}
• Parking Spaces: ${parkingSpaces}
• Furnished: ${furnished ? 'Yes' : 'No'}
• Pet Friendly: ${petFriendly ? 'Yes' : 'No'}`;

      const finalImages = images.length > 0 ? images : [MOCK_PRESET_IMAGES[0]];

      // Reorder cover image to position 0
      if (coverImageIndex > 0 && coverImageIndex < finalImages.length) {
        const reordered = [...finalImages];
        const cover = reordered.splice(coverImageIndex, 1)[0];
        reordered.unshift(cover);
      }

      const res = await axios.post('/properties', {
        title,
        price: parseNum(rent),
        address,
        city,
        state: state || 'CA',
        country: 'US',
        latitude: coords?.lat || 34.0522,
        longitude: coords?.lng || -118.2437,
        bedrooms: parseNum(bedrooms),
        bathrooms: parseNum(bathrooms),
        area: parseNum(area),
        type,
        listingType: 'RENT',
        description: formattedDesc,
        amenities: selectedAmenities,
        images: finalImages,
      });

      if (res.data.success) {
        alert("Your rental listing has been published successfully!");
        localStorage.removeItem('rental_listing_draft');
        navigate('/buy'); // Redirect to search pages (or listings overview)
      }
    } catch (err) {
      console.error(err);
      alert("Failed to publish listing. Please check input parameters.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unauthorized page state
  if (!isAuthenticated) {
    return (
      <div className="pt-24 pb-stack-lg min-h-screen flex items-center justify-center px-gutter bg-background">
        <div className="w-full max-w-md bg-surface border border-outline-variant/30 rounded-xl p-8 shadow-sm space-y-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <span className="material-symbols-outlined style={{ fontSize: 32 }}">account_circle</span>
          </div>
          <div className="space-y-2">
            <h2 className="font-headline-lg text-headline-md text-on-background">Sign In Required</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              You need a registered landlord or agent account to post and manage property listings on XYZ Homes.
            </p>
          </div>
          <button
            onClick={() => navigate('/auth/login')}
            className="w-full py-2.5 bg-primary text-on-primary rounded-lg text-sm font-label-md hover:bg-primary-container transition-all active:scale-95 shadow-sm"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative pt-20 pb-32">
      {/* 1. Header Area */}
      <div className="bg-surface-container-lowest border-b border-outline-variant/20 px-gutter py-6 shadow-sm">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-md md:text-headline-lg text-on-background">List Your Rental Property</h1>
            <p className="text-on-surface-variant text-xs md:text-sm mt-1">
              Create a professional listing and connect with verified tenants.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            {saveStatus === 'saving' && (
              <span className="text-xs text-on-surface-variant/60 italic mr-2 flex items-center gap-1">
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: 14 }}>progress_activity</span>
                Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-xs text-primary font-bold mr-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 14 }}>check_circle</span>
                Draft saved
              </span>
            )}
            <button
              onClick={handleSaveDraft}
              className="px-4 py-2 border border-outline-variant/40 hover:bg-surface-container-low text-on-background rounded-lg text-xs font-label-md transition-all whitespace-nowrap"
            >
              Save Draft
            </button>
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="px-4 py-2 border border-outline-variant/40 hover:bg-surface-container-low text-on-background rounded-lg text-xs font-label-md transition-all whitespace-nowrap"
            >
              Preview Listing
            </button>
            <button
              onClick={handlePublish}
              disabled={isSubmitting}
              className={`px-5 py-2 rounded-lg text-xs font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm whitespace-nowrap disabled:opacity-50`}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Dashboard Layout Grid */}
      <div className="max-w-container-max mx-auto px-gutter mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* LEFT COLUMN: Property Form (70%) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Section 1: Basic Information */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-body-lg font-bold text-on-background border-b border-outline-variant/20 pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span> Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-xs font-label-md text-on-surface-variant">Listing Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Cozy Modern 2BR Apartment near Downtown"
                    className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-label-md text-on-surface-variant">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    required
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    placeholder="2500"
                    className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-label-md text-on-surface-variant">Security Deposit (₹)</label>
                  <input
                    type="number"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value)}
                    placeholder="3750"
                    className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-label-md text-on-surface-variant">Property Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option>Apartment</option>
                    <option>House</option>
                    <option>Villa</option>
                    <option>Commercial</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-label-md text-on-surface-variant">Available From Date</label>
                  <input
                    type="date"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Location */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-body-lg font-bold text-on-background border-b border-outline-variant/20 pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">pin_drop</span> Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-xs font-label-md text-on-surface-variant">Street Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="100 Crestview Dr"
                    className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-label-md text-on-surface-variant">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Los Angeles"
                    className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-label-md text-on-surface-variant">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="CA"
                      className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-label-md text-on-surface-variant">ZIP Code</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="90001"
                      className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-label-md text-on-surface-variant">Interactive Map Picker</label>
                  <div className="h-[250px] w-full rounded-lg overflow-hidden border border-outline-variant/30 relative">
                    <MapView 
                      mode="picker" 
                      selectedLocation={coords} 
                      onLocationSelect={handleLocationSelect}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Property Details */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-body-lg font-bold text-on-background border-b border-outline-variant/20 pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">lists</span> Property Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-label-md text-on-surface-variant">Bedrooms</label>
                  <input
                    type="number"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-label-md text-on-surface-variant">Bathrooms</label>
                  <input
                    type="number"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-label-md text-on-surface-variant">Area (sq ft)</label>
                  <input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-label-md text-on-surface-variant">Parking Spaces</label>
                  <input
                    type="number"
                    value={parkingSpaces}
                    onChange={(e) => setParkingSpaces(e.target.value)}
                    className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex justify-between items-center bg-surface-container-low px-4 py-3 rounded-lg border border-outline-variant/10">
                  <span className="text-xs font-label-md text-on-surface">Furnished Status</span>
                  <button
                    type="button"
                    onClick={() => setFurnished(!furnished)}
                    className={`text-xs px-4 py-1.5 rounded-lg font-bold transition-all ${
                      furnished 
                        ? 'bg-primary text-on-primary' 
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {furnished ? 'Furnished' : 'Unfurnished'}
                  </button>
                </div>
                <div className="flex justify-between items-center bg-surface-container-low px-4 py-3 rounded-lg border border-outline-variant/10">
                  <span className="text-xs font-label-md text-on-surface">Pet Friendly</span>
                  <button
                    type="button"
                    onClick={() => setPetFriendly(!petFriendly)}
                    className={`text-xs px-4 py-1.5 rounded-lg font-bold transition-all ${
                      petFriendly 
                        ? 'bg-primary text-on-primary' 
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {petFriendly ? 'Yes' : 'No'}
                  </button>
                </div>
              </div>
            </div>

            {/* Section 4: Amenities */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-body-lg font-bold text-on-background border-b border-outline-variant/20 pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">local_laundry_service</span> Amenities
              </h3>
              <p className="text-xs text-on-surface-variant">Select all premium amenities available at the property:</p>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_LIST.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => handleToggleAmenity(amenity)}
                      className={`px-3 py-1.5 rounded-full text-xs font-label-md border transition-all flex items-center gap-1.5 ${
                        isSelected 
                          ? 'bg-primary/10 border-primary text-primary font-bold' 
                          : 'border-outline-variant/40 hover:bg-surface-container-low text-secondary'
                      }`}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                        {isSelected ? 'check' : 'add'}
                      </span>
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 5: Media Upload */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                <h3 className="text-body-lg font-bold text-on-background flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">image</span> Media Upload
                </h3>
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="text-xs text-primary hover:underline font-bold"
                >
                  + Add URL directly
                </button>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={handleTriggerUpload}
                className={`cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant/55 bg-surface-container-low/40 hover:bg-surface-container-low/75'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && processFiles(e.target.files)}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <span className="material-symbols-outlined text-secondary/60" style={{ fontSize: 44 }}>
                  cloud_upload
                </span>
                <p className="text-body-md text-on-surface font-semibold mt-2">
                  Drag and drop your listing photos here, or click to browse
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Supports JPG, JPEG, PNG formats. Select multiple files to upload.
                </p>

                {/* Progress indicator */}
                {uploadProgress !== null && (
                  <div className="mt-4 max-w-xs mx-auto space-y-1">
                    <div className="flex justify-between text-[10px] text-on-surface-variant font-bold">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-outline-variant/20 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={handleTriggerUpload}
                    className="px-4 py-2 bg-primary text-on-primary text-xs font-label-md rounded-lg hover:bg-primary/90 transition-all shadow-sm"
                  >
                    Upload Photos
                  </button>
                  <button
                    type="button"
                    onClick={handleAddMockPhotos}
                    className="px-4 py-2 border border-outline-variant/40 bg-surface text-on-background text-xs font-label-md rounded-lg hover:bg-surface-container transition-all"
                  >
                    Use Mock Photos
                  </button>
                </div>
              </div>

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-label-md text-on-surface">Preview Grid ({images.length} photos):</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {images.map((url, index) => {
                      const isCover = index === coverImageIndex;
                      return (
                        <div key={index} className="group relative aspect-video rounded-lg overflow-hidden border border-outline-variant/30 bg-surface-container-low shadow-sm">
                          <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setImages(images.filter((_, i) => i !== index))}
                            className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove photo"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setCoverImageIndex(index)}
                            className={`absolute bottom-1.5 left-1.5 text-[10px] px-2 py-0.5 rounded font-bold transition-all shadow-md ${
                              isCover 
                                ? 'bg-primary text-on-primary' 
                                : 'bg-black/60 text-white hover:bg-black/90'
                            }`}
                          >
                            {isCover ? 'Cover Photo' : 'Set Cover'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Section 6: Property Description */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                <h3 className="text-body-lg font-bold text-on-background flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">description</span> Property Description
                </h3>
                <button
                  type="button"
                  onClick={handleGenerateAiDescription}
                  disabled={isAiWriting}
                  className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined animate-pulse" style={{ fontSize: 14 }}>auto_awesome</span>
                  {isAiWriting ? 'AI Writing...' : '✨ AI Write Description'}
                </button>
              </div>
              <div className="space-y-1">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                  placeholder="Tell potential tenants about unique structural features, interior design elements, and neighborhood characteristics..."
                  rows={6}
                  className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-geist"
                />
                <div className="flex justify-between items-center text-[11px] text-on-surface-variant">
                  <span>Aim for 150+ characters for better engagement.</span>
                  <span className={description.length >= 950 ? 'text-error font-bold' : ''}>
                    {description.length}/1000 characters
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sidebar Widgets (30%) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Widget 1: Listing Score Card */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-on-background uppercase tracking-wider font-label-md">Listing Strength</h4>
              <div className="flex items-center gap-4">
                {/* Visual Progress ring/bar */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-outline-variant/20"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-primary transition-all duration-500"
                      strokeDasharray={`${completeness}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-bold text-on-background">{completeness}%</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-on-background">
                    {completeness === 100 ? 'Listing is ready!' : completeness >= 70 ? 'Almost ready to publish' : 'Incomplete listing'}
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Resolve missing fields below.
                  </p>
                </div>
              </div>

              {/* Missing Fields list */}
              {getMissingInfo().length > 0 ? (
                <div className="space-y-1.5 pt-2 border-t border-outline-variant/20">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Requirements</p>
                  {getMissingInfo().map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1 text-[11px] text-error">
                      <span className="material-symbols-outlined text-error mt-0.5" style={{ fontSize: 12 }}>error_outline</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-success font-semibold pt-2 border-t border-outline-variant/20">
                  <span className="material-symbols-outlined text-success">check_circle</span>
                  All requirements met! Ready to publish.
                </div>
              )}
            </div>

            {/* Widget 2: Rental Insights Card */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-on-background uppercase tracking-wider font-label-md">Rental Insights</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-1.5 border-b border-outline-variant/10">
                  <span className="text-xs text-on-surface-variant">Average Area Rent</span>
                  <span className="text-xs font-bold text-on-background">${avgRent.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-outline-variant/10">
                  <span className="text-xs text-on-surface-variant">Estimated Demand</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${demand.color}`}>
                    {demand.label}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-xs text-on-surface-variant">Market Trend</span>
                  <span className="text-xs font-bold text-success flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-success" style={{ fontSize: 13 }}>trending_up</span>
                    +3.8% this quarter
                  </span>
                </div>
              </div>
            </div>

            {/* Widget 3: Quick Tips Card */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-on-background uppercase tracking-wider font-label-md flex items-center gap-1">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>lightbulb</span> Tips for Landlords
              </h4>
              <ul className="space-y-2.5 text-xs text-on-surface-variant list-disc pl-4">
                <li>
                  <strong>Pricing Suggestion:</strong> Based on your {bedrooms} Bedroom configuration, a competitive rent is between <strong>${(avgRent - 200).toLocaleString()} - ${(avgRent + 200).toLocaleString()}</strong>.
                </li>
                <li>
                  Listing with at least 4 photos gets up to <strong>2.5x more views</strong> from serious renters.
                </li>
                <li>
                  Allowing pets increases lease renewals by up to <strong>40%</strong>.
                </li>
              </ul>
            </div>

            {/* Widget 4: Trust Badge */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 shadow-sm flex items-start gap-3">
              <div className="text-primary mt-0.5">
                <span className="material-symbols-outlined" style={{ fontSize: 32 }}>verified_user</span>
              </div>
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-on-background">Verified Landlord Program</h5>
                <p className="text-[10px] text-on-surface-variant">
                  listings with verified titles and accurate addresses receive the "Verified" shield, placing them at the top of tenant search results.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-md border-t border-outline-variant/30 py-4 px-gutter shadow-lg">
        <div className="max-w-container-max mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-bold text-on-background whitespace-nowrap">Completeness:</span>
            <div className="w-48 bg-outline-variant/30 h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full transition-all duration-300" style={{ width: `${completeness}%` }}></div>
            </div>
            <span className="text-xs font-bold text-primary">{completeness}%</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleSaveDraft}
              className="px-4 py-2 border border-outline-variant/40 hover:bg-surface-container-low text-on-background rounded-lg text-xs font-label-md transition-all whitespace-nowrap"
            >
              Save Draft
            </button>
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="px-4 py-2 border border-outline-variant/40 hover:bg-surface-container-low text-on-background rounded-lg text-xs font-label-md transition-all whitespace-nowrap"
            >
              Preview
            </button>
            <button
              onClick={handlePublish}
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg text-xs font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm whitespace-nowrap disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Live Preview Modal Overlay */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-outline-variant/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-4 right-4 bg-surface-container hover:bg-surface-container-high text-on-background rounded-full p-2"
              title="Close Preview"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="font-headline-md text-headline-sm text-on-background mb-4">Preview Listing</h3>
            
            {/* Simulated Property Detail Card */}
            <div className="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-lowest">
              <div className="aspect-video relative bg-surface-container-low">
                <img
                  src={images[coverImageIndex] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'}
                  alt={title || 'Property image'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-primary text-on-primary text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded">
                  {type} · FOR RENT
                </div>
                {petFriendly && (
                  <div className="absolute top-3 right-3 bg-success text-on-success text-[10px] uppercase font-bold px-3 py-1 rounded">
                    🐶 Pet Friendly
                  </div>
                )}
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-headline-sm text-headline-sm text-on-background">{title || 'Cozy Rental Property'}</h4>
                    <span className="font-headline-sm text-headline-sm text-primary whitespace-nowrap">${rent || '2,500'}/mo</span>
                  </div>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-outline" style={{ fontSize: 14 }}>location_on</span>
                    {address || '100 Crestview Dr'}, {city || 'Los Angeles'}, {state || 'CA'}
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2 py-3 border-y border-outline-variant/20 text-center">
                  <div>
                    <span className="block text-xs font-bold text-on-background">{bedrooms}</span>
                    <span className="text-[10px] text-on-surface-variant uppercase font-label-sm">Bedrooms</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-on-background">{bathrooms}</span>
                    <span className="text-[10px] text-on-surface-variant uppercase font-label-sm">Bathrooms</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-on-background">{area}</span>
                    <span className="text-[10px] text-on-surface-variant uppercase font-label-sm">Sq Ft</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-on-background">{parkingSpaces}</span>
                    <span className="text-[10px] text-on-surface-variant uppercase font-label-sm">Parking</span>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-on-background uppercase tracking-wider mb-2">Amenities</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAmenities.length > 0 ? (
                      selectedAmenities.map(a => (
                        <span key={a} className="bg-surface-container px-2.5 py-1 rounded-full text-[10px] font-label-md text-secondary">
                          {a}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-on-surface-variant italic">No amenities specified.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-on-background uppercase tracking-wider mb-2">About this Home</h5>
                  <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                    {description || 'No description provided. Click AI Write Description or write one above.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-5 py-2 border border-outline-variant/40 hover:bg-surface-container text-on-background text-xs font-label-md rounded-lg"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  setIsPreviewOpen(false);
                  handlePublish();
                }}
                disabled={isSubmitting}
                className="px-5 py-2 bg-primary hover:bg-primary-container text-on-primary text-xs font-label-md rounded-lg shadow-md"
              >
                {isSubmitting ? 'Publishing...' : 'Confirm & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
