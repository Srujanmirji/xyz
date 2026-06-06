import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface PropertySummary {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  images: { imageUrl: string }[];
}

export const BookingPage: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [property, setProperty] = useState<PropertySummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedDate, setSelectedDate] = useState<number | null>(6); // Default 6 (matches static HTML)
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [timeSlot, setTimeSlot] = useState('Afternoon (12:00 PM - 4:00 PM)');
  const [message, setMessage] = useState('');
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/properties/${propertyId}`);
        if (res.data.success) {
          setProperty(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching property summary', error);
      } finally {
        setLoading(false);
      }
    };
    if (propertyId) fetchProperty();
  }, [propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert('Please log in to submit a booking viewing request.');
      navigate('/auth/login');
      return;
    }

    if (!selectedDate) {
      alert('Please choose a viewing date from the calendar.');
      return;
    }

    setFormSubmitLoading(true);

    try {
      // Mock calendar date mapping
      const dateVal = new Date();
      dateVal.setDate(selectedDate);

      const res = await axios.post('/bookings', {
        propertyId,
        date: dateVal.toISOString(),
        timeSlot,
        message,
      });

      if (res.data.success) {
        setSuccess(true);
      }
    } catch (error) {
      console.error('Error booking viewing tour', error);
      alert('Failed to schedule visit. Please try again.');
    } finally {
      setFormSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 max-w-container-max mx-auto px-gutter py-8 animate-pulse space-y-6">
        <div className="h-60 bg-surface-container rounded-xl"></div>
        <div className="h-40 bg-surface-container rounded-xl"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="pt-24 text-center py-20 bg-background">
        <span className="material-symbols-outlined text-[48px] text-error mb-2">error</span>
        <p className="text-on-surface-variant font-bold">Property not found.</p>
        <Link to="/properties" className="text-primary mt-2 inline-block hover:underline">
          Back to Listings
        </Link>
      </div>
    );
  }

  const mainImage = property.images && property.images.length > 0
    ? property.images[0].imageUrl
    : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800';

  return (
    <main className="pt-24 pb-stack-lg px-gutter max-w-container-max mx-auto">
      {success ? (
        <div className="max-w-xl mx-auto text-center py-16 bg-surface-container-low border border-outline-variant/30 rounded-xl p-8 space-y-4 mt-8">
          <span className="material-symbols-outlined text-[64px] text-primary">check_circle</span>
          <h2 className="font-headline-lg text-headline-lg text-on-background">Booking Request Confirmed</h2>
          <p className="text-on-surface-variant text-sm">
            Your viewing request for <span className="font-bold text-on-background">{property.title}</span> has been submitted to the listing agent. You will receive an email and in-app dashboard notification once approved.
          </p>
          <div className="pt-4 flex gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-primary text-on-primary px-6 py-2 rounded-lg text-sm font-label-md hover:bg-primary-container"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/properties')}
              className="bg-surface-container-high text-on-background px-6 py-2 rounded-lg text-sm font-label-md hover:bg-surface-container-highest"
            >
              Browse More
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-margin-desktop mt-stack-lg">
          {/* Left Column: Context & Hero */}
          <div className="lg:col-span-5 flex flex-col gap-stack-lg">
            <div className="space-y-stack-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span className="font-label-sm text-label-sm">Verified Property</span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface">{property.title}</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
                Experience the pinnacle of modern living. Schedule your private walkthrough of this architectural masterpiece.
              </p>
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-lg aspect-video group">
              <img
                src={mainImage}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-stack-md left-stack-md text-white">
                <p className="font-label-md text-label-md opacity-90">Viewing Address</p>
                <p className="font-headline-md text-headline-md">{property.address}, {property.city}</p>
              </div>
            </div>
            {/* Agent Contact Quick Links */}
            <div className="grid grid-cols-2 gap-stack-md">
              <a
                href="#contact"
                onClick={() => setMessage('Hi! I would like to chat regarding the property pricing.')}
                className="flex items-center justify-center gap-2 p-stack-md bg-surface border border-outline-variant/30 rounded-lg shadow-sm hover:shadow-md transition-all text-sm font-label-md text-on-surface"
              >
                <span className="material-symbols-outlined text-primary">chat_bubble</span>
                <span>Message Agent</span>
              </a>
              <a
                href="tel:1234567890"
                className="flex items-center justify-center gap-2 p-stack-md bg-surface border border-outline-variant/30 rounded-lg shadow-sm hover:shadow-md transition-all text-sm font-label-md text-on-surface"
              >
                <span className="material-symbols-outlined text-primary">call</span>
                <span>Call Now</span>
              </a>
            </div>
          </div>

          {/* Right Column: Booking Form */}
          <div className="lg:col-span-7">
            <div className="bg-surface border border-outline-variant/30 rounded-xl p-stack-lg shadow-sm">
              <div className="flex items-center justify-between mb-stack-lg">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Schedule a Visit</h2>
                <span className="text-primary font-headline-md text-headline-md">${(property.price / 1000000).toFixed(1)}M</span>
              </div>
              <form onSubmit={handleSubmit} className="space-y-stack-lg">
                {/* Calendar Picker */}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-stack-sm">
                    Select Preferred Date (June 2026)
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {/* Headers */}
                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                      <div key={day} className="text-center font-label-sm text-label-sm text-outline pb-2">
                        {day}
                      </div>
                    ))}
                    {/* Days */}
                    {/* Empty cells representing starting offset */}
                    <div className="aspect-square flex items-center justify-center font-body-md text-body-md text-outline opacity-40">28</div>
                    <div className="aspect-square flex items-center justify-center font-body-md text-body-md text-outline opacity-40">29</div>
                    <div className="aspect-square flex items-center justify-center font-body-md text-body-md text-outline opacity-40">30</div>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25].map((day) => {
                      const isSelected = selectedDate === day;
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setSelectedDate(day)}
                          className={`aspect-square flex items-center justify-center font-body-md text-body-md rounded-md cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-primary text-on-primary rounded-md shadow-md ring-2 ring-primary ring-offset-2'
                              : 'hover:bg-surface-container text-on-background'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                  <div className="space-y-stack-sm">
                    <label className="block font-label-md text-label-md text-on-surface-variant">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-background border border-outline-variant rounded-lg px-stack-md py-stack-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-on-background"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-stack-sm">
                    <label className="block font-label-md text-label-md text-on-surface-variant">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-background border border-outline-variant rounded-lg px-stack-md py-stack-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-on-background"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-stack-sm">
                  <label className="block font-label-md text-label-md text-on-surface-variant">Preferred Time</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-background border border-outline-variant rounded-lg px-stack-md py-stack-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-on-background appearance-none"
                  >
                    <option>Morning (9:00 AM - 12:00 PM)</option>
                    <option>Afternoon (12:00 PM - 4:00 PM)</option>
                    <option>Evening (4:00 PM - 7:00 PM)</option>
                  </select>
                </div>

                <div className="space-y-stack-sm">
                  <label className="block font-label-md text-label-md text-on-surface-variant">Message or Specific Questions</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-background border border-outline-variant rounded-lg px-stack-md py-stack-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-on-background"
                    placeholder="Tell us more about what you're looking for..."
                    rows={4}
                  />
                </div>

                <button
                  type="submit"
                  disabled={formSubmitLoading}
                  className="w-full py-stack-md bg-primary text-on-primary rounded-lg font-headline-md text-headline-md shadow-md hover:bg-primary-container active:scale-[0.98] transition-all"
                >
                  {formSubmitLoading ? 'Scheduling walkthrough...' : 'Confirm Viewing Request'}
                </button>
                <p className="text-center font-label-sm text-label-sm text-outline">
                  By clicking confirm, you agree to our <span className="underline cursor-pointer">Terms</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
