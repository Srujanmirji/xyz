import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MortgageCalculator } from '../components/MortgageCalculator';
import { MapView } from '../components/MapView';

interface PropertyDetail {
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
  latitude: number;
  longitude: number;
  area: number;
  type: string;
  status: string;
  featured: boolean;
  virtualTourUrl?: string;
  amenities: string[];
  images: { id: string; imageUrl: string }[];
  agent: { id: string; name: string; email: string; avatar?: string };
  reviews: {
    id: string;
    rating: number;
    review: string;
    createdAt: string;
    user: { name: string; avatar?: string };
  }[];
}

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Contact Agent popup mock
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquiryName, setInquiryName] = useState(user?.name || '');
  const [inquiryEmail, setInquiryEmail] = useState(user?.email || '');

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/properties/${id}`);
      if (res.data.success) {
        setProperty(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching property details', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to leave a review');
      return;
    }

    if (!reviewText.trim()) return;

    setReviewLoading(true);
    try {
      const res = await axios.post('/properties/reviews', {
        propertyId: id,
        rating,
        review: reviewText,
      });

      if (res.data.success) {
        setReviewText('');
        fetchProperty(); // Refresh reviews
      }
    } catch (error) {
      console.error('Error submitting review', error);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryMsg.trim() || !inquiryName || !inquiryEmail) return;

    try {
      const res = await axios.post('/inquiries', {
        propertyId: id,
        name: inquiryName,
        email: inquiryEmail,
        message: inquiryMsg,
      });

      if (res.data.success) {
        setInquirySent(true);
        setInquiryMsg('');
      }
    } catch (error) {
      console.error('Failed to submit inquiry', error);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 max-w-container-max mx-auto px-gutter py-8 animate-pulse space-y-6">
        <div className="h-96 bg-surface-container rounded-xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-8 bg-surface-container w-2/3 rounded"></div>
            <div className="h-4 bg-surface-container w-1/2 rounded"></div>
            <div className="h-32 bg-surface-container rounded"></div>
          </div>
          <div className="lg:col-span-4 h-60 bg-surface-container rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="pt-24 text-center py-20 bg-background">
        <span className="material-symbols-outlined text-[48px] text-error mb-2">error</span>
        <p className="text-on-surface-variant font-bold">Property not found or deleted.</p>
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
    <div className="pt-20 pb-stack-lg bg-background">
      {/* Property visual banner / gallery */}
      <section className="relative h-[400px] md:h-[550px] overflow-hidden">
        <img
          src={mainImage}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6 max-w-container-max mx-auto px-gutter text-white w-full flex justify-between items-end flex-wrap gap-4">
          <div>
            <span className="bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded-full uppercase">
              {property.type}
            </span>
            <h1 className="font-headline-xl text-headline-xl text-white mt-2 leading-tight">
              {property.title}
            </h1>
            <p className="font-body-md text-body-md text-white/90 flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {property.address}, {property.city}, {property.state}
            </p>
          </div>
          <div className="bg-surface/90 dark:bg-surface-container/90 backdrop-blur-md px-6 py-3 rounded-xl border border-outline-variant/30 text-on-background shadow-lg text-right">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-label-md">Price</span>
            <p className="font-headline-lg text-headline-lg text-primary font-bold">
              ${property.price.toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      {/* Main split details layout */}
      <main className="max-w-container-max mx-auto px-gutter mt-12 grid grid-cols-1 lg:grid-cols-12 gap-margin-desktop">
        {/* Left column: main descriptions */}
        <div className="lg:col-span-8 space-y-stack-lg">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 text-center">
            <div>
              <span className="material-symbols-outlined text-primary text-2xl mb-1">bed</span>
              <p className="font-bold text-on-background text-lg">{property.bedrooms}</p>
              <p className="text-xs text-on-surface-variant">Bedrooms</p>
            </div>
            <div>
              <span className="material-symbols-outlined text-primary text-2xl mb-1">bathtub</span>
              <p className="font-bold text-on-background text-lg">{property.bathrooms}</p>
              <p className="text-xs text-on-surface-variant">Bathrooms</p>
            </div>
            <div>
              <span className="material-symbols-outlined text-primary text-2xl mb-1">square_foot</span>
              <p className="font-bold text-on-background text-lg">{property.area.toLocaleString()}</p>
              <p className="text-xs text-on-surface-variant">Sq Feet</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-stack-sm">
            <h2 className="font-headline-lg text-headline-lg text-on-background">Overview</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities checklist */}
          <div className="space-y-stack-sm">
            <h2 className="font-headline-md text-headline-md text-on-background">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {property.amenities.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-on-surface-variant bg-surface-container-low p-3 rounded-lg border border-outline-variant/10 text-sm">
                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Property Location Map */}
          <div className="space-y-stack-sm">
            <h2 className="font-headline-md text-headline-md text-on-background">Location</h2>
            <MapView
              mode="static"
              latitude={property.latitude}
              longitude={property.longitude}
              label={`${property.title} — ${property.address}, ${property.city}`}
              className="h-[320px]"
            />
            <p className="text-xs text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
              {property.address}, {property.city}, {property.state}, {property.country}
            </p>
          </div>

          {/* Gallery Slider if multiple images exist */}
          {property.images.length > 1 && (
            <div className="space-y-stack-sm">
              <h2 className="font-headline-md text-headline-md text-on-background">Photo Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.images.map((img) => (
                  <a
                    key={img.id}
                    href={img.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="aspect-video rounded-lg overflow-hidden border border-outline-variant/20 hover:scale-[1.02] transition-all"
                  >
                    <img src={img.imageUrl} alt="Property" className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Virtual Tour integration */}
          {property.virtualTourUrl && (
            <div className="space-y-stack-sm">
              <h2 className="font-headline-md text-headline-md text-on-background">Virtual Tour</h2>
              <div className="relative aspect-video rounded-xl overflow-hidden border border-outline-variant/20">
                <iframe
                  title="Virtual Tour"
                  src={property.virtualTourUrl}
                  className="absolute inset-0 w-full h-full border-none"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {/* Calculators widget */}
          <MortgageCalculator propertyPrice={property.price} />

          {/* Reviews List & Submission */}
          <div className="space-y-stack-md pt-6 border-t border-outline-variant/20">
            <h2 className="font-headline-lg text-headline-lg text-on-background">Property Reviews</h2>

            {/* Review Form */}
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 space-y-4">
                <h4 className="font-bold text-on-background">Write a Review</h4>
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-on-surface-variant font-label-md">Rating</span>
                  <div className="flex text-tertiary">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setRating(stars)}
                        className="material-symbols-outlined"
                        style={{ fontVariationSettings: `'FILL' ${stars <= rating ? 1 : 0}` }}
                      >
                        star
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your feedback regarding the property, neighborhood, or agent support..."
                  className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                  rows={4}
                />
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="bg-primary text-on-primary px-6 py-2 rounded-lg text-sm font-label-md hover:bg-primary-container active:scale-95 transition-all"
                >
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="bg-surface-container-low p-4 rounded-lg text-center text-sm text-on-surface-variant border border-outline-variant/10">
                Please <Link to="/auth/login" className="text-primary hover:underline">log in</Link> to leave a review.
              </div>
            )}

            {/* Review List */}
            <div className="space-y-4">
              {property.reviews.length > 0 ? (
                property.reviews.map((rev) => (
                  <div key={rev.id} className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                          alt={rev.user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-on-background text-sm">{rev.user.name}</p>
                          <p className="text-[10px] text-outline">{new Date(rev.createdAt).toDateString()}</p>
                        </div>
                      </div>
                      <div className="flex text-tertiary">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className="material-symbols-outlined text-sm"
                            style={{ fontVariationSettings: `'FILL' ${i < rev.rating ? 1 : 0}` }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed italic">
                      "{rev.review}"
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-on-surface-variant text-sm italic">No reviews listed for this property yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Sticky Agent Card and Schedule widget */}
        <div className="lg:col-span-4">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 space-y-6 sticky top-28 shadow-sm">
            <div>
              <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Listing Agent
              </span>
              <div className="flex items-center gap-4 mt-4">
                <img
                  src={property.agent.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSkicAybPR0ud2JzGfxqMUYrfRuNI2r4WV_Iy0fWszVDXW9mdSnw-OlGJeFfmKtonA0-Wx4m92TOcwNF6S-QS6YpKxyo0BqS9tW88Mz75Q2YGMobN4FFFaR9nC3gzsVGJvVCb0EHlkiLKJ05SHA6o9aYfYeZ3b9GDNWhLnd_6j5j1-m1ZO24FzHgp7Rm0hmiCXgxVna-jcJkvPS5dy46hVAeK8GR9AE1D8sllHYFMoKMKS5h4dLpXFEEWKGdmqg7Ib7KNPB3eKIBk'}
                  alt={property.agent.name}
                  className="w-16 h-16 rounded-full border border-outline-variant/30 object-cover"
                />
                <div>
                  <h3 className="font-bold text-on-background">{property.agent.name}</h3>
                  <p className="text-xs text-on-surface-variant">Senior Property Advisor</p>
                  <p className="text-[11px] text-primary">{property.agent.email}</p>
                </div>
              </div>
            </div>

            {/* Visit scheduler action */}
            <div className="space-y-2">
              <Link
                to={`/booking/${property.id}`}
                className="w-full bg-primary text-on-primary py-3 rounded-lg text-center font-headline-md text-headline-md shadow-md hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">calendar_today</span>
                Schedule Private Visit
              </Link>
            </div>

            {user?.id !== property.agent.id && (
              <div className="space-y-2">
                <Link
                  to={`/dashboard?tab=messages&chatUser=${property.agent.id}`}
                  className="w-full border border-primary text-primary py-3 rounded-lg text-center font-label-lg text-label-lg hover:bg-primary/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">chat</span>
                  Chat with Owner
                </Link>
              </div>
            )}

            {/* Inquiries message block */}
            <div className="border-t border-outline-variant/20 pt-4 space-y-3">
              <h4 className="font-bold text-on-background text-sm">Contact Agent</h4>

              {inquirySent ? (
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg text-center text-xs text-primary font-bold">
                  Inquiry sent successfully! Marcus will contact you shortly.
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-3">
                  {!isAuthenticated && (
                    <>
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-background focus:outline-none"
                      />
                      <input
                        type="email"
                        placeholder="Your Email"
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-background focus:outline-none"
                      />
                    </>
                  )}
                  <textarea
                    placeholder="Enter message (e.g. Price negotiable? Are pets allowed?)"
                    value={inquiryMsg}
                    onChange={(e) => setInquiryMsg(e.target.value)}
                    className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-background focus:outline-none"
                    rows={3}
                  />
                  <button
                    type="submit"
                    className="w-full bg-surface-container-high hover:bg-surface-container-highest text-on-background py-2 rounded-lg text-xs font-label-md transition-all flex items-center justify-center gap-1 border border-outline-variant/30 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">mail</span>
                    Send Message Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
