import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface PendingProperty {
  id: string;
  title: string;
  price: number;
  type: string;
  city: string;
  agent: { name: string; email: string };
}

interface BookingLog {
  id: string;
  date: string;
  timeSlot: string;
  status: string;
  property: { title: string };
  user: { name: string; email: string };
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'stats' | 'approvals' | 'users' | 'bookings'>('stats');

  // Stats and lists
  const [metrics, setMetrics] = useState({ totalUsers: 0, pendingApprovals: 0, approvedListings: 0, totalBookings: 0, totalInquiries: 0 });
  const [analytics, setAnalytics] = useState<{ month: string; revenue: number; listings: number }[]>([]);
  const [pendingProperties, setPendingProperties] = useState<PendingProperty[]>([]);
  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([]);
  const [bookings, setBookings] = useState<BookingLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await axios.get('/dashboard/stats');
      if (statsRes.data.success) {
        setMetrics(statsRes.data.data.metrics);
        setAnalytics(statsRes.data.data.analytics);
      }

      // Fetch pending properties for approvals
      const propRes = await axios.get('/properties?status=PENDING');
      if (propRes.data.success) {
        setPendingProperties(propRes.data.data);
      }

      // Mock users list (In a real app, we would have a specific admin/users endpoint)
      // For demo, we'll fetch default user information or simulate lists
      setPlatformUsers([
        { id: '1', name: 'John Doe', email: 'user@xyzhomes.com', role: 'USER', createdAt: '2024-05-12' },
        { id: '2', name: 'Marcus Richardson', email: 'agent@xyzhomes.com', role: 'AGENT', createdAt: '2024-04-18' },
        { id: '3', name: 'System Admin', email: 'admin@xyzhomes.com', role: 'ADMIN', createdAt: '2024-01-01' },
      ]);

