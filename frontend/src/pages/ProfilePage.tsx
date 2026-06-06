import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
];

type TabKey = 'personal' | 'security' | 'preferences';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('personal');
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Personal info state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, phone, bio, location, avatar });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    if (newPassword !== confirmPassword) {
      setSecurityError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setSecurityError('Password must be at least 6 characters');
      return;
    }

    try {
      // Use the reset password flow with current context
      await axios.put('/auth/profile', { password: newPassword });
      setSecuritySuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setSecurityError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'personal', label: 'Personal Info', icon: 'person' },
    { key: 'security', label: 'Security', icon: 'lock' },
    { key: 'preferences', label: 'Preferences', icon: 'tune' },
  ];

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'Recently';

  return (
    <div className="pt-20 pb-16 min-h-screen bg-background">
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-primary text-on-primary px-6 py-3 rounded-xl shadow-xl flex items-center gap-2"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <span className="text-sm font-label-md">Profile updated successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-outline-variant/20 rounded-2xl p-8 mb-6 relative overflow-hidden"
        >
          {/* Background gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-br from-primary/8 to-tertiary/5" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-5 pt-8">
            {/* Avatar */}
            <div className="relative group">
              <motion.div whileHover={{ scale: 1.03 }} className="relative">
                <img
                  src={avatar || AVATAR_OPTIONS[0]}
                  alt={name}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-surface shadow-lg"
                />
                <button
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-primary text-on-primary rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-105"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    edit
                  </span>
                </button>
              </motion.div>

              {/* Avatar picker dropdown */}
              <AnimatePresence>
                {showAvatarPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute top-full mt-2 left-0 bg-surface border border-outline-variant/20 rounded-xl p-3 shadow-xl z-20 w-56"
                  >
                    <p className="text-xs font-label-md text-on-surface-variant mb-2 uppercase tracking-wider">
                      Choose Avatar
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {AVATAR_OPTIONS.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setAvatar(opt);
                            setShowAvatarPicker(false);
                          }}
                          className={`rounded-lg overflow-hidden aspect-square border-2 transition-all ${
                            avatar === opt
                              ? 'border-primary ring-1 ring-primary/20'
                              : 'border-transparent hover:border-outline-variant/40'
                          }`}
                        >
                          <img src={opt} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="text-center sm:text-left flex-1">
              <h1 className="text-xl font-bold text-on-background">{user?.name}</h1>
              <p className="text-sm text-on-surface-variant">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5 justify-center sm:justify-start">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                    user?.role === 'ADMIN'
                      ? 'bg-error/10 text-error'
                      : user?.role === 'AGENT'
                        ? 'bg-tertiary/10 text-tertiary'
                        : 'bg-primary/10 text-primary'
                  }`}
                >
                  {user?.role}
                </span>
                <span className="text-xs text-outline">•</span>
                <span className="text-xs text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                    calendar_today
                  </span>
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab navigation + Content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar tabs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="md:w-56 shrink-0"
          >
            <div className="bg-surface border border-outline-variant/20 rounded-xl p-2 flex md:flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-lg text-sm font-label-md transition-all text-left ${
                    activeTab === tab.key
                      ? 'bg-primary/10 text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-background'
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 18,
                      fontVariationSettings: activeTab === tab.key ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="flex-1"
          >
            <AnimatePresence mode="wait">
              {activeTab === 'personal' && (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-surface border border-outline-variant/20 rounded-xl p-6 space-y-5"
                >
                  <div>
                    <h3 className="text-base font-bold text-on-background mb-1">Personal Information</h3>
                    <p className="text-xs text-on-surface-variant">Update your personal details and profile.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-label-md text-on-surface-variant">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-background border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-label-md text-on-surface-variant">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-3 py-2.5 text-sm text-outline cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-label-md text-on-surface-variant">Phone Number</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline" style={{ fontSize: 16 }}>
                          phone
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full bg-background border border-outline-variant/30 rounded-xl pl-9 pr-3 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-label-md text-on-surface-variant">Location</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline" style={{ fontSize: 16 }}>
                          location_on
                        </span>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. New York, NY"
                          className="w-full bg-background border border-outline-variant/30 rounded-xl pl-9 pr-3 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-label-md text-on-surface-variant">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      className="w-full bg-background border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-label-md hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="material-symbols-outlined"
                            style={{ fontSize: 16 }}
                          >
                            progress_activity
                          </motion.span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                            save
                          </span>
                          Save Changes
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-surface border border-outline-variant/20 rounded-xl p-6 space-y-5"
                >
                  <div>
                    <h3 className="text-base font-bold text-on-background mb-1">Password & Security</h3>
                    <p className="text-xs text-on-surface-variant">Update your password to keep your account secure.</p>
                  </div>

                  {securityError && (
                    <div className="bg-error-container text-on-error-container border border-error/20 p-3 rounded-lg text-xs font-bold">
                      {securityError}
                    </div>
                  )}
                  {securitySuccess && (
                    <div className="bg-primary/10 text-primary border border-primary/20 p-3 rounded-lg text-xs font-bold">
                      {securitySuccess}
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-label-md text-on-surface-variant">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-background border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-label-md text-on-surface-variant">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-background border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-label-md text-on-surface-variant">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-background border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-label-md hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        lock
                      </span>
                      Update Password
                    </motion.button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-surface border border-outline-variant/20 rounded-xl p-6 space-y-5"
                >
                  <div>
                    <h3 className="text-base font-bold text-on-background mb-1">Preferences</h3>
                    <p className="text-xs text-on-surface-variant">Customize your browsing and notification experience.</p>
                  </div>

                  {/* Notification Preferences */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-label-md text-on-surface-variant uppercase tracking-wider">
                      Notifications
                    </h4>
                    {[
                      { label: 'Email notifications for new properties', icon: 'mail', defaultOn: true },
                      { label: 'SMS alerts for bookings', icon: 'sms', defaultOn: false },
                      { label: 'Price drop notifications', icon: 'trending_down', defaultOn: true },
                      { label: 'Marketing & promotional emails', icon: 'campaign', defaultOn: false },
                    ].map((pref, i) => (
                      <label
                        key={i}
                        className="flex items-center justify-between p-3 bg-background rounded-xl border border-outline-variant/15 cursor-pointer hover:border-outline-variant/30 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-outline group-hover:text-on-surface-variant transition-colors" style={{ fontSize: 18 }}>
                            {pref.icon}
                          </span>
                          <span className="text-sm text-on-background">{pref.label}</span>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked={pref.defaultOn}
                          className="w-4 h-4 rounded accent-primary"
                        />
                      </label>
                    ))}
                  </div>

                  {/* Property Preferences */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-label-md text-on-surface-variant uppercase tracking-wider">
                      Property Preferences
                    </h4>
                    <div className="p-4 bg-background rounded-xl border border-outline-variant/15">
                      <div className="flex flex-wrap gap-2">
                        {['Apartment', 'Villa', 'Penthouse', 'Townhouse', 'Studio', 'Farmhouse'].map((type) => (
                          <span
                            key={type}
                            className="px-3 py-1.5 rounded-lg text-xs font-label-md bg-surface-container-low text-on-surface-variant border border-outline-variant/20 cursor-pointer hover:border-primary/40 hover:text-primary transition-all"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="pt-4 border-t border-outline-variant/15">
                    <h4 className="text-xs font-label-md text-error uppercase tracking-wider mb-3">Danger Zone</h4>
                    <button className="px-4 py-2 border border-error/30 text-error rounded-xl text-xs font-label-md hover:bg-error/5 transition-all">
                      Delete Account
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
