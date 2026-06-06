import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PropertyCard, type Property } from '../components/PropertyCard';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Search Inputs
  const [search, setSearch] = useState('');
  const [type, setType] = useState('Property Type');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get('/properties?featured=true&limit=3');
        if (res.data.success) {
          setFeatured(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching featured properties', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (type && type !== 'Property Type') params.append('type', type);
    if (maxPrice) params.append('maxPrice', maxPrice);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[650px] md:h-[870px] min-h-[500px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover"
            alt="XYZ Homes Premium Villa"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5AZjY7thVj3gZVgr5W2XVTnxS1uRqLhLlQF4QUkSoRtKORpcfRFPLLsPckYD7EFqpioZ9g55t-p5wywXqQ6QKT9PqlMcXHB6s5bIzebBnVLJeFZq9TNzHQxD0t_nIXEV3fl7KW1kdwwMfa5O043yyGvYj_IRVLgg8Ni3ox9zk_FC2SnCeiaqAVhOp4E3b0STJkQXlR8B8t277hw4UYchG-GFs6fPSO-KLQZtdIfAOUZ-VClAtUB7sPxDzs2CA2CpvT6U846Tmyq0"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent dark:from-background dark:via-background/50 dark:to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-container-max mx-auto px-gutter w-full mt-20">
          <div className="max-w-2xl">
            <h1 className="font-headline-xl text-headline-xl mb-stack-md text-on-background">
              Find the Perfect Place to Call Home
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-lg">
              Discover curated listings of exceptional residences, from minimalist urban lofts to sprawling coastal villas.
            </p>
            
            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="glass-effect p-2 rounded-xl shadow-lg border border-outline-variant/30 flex flex-col md:flex-row gap-2 max-w-3xl"
            >
              <div className="flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-outline-variant/20 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <input
                  type="text"
                  placeholder="Location, City, Address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md text-on-background placeholder:text-outline focus:outline-none"
                />
              </div>
              <div className="flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-outline-variant/20 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">home</span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md text-on-background focus:outline-none appearance-none"
                >
                  <option className="bg-surface">Property Type</option>
                  <option className="bg-surface">Apartment</option>
                  <option className="bg-surface">Villa</option>
                  <option className="bg-surface">House</option>
                  <option className="bg-surface">Commercial</option>
                </select>
              </div>
              <div className="flex-1 px-4 py-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">payments</span>
                <input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md text-on-background placeholder:text-outline focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label-md text-label-md transition-all hover:bg-primary-container active:scale-95 whitespace-nowrap"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-stack-lg bg-surface-container-low border-b border-outline-variant/10">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="flex flex-wrap justify-center gap-stack-md md:gap-stack-lg">
            <Link to="/properties?type=Apartment" className="group flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>apartment</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-on-background">
                Apartment
              </span>
            </Link>
            <Link to="/properties?type=Villa" className="group flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>villa</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-on-background">
                Villa
              </span>
            </Link>
            <Link to="/properties?type=House" className="group flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>home</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-on-background">
                House
              </span>
            </Link>
            <Link to="/properties?type=Commercial" className="group flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>domain</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-on-background">
                Commercial
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-stack-lg bg-background">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="flex justify-between items-end mb-stack-lg">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-background animate-fade-in">
                Featured Properties
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Handpicked residences of exceptional quality.
              </p>
            </div>
            <Link
              to="/properties"
              className="text-primary font-label-md text-label-md flex items-center gap-1 hover:underline"
            >
              View All Listings <span className="material-symbols-outlined">chevron_right</span>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-surface-container rounded-lg h-96 border border-outline-variant/30" />
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featured.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-surface-container rounded-xl border border-outline-variant/20">
              <p className="text-on-surface-variant">No featured properties found.</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-stack-lg bg-surface-container-lowest border-t border-b border-outline-variant/20">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-headline-lg text-headline-lg mb-stack-md text-on-background">
                Why Choose XYZ Homes
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
                We redefine the real estate experience through transparency, cutting-edge technology, and a dedication to finding your ideal living space.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-headline-md text-on-background text-[18px]">
                      Verified Listings
                    </h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Every property on our platform undergoes a rigorous vetting process for your peace of mind.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">support_agent</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-headline-md text-on-background text-[18px]">
                      Expert Guidance
                    </h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Our team of experienced agents provides personalized support from search to settlement.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">trending_up</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-headline-md text-on-background text-[18px]">
                      Market Insights
                    </h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Access real-time data and trends to make informed decisions about your property investments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-outline-variant/10">
              <img
                className="w-full h-full object-cover min-h-[400px]"
                alt="XYZ Homes Office Meeting"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFr-zgCDuThdoeyVGpkHzCByr3IO5Htl-JaTM6ciY_bUXbnILGBSA3ZsRYMnaJRmdLPo4Rgi7X-sUHSJ4eZhZ1GtVAdWDWJpnfLMpZN5LTH_9CwWnnnd23tomvjdTYZ_gM2ggh3_sPfyWUguAU1fgLVtSlgfQg7KuDjPrzabxIdX8IZuzeFH_jSTixg_sL_Fya1zU53_cxPCM08TH-qWLB3_Qf2Cd6zf4EPIU6I2Ovsu1tER7325dm6PcetfGWqcSZQDT7cJdeOr4"
              />
              <div className="absolute bottom-8 left-8 bg-surface/90 backdrop-blur-md p-6 rounded-xl border border-outline-variant/30 dark:bg-surface-container/90">
                <p className="font-headline-lg text-headline-lg text-primary">98%</p>
                <p className="font-label-md text-label-md text-on-surface-variant">Customer Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-stack-lg bg-background">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="text-center mb-stack-lg">
            <h2 className="font-headline-lg text-headline-lg text-on-background">What Our Clients Say</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Join thousands of happy homeowners who found their perfect place.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/20 shadow-sm transition-standard hover:translate-y-[-4px]">
              <div className="flex text-tertiary-container text-tertiary mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6 italic">
                "The process was incredibly smooth. XYZ Homes provided us with options we didn't even know were on the market. Highly recommended!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary font-bold">SJ</div>
                <div>
                  <p className="font-label-md text-label-md text-on-background font-bold">Sarah Jenkins</p>
                  <p className="font-label-sm text-label-sm text-outline">Home Buyer</p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/20 shadow-sm transition-standard hover:translate-y-[-4px]">
              <div className="flex text-tertiary mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6 italic">
                "As a seller, I appreciated the transparent communication and the presentation of my property. We closed faster than expected."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold">MC</div>
                <div>
                  <p className="font-label-md text-label-md text-on-background font-bold">Michael Chen</p>
                  <p className="font-label-sm text-label-sm text-outline">Property Owner</p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/20 shadow-sm transition-standard hover:translate-y-[-4px]">
              <div className="flex text-tertiary mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6 italic">
                "Minimalist, efficient, and extremely helpful. The search tools are leagues ahead of other platforms. Found my dream apartment in a week."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center text-tertiary font-bold">DT</div>
                <div>
                  <p className="font-label-md text-label-md text-on-background font-bold">David Thorne</p>
                  <p className="font-label-sm text-label-sm text-outline">Urban Renter</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
