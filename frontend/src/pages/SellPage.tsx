import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapView } from '../components/MapView';

// Amenities list for selectable chips
const AMENITIES_LIST = [
  'WiFi', 'Parking', 'Swimming Pool', 'Gym', 'Security', 'Balcony',
  'Elevator', 'Garden', 'Solar Panels', 'Home Automation', 'EV Charging', 'Power Backup', 'Pet Friendly'
];

// Mock preset image pool for Drag & Drop preview fallback
const MOCK_PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
];

export const SellPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active step state: 1, 2, 3, or 4
  const [activeStep, setActiveStep] = useState(1);

  // --- FORM STATES ---
  // Step 1: Basics & Specs
  const [title, setTitle] = useState('');
  const [type, setType] = useState('House');
  const [price, setPrice] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [area, setArea] = useState('1800');
  const [yearBuilt, setYearBuilt] = useState('2020');
  const [parkingSpaces, setParkingSpaces] = useState('2');

  // Step 2: Location
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Step 3: Amenities & Media
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState<number>(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Step 4: Description
  const [description, setDescription] = useState('');
  const [isAiWriting, setIsAiWriting] = useState(false);

  // General App States
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem('sell_listing_draft');
    if (draft) {
      try {
        const data = JSON.parse(draft);
        setTitle(data.title || '');
        setType(data.type || 'House');
        setPrice(data.price || '');
        setAvailableFrom(data.availableFrom || '');
        setBedrooms(data.bedrooms || '3');
        setBathrooms(data.bathrooms || '2');
        setArea(data.area || '1800');
        setYearBuilt(data.yearBuilt || '2020');
        setParkingSpaces(data.parkingSpaces || '2');
        setAddress(data.address || '');
        setCity(data.city || '');
        setState(data.state || '');
        setZipCode(data.zipCode || '');
        setCoords(data.coords || null);
        setSelectedAmenities(data.selectedAmenities || []);
        setImages(data.images || []);
        setCoverImageIndex(data.coverImageIndex || 0);
        setDescription(data.description || '');
        if (data.activeStep) {
          setActiveStep(data.activeStep);
        }
      } catch (e) {
        console.error('Error loading draft', e);
      }
    }
  }, []);

  // Auto-save logic (runs 1.5 seconds after a state change)
  useEffect(() => {
    if (!title && !address && !description && images.length === 0) return;
    setSaveStatus('saving');

    const timer = setTimeout(() => {
      const draftObj = {
        title, type, price, availableFrom, bedrooms, bathrooms, area, yearBuilt, parkingSpaces,
        address, city, state, zipCode, coords,
        selectedAmenities, images, coverImageIndex, description,
        activeStep
      };
      localStorage.setItem('sell_listing_draft', JSON.stringify(draftObj));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    title, type, price, availableFrom, bedrooms, bathrooms, area, yearBuilt, parkingSpaces,
    address, city, state, zipCode, coords,
    selectedAmenities, images, coverImageIndex, description,
    activeStep
  ]);

  // Handle location from MapView
  const handleLocationSelect = (lat: number, lng: number, formattedAddress?: string) => {
    setCoords({ lat, lng });
    if (formattedAddress) {
      const parts = formattedAddress.split(',').map(s => s.trim());
      if (parts.length > 0) setAddress(parts[0]);
      if (parts.length > 1) setCity(parts[1]);
      if (parts.length > 2) setState(parts[2]);
    }
  };

  // Detect My Location using HTML5 Geolocation API
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setIsLocating(false);
      },
      (error) => {
        console.error(error);
        setIsLocating(false);
        // Fallback to Los Angeles center
        setCoords({ lat: 34.0522, lng: -118.2437 });
      }
    );
  };

  // Toggle amenity selection
  const handleToggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
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
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          newImages.push(result);
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

  // Drag and drop logic
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

  // Manual URL upload helper
  const handleAddImageUrl = () => {
    const url = prompt("Enter property image URL:");
    if (url) {
      setImages([...images, url]);
    }
  };

  // AI Description Helper
  const handleGenerateAiDescription = () => {
    if (!title || !price) {
      alert("Please fill out the Property Title and Price first so the AI has context.");
      return;
    }
    setIsAiWriting(true);

    const generatedText = `Stunning, custom-designed ${bedrooms} bedroom, ${bathrooms} bathroom ${type.toLowerCase()} situated in a highly desirable neighborhood. Built in ${yearBuilt}, this expansive ${area} sqft home features state-of-the-art updates, open-concept living space, and refined finishes throughout.

The kitchen features modern cabinetry, high-end appliances, and ample prep surfaces. The master suite is a quiet retreat with full ensuite. Out back, you'll find a beautifully kept yard perfect for entertaining. Conveniently located near top-rated schools, parks, and dining options. Perfect for families looking for a turnkey luxury move. Amenities include: ${selectedAmenities.slice(0, 4).join(', ') || 'Smart features and premium security'}. Available beginning ${availableFrom || 'next month'}. Listed at ₹${Number(price).toLocaleString()}.`;

    let currentLength = 0;
    setDescription('');

    const interval = setInterval(() => {
      if (currentLength < generatedText.length) {
        setDescription(prev => prev + generatedText[currentLength]);
        currentLength++;
      } else {
        clearInterval(interval);
        setIsAiWriting(false);
      }
    }, 12);
  };

  // Helpers to calculate form completion metric
  const parseNum = (val: string, def = 0) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? def : parsed;
  };

  const getCompleteness = () => {
    let score = 0;
    let total = 8;

    if (title.trim().length > 3) score++;
    if (parseNum(price) > 0) score++;
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
    if (parseNum(price) <= 0) missing.push("Enter selling price");
    if (address.trim().length <= 3) missing.push("Enter street address");
    if (city.trim().length <= 1) missing.push("Enter city name");
    if (coords === null) missing.push("Pin property location on map");
    if (selectedAmenities.length < 2) missing.push("Select at least 2 amenities");
    if (images.length < 1) missing.push("Add at least 1 property photo");
    if (description.trim().length <= 10) missing.push("Write description (min 10 chars)");
    return missing;
  };

  // Pricing analysis helpers
  const getAveragePriceInArea = () => {
    const base = type === 'House' ? 450000 : type === 'Villa' ? 850000 : 250000;
    const bedMultiplier = parseNum(bedrooms, 3) * 60000;
    const sizeMultiplier = parseNum(area, 1500) * 150;
    return base + bedMultiplier + sizeMultiplier;
  };

  const getDemandScore = () => {
    const ask = parseNum(price);
    const avg = getAveragePriceInArea();
    if (ask <= 0) return { label: 'Medium', color: 'text-primary bg-primary/10' };
    if (ask < avg - 50000) return { label: 'Very High', color: 'text-success bg-success-container text-on-success-container' };
    if (ask > avg + 100000) return { label: 'Moderate', color: 'text-warning bg-warning-container text-on-warning-container' };
    return { label: 'High', color: 'text-success bg-success-container/60 text-on-success-container' };
  };

  const avgPrice = getAveragePriceInArea();
  const demand = getDemandScore();

  // Save manual draft
  const handleSaveDraft = () => {
    const draftObj = {
      title, type, price, availableFrom, bedrooms, bathrooms, area, yearBuilt, parkingSpaces,
      address, city, state, zipCode, coords,
      selectedAmenities, images, coverImageIndex, description,
      activeStep
    };
    localStorage.setItem('sell_listing_draft', JSON.stringify(draftObj));
    alert("Draft saved to your browser!");
  };

  // Submit Listing
  const handlePublish = async () => {
    if (completeness < 100) {
      alert("Please resolve all missing information requirements before submitting your listing.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDesc = `${description}

---
• Year Built: ${yearBuilt}
• Available From: ${availableFrom || 'Upon Closing'}
• Parking Spaces: ${parkingSpaces}
• Built Area: ${area} Sq Ft`;

      const finalImages = images.length > 0 ? images : [MOCK_PRESET_IMAGES[0]];

      // Move the designated cover image to position 0
      if (coverImageIndex > 0 && coverImageIndex < finalImages.length) {
        const reordered = [...finalImages];
        const cover = reordered.splice(coverImageIndex, 1)[0];
        reordered.unshift(cover);
      }

      const res = await axios.post('/properties', {
        title,
        price: parseNum(price),
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
        listingType: 'SALE',
        description: formattedDesc,
        amenities: selectedAmenities,
        images: finalImages,
      });

      if (res.data.success) {
        alert("Your property listing has been submitted and is pending admin approval. You can view its status in your Dashboard.");
        localStorage.removeItem('sell_listing_draft');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit property listing. Please verify the fields.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auth Guard
  if (!isAuthenticated) {
    return (
      <div className="pt-24 pb-stack-lg min-h-screen flex items-center justify-center px-gutter bg-background">
        <div className="w-full max-w-md bg-surface border border-outline-variant/30 rounded-xl p-8 shadow-sm space-y-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <span className="material-symbols-outlined" style={{ fontSize: 32 }}>real_estate_agent</span>
          </div>
          <div className="space-y-2">
            <h2 className="font-headline-lg text-headline-md text-on-background">Sell Your Property</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Please sign in to list, edit, and manage your property postings on XYZ Homes.
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
      
      {/* 1. Header Section */}
      <div className="bg-surface border-b border-outline-variant/20 px-gutter py-6 shadow-sm">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-md md:text-headline-lg text-on-background font-bold">Sell Your Property</h1>
            <p className="text-on-surface-variant text-xs md:text-sm mt-1">
              Follow our guided listing process to reach verified buyers and sell faster.
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
              className="px-5 py-2 rounded-lg text-xs font-label-md text-on-primary bg-primary hover:bg-primary/90 transition-all shadow-sm whitespace-nowrap disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Stepper Progress Navigation */}
      <div className="bg-surface-container-lowest border-b border-outline-variant/10 py-3.5 px-gutter">
        <div className="max-w-container-max mx-auto flex items-center justify-between overflow-x-auto gap-4">
          {[
            { step: 1, label: 'Property Details', icon: 'info' },
            { step: 2, label: 'Location & Map', icon: 'pin_drop' },
            { step: 3, label: 'Photos & Amenities', icon: 'photo_library' },
            { step: 4, label: 'Review & Publish', icon: 'verified' }
          ].map((item) => {
            const isCompleted = completeness >= (item.step * 25);
            const isActive = activeStep === item.step;
            return (
              <button
                key={item.step}
                onClick={() => setActiveStep(item.step)}
                className={`flex items-center gap-2 pb-1.5 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-secondary hover:text-on-background'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isActive 
                    ? 'bg-primary text-on-primary' 
                    : isCompleted 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-surface-container-high text-secondary'
                }`}>
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  ) : (
                    item.step
                  )}
                </div>
                <span className="text-xs font-label-md">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Dashboard Layout Grid */}
      <div className="max-w-container-max mx-auto px-gutter mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          
          {/* LEFT COLUMN: Main Listing Form Stepper Container (70%) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* STEP 1: PROPERTY DETAILS */}
            {activeStep === 1 && (
              <div className="bg-surface border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-6 animate-fadeIn">
                <div className="border-b border-outline-variant/20 pb-3">
                  <h3 className="text-body-lg font-bold text-on-background flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">real_estate_agent</span> Step 1: Property Details
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">Enter property basic details, size and structural specifications.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-xs font-label-md text-on-surface-variant">Listing Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Stunning Modern Home with Panoramic Views"
                      className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-label-md text-on-surface-variant">Property Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option>House</option>
                      <option>Apartment</option>
                      <option>Villa</option>
                      <option>Penthouse</option>
                      <option>Townhouse</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-label-md text-on-surface-variant">Asking Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 525000"
                      className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-label-md text-on-surface-variant">Availability Date</label>
                    <input
                      type="date"
                      value={availableFrom}
                      onChange={(e) => setAvailableFrom(e.target.value)}
                      className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-label-md text-on-surface-variant">Year Built</label>
                    <input
                      type="number"
                      value={yearBuilt}
                      onChange={(e) => setYearBuilt(e.target.value)}
                      placeholder="e.g. 2020"
                      className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="border-t border-outline-variant/10 pt-4 space-y-4">
                  <h4 className="text-xs font-bold text-on-background uppercase tracking-wider">Rooms & Size Specifications</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-label-md text-on-surface-variant">Bedrooms</label>
                      <select
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                        <option>6+</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-label-md text-on-surface-variant">Bathrooms</label>
                      <select
                        value={bathrooms}
                        onChange={(e) => setBathrooms(e.target.value)}
                        className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option>1</option>
                        <option>1.5</option>
                        <option>2</option>
                        <option>2.5</option>
                        <option>3</option>
                        <option>4+</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-label-md text-on-surface-variant">Built Area (sq ft)</label>
                      <input
                        type="number"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="e.g. 2100"
                        className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-label-md text-on-surface-variant">Parking Spaces</label>
                      <select
                        value={parkingSpaces}
                        onChange={(e) => setParkingSpaces(e.target.value)}
                        className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option>0</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4+</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-outline-variant/10">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-on-primary rounded-lg text-xs font-label-md transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    Continue to Location <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: LOCATION & MAP */}
            {activeStep === 2 && (
              <div className="bg-surface border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-6 animate-fadeIn">
                <div className="border-b border-outline-variant/20 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-body-lg font-bold text-on-background flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">pin_drop</span> Step 2: Location
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1">Specify where your property is situated. Pinch the map pin for absolute accuracy.</p>
                  </div>
                  <button
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="text-xs text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[15px] animate-pulse">my_location</span>
                    {isLocating ? 'Locating...' : 'Detect My Location'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-xs font-label-md text-on-surface-variant">Street Address</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 742 Evergreen Terrace"
                      className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-label-md text-on-surface-variant">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Springfield"
                      className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-xs font-label-md text-on-surface-variant">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. IL"
                        className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-label-md text-on-surface-variant">ZIP Code</label>
                      <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="e.g. 62704"
                        className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2 mt-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-label-md text-on-surface-variant">Interactive Map Verification</label>
                      {coords ? (
                        <span className="text-[10px] text-success font-semibold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span> Pin Placed ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
                        </span>
                      ) : (
                        <span className="text-[10px] text-on-surface-variant italic">No pin placed yet. Please select on the map.</span>
                      )}
                    </div>
                    <div className="h-[280px] w-full rounded-lg overflow-hidden border border-outline-variant/30 relative">
                      <MapView
                        mode="picker"
                        selectedLocation={coords}
                        onLocationSelect={handleLocationSelect}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-outline-variant/10">
                  <button
                    onClick={() => setActiveStep(1)}
                    className="px-5 py-2.5 border border-outline-variant/40 hover:bg-surface-container-low text-on-background rounded-lg text-xs font-label-md transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back
                  </button>
                  <button
                    onClick={() => setActiveStep(3)}
                    className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-on-primary rounded-lg text-xs font-label-md transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    Continue to Media & Amenities <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PHOTOS & AMENITIES */}
            {activeStep === 3 && (
              <div className="bg-surface border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-6 animate-fadeIn">
                <div className="border-b border-outline-variant/20 pb-3">
                  <h3 className="text-body-lg font-bold text-on-background flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">photo_library</span> Step 3: Photos & Amenities
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">Upload high-quality listing images and tag your property features.</p>
                </div>

                {/* Media Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-on-background uppercase tracking-wider">Photo Gallery</h4>
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="text-xs text-primary hover:underline font-bold"
                    >
                      + Add image URL
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
                      Drag and drop your home photos here, or click to browse
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

                  {/* Image Previews */}
                  {images.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-label-md text-on-surface">Gallery Images ({images.length}):</p>
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
                                <span className="material-symbols-outlined text-[13px]">close</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setCoverImageIndex(index)}
                                className={`absolute bottom-1.5 left-1.5 text-[9px] px-2 py-0.5 rounded font-bold transition-all shadow-md ${
                                  isCover 
                                    ? 'bg-primary text-on-primary' 
                                    : 'bg-black/60 text-white hover:bg-black/80'
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

                {/* Amenities Section */}
                <div className="border-t border-outline-variant/10 pt-5 space-y-3">
                  <h4 className="text-xs font-bold text-on-background uppercase tracking-wider">Property Features & Amenities</h4>
                  <p className="text-xs text-on-surface-variant">Highlight premium selling features to attract organic buyers:</p>
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

                <div className="flex justify-between pt-4 border-t border-outline-variant/10">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="px-5 py-2.5 border border-outline-variant/40 hover:bg-surface-container-low text-on-background rounded-lg text-xs font-label-md transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back
                  </button>
                  <button
                    onClick={() => setActiveStep(4)}
                    className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-on-primary rounded-lg text-xs font-label-md transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    Continue to Description <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & PUBLISH */}
            {activeStep === 4 && (
              <div className="bg-surface border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-6 animate-fadeIn">
                <div className="border-b border-outline-variant/20 pb-3">
                  <h3 className="text-body-lg font-bold text-on-background flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span> Step 4: Description & Review
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">Provide a listing writeup or generate one instantly based on your inputs using AI.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-on-background uppercase tracking-wider">Property Description</label>
                    <button
                      type="button"
                      onClick={handleGenerateAiDescription}
                      disabled={isAiWriting}
                      className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[15px] animate-pulse">auto_awesome</span>
                      {isAiWriting ? 'AI Writing...' : '✨ AI Generate Description'}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                      placeholder="Highlight unique attributes, luxury fittings, nearby spots, neighborhood benefits..."
                      rows={7}
                      className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
                    />
                    <div className="flex justify-between items-center text-[10px] text-on-surface-variant">
                      <span>Good descriptions include property condition, renovations, and location advantages.</span>
                      <span className={description.length >= 950 ? 'text-error font-bold' : ''}>
                        {description.length}/1000 chars
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Checklist Summary */}
                <div className="border-t border-outline-variant/10 pt-5 space-y-3 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20">
                  <h4 className="text-xs font-bold text-on-background uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-[16px]">task_alt</span> Listing Verification Checklist
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[16px] ${title.trim().length > 3 ? 'text-success' : 'text-outline-variant'}`}>
                        {title.trim().length > 3 ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className="text-secondary">Listing Title Set</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[16px] ${parseNum(price) > 0 ? 'text-success' : 'text-outline-variant'}`}>
                        {parseNum(price) > 0 ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className="text-secondary">Asking Price Configured</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[16px] ${coords !== null ? 'text-success' : 'text-outline-variant'}`}>
                        {coords !== null ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className="text-secondary">Map Coordinate Placed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[16px] ${images.length >= 1 ? 'text-success' : 'text-outline-variant'}`}>
                        {images.length >= 1 ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className="text-secondary">Photos Added ({images.length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[16px] ${selectedAmenities.length >= 2 ? 'text-success' : 'text-outline-variant'}`}>
                        {selectedAmenities.length >= 2 ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className="text-secondary">Selected Amenities ({selectedAmenities.length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[16px] ${description.trim().length > 10 ? 'text-success' : 'text-outline-variant'}`}>
                        {description.trim().length > 10 ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className="text-secondary">Description Completed</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-outline-variant/10">
                  <button
                    onClick={() => setActiveStep(3)}
                    className="px-5 py-2.5 border border-outline-variant/40 hover:bg-surface-container-low text-on-background rounded-lg text-xs font-label-md transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back
                  </button>
                  <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="px-6 py-2.5 border border-primary text-primary hover:bg-primary/5 rounded-lg text-xs font-label-md transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span> Preview Final Card
                  </button>
                  <button
                    onClick={handlePublish}
                    disabled={isSubmitting || completeness < 100}
                    className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-on-primary rounded-lg text-xs font-label-md transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">publish</span>
                    {isSubmitting ? 'Publishing...' : 'Publish Listing'}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Sidebar Widgets (30%) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Widget 1: Listing Strength Card */}
            <div className="bg-surface border border-outline-variant/30 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-on-background uppercase tracking-wider font-label-md flex items-center justify-between">
                <span>Listing Strength</span>
                <span className="text-xs text-primary font-bold">{completeness}%</span>
              </h4>
              
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
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
                  <span className="absolute text-xs font-bold text-on-background">{completeness}%</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-on-background">
                    {completeness === 100 
                      ? 'Perfect listing strength!' 
                      : completeness >= 75 
                      ? 'Excellent, nearly done' 
                      : 'Needs more info'}
                  </p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">
                    A complete listing attracts up to 3x more premium buyers.
                  </p>
                </div>
              </div>

              {/* Requirements Checklist */}
              {getMissingInfo().length > 0 ? (
                <div className="space-y-2 pt-3 border-t border-outline-variant/20">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Remaining Actions</p>
                  {getMissingInfo().map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-error font-medium">
                      <span className="material-symbols-outlined text-[13px] text-error mt-0.5">error_outline</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-success font-semibold pt-3 border-t border-outline-variant/20">
                  <span className="material-symbols-outlined text-[16px] text-success">check_circle</span>
                  Perfect listing strength! Ready to publish.
                </div>
              )}
            </div>

            {/* Widget 2: Price Insights Card */}
            <div className="bg-surface border border-outline-variant/30 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-on-background uppercase tracking-wider font-label-md">Market Price Insights</h4>
              
              <div className="space-y-3.5">
                <div className="flex justify-between items-center py-1.5 border-b border-outline-variant/10">
                  <span className="text-xs text-on-surface-variant">Average Area Value</span>
                  <span className="text-xs font-bold text-on-background">${avgPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-outline-variant/10">
                  <span className="text-xs text-on-surface-variant">Suggested Selling Ask</span>
                  <span className="text-xs font-bold text-primary">${(avgPrice * 0.98).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-outline-variant/10">
                  <span className="text-xs text-on-surface-variant">Buyer Demand Score</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${demand.color}`}>
                    {demand.label}
                  </span>
                </div>
                
                {/* Visual SVG market trend line */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Market Price Trend (12 Months)</span>
                  <div className="h-12 w-full bg-surface-container-low rounded-lg p-1 border border-outline-variant/10 flex items-end">
                    <svg className="w-full h-full text-primary" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <path
                        d="M0 25 Q15 20, 30 18 T60 12 T90 5 T100 3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      {/* Trend area shade */}
                      <path
                        d="M0 25 Q15 20, 30 18 T60 12 T90 5 T100 3 L100 30 L0 30 Z"
                        fill="currentColor"
                        fillOpacity="0.08"
                      />
                    </svg>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-on-surface-variant mt-1.5">
                    <span>Q2 Last Year</span>
                    <span className="text-success font-bold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[10px]">trending_up</span> +5.2% YoY
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 3: Seller Tips Card */}
            <div className="bg-surface border border-outline-variant/30 rounded-xl p-5 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-on-background uppercase tracking-wider font-label-md flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[16px]">lightbulb</span> Seller Quick Tips
              </h4>
              <ul className="space-y-2.5 text-xs text-on-surface-variant list-disc pl-4">
                <li>
                  <strong>Value Optimization:</strong> Homes listed with custom Year Built and specification data sell up to <strong>12 days faster</strong>.
                </li>
                <li>
                  High-resolution images of the front elevation and kitchen increase clicks by <strong>40%</strong>.
                </li>
                <li>
                  Setting a realistic market price first prevents listing stagnation in buyer searches.
                </li>
              </ul>
            </div>

            {/* Widget 4: Trust Card */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 shadow-sm flex items-start gap-3">
              <div className="text-primary mt-0.5">
                <span className="material-symbols-outlined" style={{ fontSize: 32 }}>verified_user</span>
              </div>
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-on-background">Secure Seller Verification</h5>
                <p className="text-[10px] text-on-surface-variant">
                  We match listing records with local property tax data. Verified sellers receive a priority badge, boosting listing visibility.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 4. Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-md border-t border-outline-variant/30 py-4 px-gutter shadow-lg">
        <div className="max-w-container-max mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-bold text-on-background whitespace-nowrap">Progress:</span>
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
              disabled={isSubmitting || completeness < 100}
              className="px-6 py-2 rounded-lg text-xs font-label-md text-on-primary bg-primary hover:bg-primary/90 transition-all shadow-sm whitespace-nowrap disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Live Preview Modal Overlay */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="bg-surface border border-outline-variant/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-4 right-4 bg-surface-container hover:bg-surface-container-high text-on-background rounded-full p-2"
              title="Close Preview"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="font-headline-md text-headline-sm text-on-background mb-4 font-bold">Listing Live Preview</h3>
            
            {/* Simulated Property Detail Card */}
            <div className="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-lowest">
              <div className="aspect-video relative bg-surface-container-low">
                <img
                  src={images[coverImageIndex] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'}
                  alt={title || 'Home Listing'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-primary text-on-primary text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded">
                  {type} · FOR SALE
                </div>
                <div className="absolute top-3 right-3 bg-primary-container text-on-primary-container text-[10px] uppercase font-bold px-3 py-1 rounded">
                  🔨 Built {yearBuilt}
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="font-headline-sm text-headline-sm text-on-background font-bold">{title || 'Stunning Luxury Property'}</h4>
                    <span className="font-headline-sm text-headline-sm text-primary whitespace-nowrap">${price ? Number(price).toLocaleString() : '525,000'}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-outline" style={{ fontSize: 14 }}>location_on</span>
                    {address || '742 Evergreen Terrace'}, {city || 'Springfield'}{state ? `, ${state}` : ''}
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
                  <h5 className="text-xs font-bold text-on-background uppercase tracking-wider mb-2">Key Amenities</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAmenities.length > 0 ? (
                      selectedAmenities.map(a => (
                        <span key={a} className="bg-surface-container px-2.5 py-1 rounded-full text-[10px] font-label-md text-secondary">
                          {a}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-on-surface-variant italic">No special amenities selected.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-on-background uppercase tracking-wider mb-2">Property Description</h5>
                  <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                    {description || 'No description provided. Click AI Generate Description or write one above.'}
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
                disabled={isSubmitting || completeness < 100}
                className="px-5 py-2 bg-primary hover:bg-primary/95 text-on-primary text-xs font-label-md rounded-lg shadow-md disabled:opacity-50"
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
export default SellPage;
