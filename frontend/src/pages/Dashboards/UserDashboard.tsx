import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Booking {
  id: string;
  date: string;
  timeSlot: string;
  status: string;
  property: { id: string; title: string; address: string };
}

interface SavedProperty {
  id: string;
  title: string;
  price: number;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: { imageUrl: string }[];
}

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const UserDashboard: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Selected tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'saved' | 'appointments' | 'notifications' | 'profile'>('dashboard');

  // Dashboard state
  const [metrics, setMetrics] = useState({ savedProperties: 0, upcomingTours: 0, unreadNotifications: 0, profileStrength: 60 });
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit fields
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [editSuccess, setEditSuccess] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await axios.get('/dashboard/stats');
      if (statsRes.data.success) {
        setMetrics(statsRes.data.data.metrics);
      }

      const favRes = await axios.get('/properties/favorites');
      if (favRes.data.success) {
        setSavedProperties(favRes.data.data);
      }

      const bookingRes = await axios.get('/bookings');
      if (bookingRes.data.success) {
        setBookings(bookingRes.data.data);
      }

      const notifRes = await axios.get('/dashboard/notifications');
      if (notifRes.data.success) {
        setNotifications(notifRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching user dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSuccess('');
    try {
      await updateProfile({ name, avatar });
      setEditSuccess('Profile details updated successfully.');
    } catch (error) {
      console.error('Failed to update user profile', error);
    }
  };

  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      const res = await axios.post('/properties/favorites', { propertyId });
      if (res.data.success) {
        setSavedProperties(savedProperties.filter((p) => p.id !== propertyId));
        // Recalculate metrics
        setMetrics((prev) => ({ ...prev, savedProperties: prev.savedProperties - 1 }));
      }
    } catch (error) {
      console.error('Failed to unsave property', error);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const res = await axios.patch(`/dashboard/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
        setMetrics((prev) => ({ ...prev, unreadNotifications: Math.max(0, prev.unreadNotifications - 1) }));
      }
    } catch (error) {
      console.error('Error marking notification read', error);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 max-w-container-max mx-auto px-gutter py-8 animate-pulse text-center">
        Loading personal dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background pt-16">
      {/* Sidebar navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-outline-variant/30 p-stack-md shrink-0">
        <nav className="flex-grow space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-transform text-left ${
              activeTab === 'dashboard' ? 'bg-secondary-container text-on-secondary-container' : 'text-secondary hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md text-label-md">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-transform text-left ${
              activeTab === 'saved' ? 'bg-secondary-container text-on-secondary-container' : 'text-secondary hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined">favorite</span>
            <span className="font-label-md text-label-md">Saved Homes</span>
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-transform text-left ${
              activeTab === 'appointments' ? 'bg-secondary-container text-on-secondary-container' : 'text-secondary hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="font-label-md text-label-md">Tours & Visits</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-transform text-left ${
              activeTab === 'notifications' ? 'bg-secondary-container text-on-secondary-container' : 'text-secondary hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="font-label-md text-label-md">Notifications ({metrics.unreadNotifications})</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-transform text-left ${
              activeTab === 'profile' ? 'bg-secondary-container text-on-secondary-container' : 'text-secondary hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Profile Settings</span>
          </button>
        </nav>

        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover border border-outline-variant"
            />
            <div>
              <p className="font-label-md text-label-md text-on-surface font-bold line-clamp-1">{user?.name}</p>
              <p className="text-[10px] text-on-surface-variant uppercase font-bold">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/properties')}
            className="w-full py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:shadow-md transition-all active:scale-95 text-center"
          >
            Find New Property
          </button>
        </div>
      </aside>

      {/* Main dashboard content panels */}
      <main className="flex-grow p-gutter overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-stack-lg">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-md">
              <div className="bg-surface p-stack-md rounded-xl border border-outline-variant/30 shadow-sm">
                <p className="text-on-surface-variant font-label-md text-label-md">Saved Properties</p>
                <div className="flex items-end justify-between mt-2">
                  <h3 className="font-headline-lg text-headline-lg text-on-surface">{metrics.savedProperties}</h3>
                  <span className="text-primary font-label-sm text-label-sm">Total Bookmarked</span>
                </div>
              </div>
              <div className="bg-surface p-stack-md rounded-xl border border-outline-variant/30 shadow-sm">
                <p className="text-on-surface-variant font-label-md text-label-md">Upcoming Tours</p>
                <div className="flex items-end justify-between mt-2">
                  <h3 className="font-headline-lg text-headline-lg text-on-surface">{metrics.upcomingTours}</h3>
                  <span className="text-primary font-label-sm text-label-sm">Active Viewings</span>
                </div>
              </div>
              <div className="bg-surface p-stack-md rounded-xl border border-outline-variant/30 shadow-sm">
                <p className="text-on-surface-variant font-label-md text-label-md">Unread Notifications</p>
                <div className="flex items-end justify-between mt-2">
                  <h3 className="font-headline-lg text-headline-lg text-on-surface">{metrics.unreadNotifications}</h3>
                  <span className="text-error font-label-sm text-label-sm">Unchecked Messages</span>
                </div>
              </div>
              <div className="bg-surface p-stack-md rounded-xl border border-outline-variant/30 shadow-sm">
                <p className="text-on-surface-variant font-label-md text-label-md">Profile Strength</p>
                <div className="mt-4 h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${metrics.profileStrength}%` }}></div>
                </div>
                <p className="mt-2 text-right text-primary font-label-sm text-label-sm">{metrics.profileStrength}% Complete</p>
              </div>
            </div>

            {/* Content Bento Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-lg">
              {/* Left Side: Saved properties list */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="font-headline-md text-headline-md text-on-surface">Recently Saved</h2>
                  <button onClick={() => setActiveTab('saved')} className="text-primary text-sm hover:underline">
                    View All
                  </button>
                </div>

                {savedProperties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedProperties.slice(0, 2).map((prop) => (
                      <div
                        key={prop.id}
                        className="bg-surface rounded-xl overflow-hidden border border-outline-variant/30 group hover:shadow-lg transition-all duration-300"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={prop.images && prop.images.length > 0 ? prop.images[0].imageUrl : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'}
                            alt={prop.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <span className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full text-[12px] font-bold">
                            ${prop.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="p-4 flex flex-col justify-between h-40">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-on-surface line-clamp-1">{prop.title}</h4>
                              <button onClick={() => handleRemoveFavorite(prop.id)} className="text-error hover:scale-110 active:scale-95 transition-all">
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  favorite
                                </span>
                              </button>
                            </div>
                            <p className="text-on-surface-variant text-[14px]">{prop.city}, {prop.state}</p>
                          </div>
                          <div className="flex gap-4 text-on-surface-variant text-[13px] border-t border-outline-variant/20 pt-3">
                            <span>{prop.bedrooms} Beds</span>
                            <span>{prop.bathrooms} Baths</span>
                            <span>{prop.area} sqft</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-surface rounded-xl border border-outline-variant/20">
                    <p className="text-on-surface-variant text-sm italic">You have no saved properties yet.</p>
                  </div>
                )}

                {/* Recent Searches simulation */}
                <div className="pt-4">
                  <h3 className="font-bold text-on-background text-sm mb-3">Recent Search Criteria</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-2 bg-surface border border-outline-variant/20 rounded-full text-xs text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">history</span>
                      Modern Lofts in Seattle
                    </span>
                    <span className="px-4 py-2 bg-surface border border-outline-variant/20 rounded-full text-xs text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">history</span>
                      Villa listings under $2.5M
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Quick appointments overview */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="font-headline-md text-headline-md text-on-surface">Appointments</h2>
                  <button onClick={() => setActiveTab('appointments')} className="text-primary text-sm hover:underline">
                    View Calendar
                  </button>
                </div>

                <div className="space-y-4 bg-surface p-4 rounded-xl border border-outline-variant/30">
                  {bookings.length > 0 ? (
                    bookings.slice(0, 2).map((book) => {
                      const isApproved = book.status === 'CONFIRMED';
                      return (
                        <div
                          key={book.id}
                          className={`flex items-start gap-4 p-3 rounded-lg border ${
                            isApproved ? 'bg-primary-container/10 border-primary/20' : 'bg-surface-container border-outline-variant/10'
                          }`}
                        >
                          <div className="bg-primary text-on-primary w-12 h-12 rounded-lg flex flex-col items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold uppercase">{new Date(book.date).toLocaleString(undefined, { month: 'short' })}</span>
                            <span className="text-[18px] font-bold">{new Date(book.date).getDate()}</span>
                          </div>
                          <div>
                            <p className="font-bold text-on-surface text-sm line-clamp-1">{book.property.title}</p>
                            <p className="text-[11px] text-on-surface-variant flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[12px]">schedule</span>
                              {book.timeSlot}
                            </p>
                            <span className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              book.status === 'CONFIRMED' ? 'bg-primary text-on-primary' : book.status === 'REJECTED' ? 'bg-error-container text-on-error-container' : 'bg-surface-container-highest text-on-surface-variant'
                            }`}>
                              {book.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-on-surface-variant text-sm italic text-center py-6">No viewings scheduled yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Saved properties grid */}
        {activeTab === 'saved' && (
          <div className="space-y-stack-md">
            <h2 className="font-headline-lg text-headline-lg text-on-background">Saved Properties</h2>
            {savedProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedProperties.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-surface rounded-xl overflow-hidden border border-outline-variant/30 group hover:shadow-lg transition-all duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={prop.images && prop.images.length > 0 ? prop.images[0].imageUrl : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <span className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full text-[12px] font-bold">
                        ${prop.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <Link to={`/properties/${prop.id}`} className="font-bold text-on-surface hover:text-primary transition-colors text-lg line-clamp-1">
                          {prop.title}
                        </Link>
                        <button onClick={() => handleRemoveFavorite(prop.id)} className="text-error hover:scale-110 active:scale-95 transition-all">
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                            favorite
                          </span>
                        </button>
                      </div>
                      <p className="text-on-surface-variant text-sm flex items-center gap-0.5 mb-4">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {prop.city}, {prop.state}
                      </p>
                      <div className="flex justify-between border-t border-outline-variant/20 pt-4 mt-auto text-on-surface-variant text-xs font-label-md">
                        <span>{prop.bedrooms} Beds</span>
                        <span>{prop.bathrooms} Baths</span>
                        <span>{prop.area} sqft</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-surface rounded-xl border border-outline-variant/20 max-w-xl mx-auto">
                <span className="material-symbols-outlined text-[48px] text-outline mb-2">favorite</span>
                <p className="text-on-surface-variant font-bold">Your wishlist is empty.</p>
                <Link to="/properties" className="text-primary mt-2 inline-block hover:underline text-sm font-bold">
                  Browse Premium Properties
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Appointments */}
        {activeTab === 'appointments' && (
          <div className="space-y-stack-md">
            <h2 className="font-headline-lg text-headline-lg text-on-background">Your Viewing Calendar</h2>
            <div className="bg-surface border border-outline-variant/30 rounded-xl p-6 shadow-sm max-w-3xl">
              {bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((book) => (
                    <div
                      key={book.id}
                      className="flex items-center justify-between p-4 bg-surface-container-low border border-outline-variant/20 rounded-xl flex-wrap gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-primary text-on-primary w-14 h-14 rounded-lg flex flex-col items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold uppercase">{new Date(book.date).toLocaleString(undefined, { month: 'short' })}</span>
                          <span className="text-[20px] font-bold">{new Date(book.date).getDate()}</span>
                        </div>
                        <div>
                          <Link to={`/properties/${book.property.id}`} className="font-bold text-on-background hover:text-primary text-lg">
                            {book.property.title}
                          </Link>
                          <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            {book.property.address}
                          </p>
                          <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {book.timeSlot}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          book.status === 'CONFIRMED'
                            ? 'bg-primary text-on-primary shadow-sm'
                            : book.status === 'REJECTED'
                            ? 'bg-error-container text-on-error-container'
                            : 'bg-surface-container-highest text-on-surface-variant'
                        }`}>
                          {book.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-[48px] text-outline mb-2">calendar_today</span>
                  <p className="text-on-surface-variant font-bold">No viewings scheduled yet.</p>
                  <Link to="/properties" className="text-primary mt-2 inline-block hover:underline text-sm font-bold">
                    Schedule a visit now
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-stack-md">
            <h2 className="font-headline-lg text-headline-lg text-on-background">Notifications Drawer</h2>
            <div className="bg-surface border border-outline-variant/30 rounded-xl p-6 shadow-sm max-w-2xl space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                      notif.read ? 'bg-surface border-outline-variant/10 opacity-70' : 'bg-primary-container/10 border-primary/20'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-on-background text-sm">{notif.title}</h4>
                      <p className="text-xs text-on-surface-variant mt-1">{notif.message}</p>
                      <p className="text-[10px] text-outline mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
                    </div>
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="text-[11px] bg-primary text-on-primary px-3 py-1 rounded hover:bg-primary-container"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-on-surface-variant text-sm italic text-center py-12">No notifications found.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="space-y-stack-md">
            <h2 className="font-headline-lg text-headline-lg text-on-background">Account Settings</h2>
            <div className="bg-surface border border-outline-variant/30 rounded-xl p-stack-lg shadow-sm max-w-xl">
              {editSuccess && (
                <div className="bg-primary/10 border border-primary/20 text-primary p-3 rounded-lg text-xs font-bold text-center mb-4">
                  {editSuccess}
                </div>
              )}
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-label-md text-on-surface-variant">Profile Avatar URL</label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none"
                    placeholder="https://example.com/avatar.jpg"
                  />
                  {avatar && (
                    <div className="mt-2 flex items-center gap-3">
                      <img src={avatar} alt="Avatar Preview" className="w-12 h-12 rounded-full object-cover border border-outline-variant/30" />
                      <span className="text-xs text-outline italic">Avatar preview</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-label-md text-on-surface-variant">Display Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-label-md text-on-surface-variant">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email}
                    className="w-full bg-background/50 border border-outline-variant/50 rounded-lg px-3 py-2 text-sm text-on-surface-variant cursor-not-allowed"
                  />
                  <span className="text-[10px] text-outline">Email address is managed by the system account and cannot be modified.</span>
                </div>
                <button
                  type="submit"
                  className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-label-md hover:bg-primary-container transition-all"
                >
                  Save Profile Details
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