      const bookingRes = await axios.get('/bookings');
      if (bookingRes.data.success) {
        setBookings(bookingRes.data.data);
      }
    } catch (error) {
      console.error('Failed to load admin dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleApproveProperty = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await axios.patch(`/properties/${id}/approve`, { status });
      if (res.data.success) {
        setPendingProperties(pendingProperties.filter((p) => p.id !== id));
        // Update metrics
        setMetrics((prev) => ({
          ...prev,
          pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
          approvedListings: status === 'APPROVED' ? prev.approvedListings + 1 : prev.approvedListings,
        }));
      }
    } catch (error) {
      console.error('Failed to update property approval status', error);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to suspend this user account?')) {
      setPlatformUsers(platformUsers.filter((u) => u.id !== userId));
      setMetrics((prev) => ({ ...prev, totalUsers: Math.max(0, prev.totalUsers - 1) }));
    }
  };

  if (loading) {
    return (
      <div className="pt-24 max-w-container-max mx-auto px-gutter py-8 animate-pulse text-center">
        Loading admin panel...
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
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-label-md text-label-md">Dashboard Stats</span>
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-transform text-left ${
              activeTab === 'approvals' ? 'bg-secondary-container text-on-secondary-container' : 'text-secondary hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined">rule</span>
            <span className="font-label-md text-label-md">Property Approvals ({metrics.pendingApprovals})</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-transform text-left ${
              activeTab === 'users' ? 'bg-secondary-container text-on-secondary-container' : 'text-secondary hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined">group</span>
            <span className="font-label-md text-label-md">User Management</span>
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-transform text-left ${
              activeTab === 'bookings' ? 'bg-secondary-container text-on-secondary-container' : 'text-secondary hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="font-label-md text-label-md">Global Bookings</span>
          </button>
        </nav>

        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary text-3xl">admin_panel_settings</span>
            <div>
              <p className="font-label-md text-label-md text-on-surface font-bold line-clamp-1">{user?.name}</p>
              <p className="text-[10px] text-primary uppercase font-bold">Platform Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main dashboard content */}
      <main className="flex-grow p-gutter overflow-y-auto">
        {activeTab === 'stats' && (
          <div className="space-y-stack-lg">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-md">
              <div className="bg-surface p-stack-md rounded-xl border border-outline-variant/30 shadow-sm">
                <p className="text-on-surface-variant font-label-md text-label-md">Total Users</p>
                <h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">{metrics.totalUsers}</h3>
              </div>
              <div className="bg-surface p-stack-md rounded-xl border border-outline-variant/30 shadow-sm">
                <p className="text-on-surface-variant font-label-md text-label-md">Pending Approvals</p>
                <h3 className="font-headline-lg text-headline-lg text-primary mt-2">{metrics.pendingApprovals}</h3>
              </div>
              <div className="bg-surface p-stack-md rounded-xl border border-outline-variant/30 shadow-sm">
                <p className="text-on-surface-variant font-label-md text-label-md">Approved Listings</p>
                <h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">{metrics.approvedListings}</h3>
              </div>
              <div className="bg-surface p-stack-md rounded-xl border border-outline-variant/30 shadow-sm">
                <p className="text-on-surface-variant font-label-md text-label-md">Global Tour Bookings</p>
                <h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">{metrics.totalBookings}</h3>
              </div>
            </div>

            {/* Platform Revenue Line Chart */}
            <div className="bg-surface p-6 rounded-xl border border-outline-variant/30 space-y-4 max-w-4xl">
              <h3 className="font-headline-md text-headline-md text-on-background">Monthly Revenue Analytics</h3>
              <p className="text-xs text-on-surface-variant">Closed listing values and platform activities</p>

              <div className="pt-6 flex items-end justify-between h-64 border-b border-outline-variant/30 pb-2 gap-4">
                {analytics.map((perf, index) => {
                  const maxVal = Math.max(...analytics.map((p) => p.revenue)) || 1;
                  const barHeight = (perf.revenue / maxVal) * 100;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div
                        style={{ height: `${barHeight}%` }}
                        className="w-8 bg-primary/80 hover:bg-primary rounded-t transition-all"
                        title={`Revenue: $${perf.revenue.toLocaleString()}`}
                      />
                      <span className="text-xs font-bold font-geist text-on-surface-variant">{perf.month}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-center text-on-surface-variant italic pt-2">
                * Simulated Revenue represent values generated by platform transactions.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Approvals Table */}
        {activeTab === 'approvals' && (
          <div className="space-y-stack-md">
            <h2 className="font-headline-lg text-headline-lg text-on-background">Properties Pending Approval</h2>
            <div className="bg-surface border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm max-w-4xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-container-low text-on-surface-variant font-label-md">
                    <th className="p-4">Listing Title</th>
                    <th className="p-4">Agent Name</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">City</th>
                    <th className="p-4">Type</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-on-background">
                  {pendingProperties.length > 0 ? (
                    pendingProperties.map((prop) => (
                      <tr key={prop.id} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="p-4 font-bold">{prop.title}</td>
                        <td className="p-4">
                          <p>{prop.agent.name}</p>
                          <p className="text-xs text-on-surface-variant">{prop.agent.email}</p>
                        </td>
                        <td className="p-4">${prop.price.toLocaleString()}</td>
                        <td className="p-4">{prop.city}</td>
                        <td className="p-4">{prop.type}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleApproveProperty(prop.id, 'APPROVED')}
                            className="text-primary hover:underline font-bold text-xs bg-primary/10 border border-primary/20 px-2.5 py-1.5 rounded"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproveProperty(prop.id, 'REJECTED')}
                            className="text-error hover:underline font-bold text-xs bg-error-container/10 border border-error/20 px-2.5 py-1.5 rounded"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-on-surface-variant italic">
                        No property approvals currently pending.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Users Table */}
        {activeTab === 'users' && (
          <div className="space-y-stack-md">
            <h2 className="font-headline-lg text-headline-lg text-on-background">User Accounts Management</h2>
            <div className="bg-surface border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm max-w-4xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-container-low text-on-surface-variant font-label-md">
                    <th className="p-4">User Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Created At</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-on-background">
                  {platformUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="p-4 font-bold">{u.name}</td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-primary text-on-primary'
                            : u.role === 'AGENT'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-surface-container-highest text-on-surface-variant'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">{u.createdAt}</td>
                      <td className="p-4 text-right">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-error hover:underline font-bold text-xs"
                          >
                            Suspend User
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Bookings Table */}
        {activeTab === 'bookings' && (
          <div className="space-y-stack-md">
            <h2 className="font-headline-lg text-headline-lg text-on-background">Global Bookings Log</h2>
            <div className="bg-surface border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm max-w-4xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-container-low text-on-surface-variant font-label-md">
                    <th className="p-4">Client</th>
                    <th className="p-4">Property</th>
                    <th className="p-4">Tour Date</th>
                    <th className="p-4">Time Slot</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-on-background">
                  {bookings.length > 0 ? (
                    bookings.map((book) => (
                      <tr key={book.id} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="p-4 font-bold">
                          <p>{book.user.name}</p>
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-on-surface-variant italic">
                        No scheduled tours logged on platform.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
