import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { PropertyForm } from '../../components/PropertyForm';
import { ChatInterface } from '../../components/ChatInterface';

interface Property {
  id: string;
  title: string;
  price: number;
  city: string;
  type: string;
  status: string;
}

interface Booking {
  id: string;
  date: string;
  timeSlot: string;
  status: string;
  message?: string;
  property: { title: string };
  user: { name: string; email: string };
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
  property: { title: string };
}

export const AgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = (searchParams.get('tab') as any) || 'stats';
  const chatUserId = searchParams.get('chatUser');

  // Active tab selection
  const [activeTab, setActiveTab] = useState<'stats' | 'listings' | 'bookings' | 'inquiries' | 'messages'>(defaultTab);

  // Stats and metrics
  const [metrics, setMetrics] = useState({ myListings: 0, activeBookings: 0, clientInquiries: 0, pendingBookings: 0, profileStrength: 85 });
  const [performance, setPerformance] = useState<{ month: string; deals: number; bookings: number }[]>([]);
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Property Listing form modal
  const [showAddModal, setShowAddModal] = useState(false);

  // Read URL query parameter for tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'listings') {
      setActiveTab('listings');
    }
  }, [searchParams]);

  const loadAgentData = async () => {
    setLoading(true);
    try {
      const statsRes = await axios.get('/dashboard/stats');
      if (statsRes.data.success) {
        setMetrics(statsRes.data.data.metrics);
        setPerformance(statsRes.data.data.performance);
      }

      // Fetch agent's properties
      const propRes = await axios.get('/properties?status=PENDING'); // get all statuses
      const propRes2 = await axios.get('/properties?status=APPROVED');
      const combined = [...propRes.data.data, ...propRes2.data.data].filter(p => p.agent?.id === user?.id);
      setMyProperties(combined);

      const bookingRes = await axios.get('/bookings');
      if (bookingRes.data.success) {
        setBookings(bookingRes.data.data);
      }

      const inquiryRes = await axios.get('/inquiries');
      if (inquiryRes.data.success) {
        setInquiries(inquiryRes.data.data);
      }
    } catch (error) {
      console.error('Failed to load agent dashboard details', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgentData();
  }, [user]);

  const handleFormSuccess = () => {
    setShowAddModal(false);
    loadAgentData();
  };

  const handleBookingAction = async (id: string, status: 'CONFIRMED' | 'REJECTED') => {
    try {
      const res = await axios.patch(`/bookings/${id}/status`, { status });
      if (res.data.success) {
        setBookings(bookings.map((b) => (b.id === id ? { ...b, status } : b)));
        // Refresh metrics
        setMetrics((prev) => ({
          ...prev,
          pendingBookings: Math.max(0, prev.pendingBookings - 1),
        }));
      }
    } catch (error) {
      console.error('Failed to complete booking action', error);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await axios.delete(`/properties/${id}`);
      if (res.data.success) {
        setMyProperties(myProperties.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete property', error);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 max-w-container-max mx-auto px-gutter py-8 animate-pulse text-center">
        Loading agent workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background pt-16">
      {/* Sidebar navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-outline-variant/30 p-stack-md shrink-0">
        <nav className="flex-grow space-y-1">
          <button
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-transform text-left ${
              activeTab === 'stats' ? 'bg-secondary-container text-on-secondary-container' : 'text-secondary hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined">trending_up</span>
            <span className="font-label-md text-label-md">Analytics Stats</span>
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-transform text-left ${
              activeTab === 'listings' ? 'bg-secondary-container text-on-secondary-container' : 'text-secondary hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined">home_work</span>
            <span className="font-label-md text-label-md">My Listings</span>
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-transform text-left ${
              activeTab === 'bookings' ? 'bg-secondary-container text-on-secondary-container' : 'text-secondary hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="font-label-md text-label-md">Bookings & Tours ({metrics.pendingBookings})</span>
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-transform text-left ${
              activeTab === 'inquiries' ? 'bg-secondary-container text-on-secondary-container' : 'text-secondary hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined">chat_bubble</span>
            <span className="font-label-md text-label-md">Client Inquiries</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-transform text-left ${
              activeTab === 'messages' ? 'bg-secondary-container text-on-secondary-container' : 'text-secondary hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined">chat</span>
            <span className="font-label-md text-label-md">Messages</span>
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
              <p className="text-[10px] text-primary uppercase font-bold">Premium Agent</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:shadow-md transition-all active:scale-95 text-center"
          >
            Create New Listing
          </button>
        </div>
      </aside>

      {/* Main content pane */}
      <main className="flex-grow p-gutter overflow-y-auto">
        {activeTab === 'stats' && (
          <div className="space-y-stack-lg">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-md">
              <div className="bg-surface p-stack-md rounded-xl border border-outline-variant/30 shadow-sm">
                <p className="text-on-surface-variant font-label-md text-label-md">My Listings</p>
                <h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">{metrics.myListings}</h3>
              </div>
              <div className="bg-surface p-stack-md rounded-xl border border-outline-variant/30 shadow-sm">
                <p className="text-on-surface-variant font-label-md text-label-md">Total Viewings</p>
                <h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">{metrics.activeBookings}</h3>
              </div>
              <div className="bg-surface p-stack-md rounded-xl border border-outline-variant/30 shadow-sm">
                <p className="text-on-surface-variant font-label-md text-label-md">Pending Bookings</p>
                <h3 className="font-headline-lg text-headline-lg text-primary mt-2">{metrics.pendingBookings}</h3>
              </div>
              <div className="bg-surface p-stack-md rounded-xl border border-outline-variant/30 shadow-sm">
                <p className="text-on-surface-variant font-label-md text-label-md">Inquiries Inbox</p>
                <h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">{metrics.clientInquiries}</h3>
              </div>
            </div>

            {/* Performance Charts */}
            <div className="bg-surface p-6 rounded-xl border border-outline-variant/30 space-y-4 max-w-4xl">
              <h3 className="font-headline-md text-headline-md text-on-background">Performance Statistics</h3>
              <p className="text-xs text-on-surface-variant">Monthly viewings and closed deals overview</p>

              <div className="pt-6 flex items-end justify-between h-64 border-b border-outline-variant/30 pb-2 gap-4">
                {performance.map((perf, index) => {
                  // Max height base calculations
                  const maxVal = Math.max(...performance.map((p) => p.bookings)) || 1;
                  const barHeight = (perf.bookings / maxVal) * 100;
                  const dealHeight = (perf.deals / maxVal) * 100;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div className="w-full flex items-end gap-1 justify-center flex-grow">
                        {/* Deals Bar */}
                        <div
                          style={{ height: `${dealHeight}%` }}
                          className="w-4 bg-tertiary-container rounded-t"
                          title={`Deals: ${perf.deals}`}
                        />
                        {/* Bookings Bar */}
                        <div
                          style={{ height: `${barHeight}%` }}
                          className="w-4 bg-primary rounded-t"
                          title={`Tours: ${perf.bookings}`}
                        />
                      </div>
                      <span className="text-xs font-bold font-geist text-on-surface-variant">{perf.month}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-6 justify-center pt-2 text-xs">
                <div className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="w-3.5 h-3.5 bg-primary rounded-sm inline-block"></span>
                  <span>Scheduled Tours</span>
                </div>
                <div className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="w-3.5 h-3.5 bg-tertiary-container rounded-sm inline-block"></span>
                  <span>Closed Deals</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Listings List */}
        {activeTab === 'listings' && (
          <div className="space-y-stack-md">
            <div className="flex justify-between items-center">
              <h2 className="font-headline-lg text-headline-lg text-on-background">My Properties</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary text-on-primary px-5 py-2 rounded-lg text-sm font-label-md hover:bg-primary-container"
              >
                Create Listing
              </button>
            </div>

            <div className="bg-surface border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm max-w-4xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-container-low text-on-surface-variant font-label-md">
                    <th className="p-4">Property Title</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">City</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-on-background">
                  {myProperties.length > 0 ? (
                    myProperties.map((prop) => (
                      <tr key={prop.id} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="p-4 font-bold">{prop.title}</td>
                        <td className="p-4">{prop.type}</td>
                        <td className="p-4">₹{prop.price.toLocaleString()}</td>
                        <td className="p-4">{prop.city}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            prop.status === 'APPROVED'
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : prop.status === 'REJECTED'
                              ? 'bg-error-container text-on-error-container'
                              : 'bg-surface-container-highest text-on-surface-variant'
                          }`}>
                            {prop.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => navigate(`/properties/${prop.id}`)}
                            className="text-primary hover:underline font-bold"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(prop.id)}
                            className="text-error hover:underline font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-on-surface-variant italic">
                        No property listings submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Tours Booking approvals */}
        {activeTab === 'bookings' && (
          <div className="space-y-stack-md">
            <h2 className="font-headline-lg text-headline-lg text-on-background">Private Viewings Inbox</h2>
            <div className="bg-surface border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm max-w-4xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-container-low text-on-surface-variant font-label-md">
                    <th className="p-4">Client Detail</th>
                    <th className="p-4">Property</th>
                    <th className="p-4">Tour Date</th>
                    <th className="p-4">Time Slot</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-on-background">
                  {bookings.length > 0 ? (
                    bookings.map((book) => (
                      <tr key={book.id} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="p-4">
                          <p className="font-bold">{book.user.name}</p>
                          <p className="text-xs text-on-surface-variant">{book.user.email}</p>
                        </td>
                        <td className="p-4 font-medium">{book.property.title}</td>
                        <td className="p-4">{new Date(book.date).toDateString()}</td>
                        <td className="p-4">{book.timeSlot}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            book.status === 'CONFIRMED'
                              ? 'bg-primary text-on-primary shadow-sm'
                              : book.status === 'REJECTED'
                              ? 'bg-error-container text-on-error-container'
                              : 'bg-surface-container-highest text-on-surface-variant'
                          }`}>
                            {book.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {book.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleBookingAction(book.id, 'CONFIRMED')}
                                className="text-primary hover:underline font-bold text-xs bg-primary/10 border border-primary/20 px-2 py-1 rounded"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleBookingAction(book.id, 'REJECTED')}
                                className="text-error hover:underline font-bold text-xs bg-error-container/10 border border-error/20 px-2 py-1 rounded"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-on-surface-variant italic">
                        No scheduled visits listed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Client Inquiries */}
        {activeTab === 'inquiries' && (
          <div className="space-y-stack-md">
            <h2 className="font-headline-lg text-headline-lg text-on-background">Inquiries Log</h2>
            <div className="bg-surface border border-outline-variant/30 rounded-xl p-6 shadow-sm max-w-3xl space-y-4">
              {inquiries.length > 0 ? (
                inquiries.map((inq) => (
                  <div key={inq.id} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 flex flex-col gap-2">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold">
                          {inq.property.title}
                        </span>
                        <h4 className="font-bold text-on-background text-sm mt-1">{inq.name}</h4>
                        <p className="text-[11px] text-on-surface-variant">{inq.email} {inq.phone ? `| ${inq.phone}` : ''}</p>
                      </div>
                      <span className="text-[10px] text-outline">{new Date(inq.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed bg-background/50 p-3 rounded-lg border border-outline-variant/10 italic">
                      "{inq.message}"
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-on-surface-variant text-sm italic text-center py-12">No client inquiries found.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Messages */}
        {activeTab === 'messages' && (
          <div className="space-y-stack-md">
            <h2 className="font-headline-lg text-headline-lg text-on-background">Messages Log</h2>
            <ChatInterface defaultChatUserId={chatUserId} />
          </div>
        )}
      </main>

      {/* Add Listing Modal Form */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-outline-variant/30 rounded-xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
              <h3 className="font-headline-md text-headline-md text-on-background">List New Property</h3>
              <button onClick={() => setShowAddModal(false)} className="text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <PropertyForm 
              defaultListingType="SALE" 
              onSuccess={handleFormSuccess} 
              onCancel={() => setShowAddModal(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
