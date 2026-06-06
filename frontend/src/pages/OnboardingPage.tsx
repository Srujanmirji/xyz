import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Penthouse', 'Townhouse', 'Studio', 'Farmhouse'];
const PREFERRED_LOCATIONS = ['New York', 'Los Angeles', 'Miami', 'San Francisco', 'Chicago', 'Austin', 'Seattle', 'Denver'];

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.3 },
  }),
};

export const OnboardingPage: React.FC = () => {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [propertyPrefs, setPropertyPrefs] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState(500000);
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);

  const totalSteps = 3;

  const goNext = () => {
    if (step < totalSteps - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await completeOnboarding({
        phone,
        bio,
        location,
      });
      // Small delay for animation
      setTimeout(() => {
        const role = user?.role;
        if (role === 'ADMIN') navigate('/admin-dashboard');
        else navigate('/dashboard');
      }, 1500);
    } catch {
      setLoading(false);
    }
  };

  const toggleArrayItem = (arr: string[], item: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  };

  const formatBudget = (val: number) => {
    if (val >= 1000000) return `₹${(val / 1000000).toFixed(1)}M`;
    return `₹${(val / 1000).toFixed(0)}K`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-tertiary/5 blur-[100px]" />
      </div>

      <div className="w-full max-w-xl relative z-10">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-label-md text-on-surface-variant uppercase tracking-wider">
              Step {step + 1} of {totalSteps}
            </span>
            <span className="text-xs font-label-md text-primary font-bold">
              {Math.round(((step + 1) / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="bg-surface border border-outline-variant/20 rounded-2xl p-8 shadow-lg backdrop-blur-sm min-h-[460px] flex flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 0 && (
              <motion.div
                key="step-0"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex-1 flex flex-col"
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: 32 }}>
                      person
                    </span>
                  </motion.div>
                  <h2 className="font-headline-lg text-headline-lg text-on-background mb-2">
                    Welcome, {user?.name?.split(' ')[0] || 'there'}!
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Tell us a bit about yourself so we can personalize your experience.
                  </p>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-label-md text-on-surface-variant">Phone Number</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline" style={{ fontSize: 18 }}>
                        phone
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-background border border-outline-variant/30 rounded-xl pl-10 pr-3 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-label-md text-on-surface-variant">Your City / Location</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline" style={{ fontSize: 18 }}>
                        location_on
                      </span>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. New York, NY"
                        className="w-full bg-background border border-outline-variant/30 rounded-xl pl-10 pr-3 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-label-md text-on-surface-variant">Short Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us what you're looking for in your dream home..."
                      rows={3}
                      className="w-full bg-background border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex-1 flex flex-col"
              >
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-16 h-16 mx-auto mb-4 bg-tertiary/10 rounded-2xl flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 32 }}>
                      tune
                    </span>
                  </motion.div>
                  <h2 className="font-headline-lg text-headline-lg text-on-background mb-2">Your Preferences</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Help us find the perfect properties for you.
                  </p>
                </div>

                <div className="flex-1 space-y-5">
                  <div>
                    <label className="block text-xs font-label-md text-on-surface-variant mb-2 uppercase tracking-wider">
                      Property Types
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PROPERTY_TYPES.map((type) => (
                        <motion.button
                          key={type}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => toggleArrayItem(propertyPrefs, type, setPropertyPrefs)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-label-md border transition-all ${
                            propertyPrefs.includes(type)
                              ? 'bg-primary text-on-primary border-primary shadow-sm'
                              : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:border-outline-variant/40'
                          }`}
                        >
                          {type}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-label-md text-on-surface-variant uppercase tracking-wider">
                        Budget Range
                      </label>
                      <span className="text-sm font-bold text-primary">{formatBudget(budgetRange)}</span>
                    </div>
                    <input
                      type="range"
                      min={100000}
                      max={5000000}
                      step={50000}
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(Number(e.target.value))}
                      className="w-full h-1.5 bg-surface-container rounded-full appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-outline">₹100K</span>
                      <span className="text-[10px] text-outline">₹5M+</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-label-md text-on-surface-variant mb-2 uppercase tracking-wider">
                      Preferred Locations
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PREFERRED_LOCATIONS.map((loc) => (
                        <motion.button
                          key={loc}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => toggleArrayItem(preferredLocations, loc, setPreferredLocations)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-label-md border transition-all ${
                            preferredLocations.includes(loc)
                              ? 'bg-secondary text-on-secondary border-secondary shadow-sm'
                              : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:border-outline-variant/40'
                          }`}
                        >
                          <span className="material-symbols-outlined mr-1" style={{ fontSize: 12 }}>
                            location_on
                          </span>
                          {loc}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                {/* Animated success */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center border border-primary/20"
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="material-symbols-outlined text-primary"
                    style={{ fontSize: 48, fontVariationSettings: "'FILL' 1" }}
                  >
                    celebration
                  </motion.span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="font-headline-lg text-headline-lg text-on-background mb-2"
                >
                  You're All Set!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="font-body-md text-body-md text-on-surface-variant mb-8 max-w-sm"
                >
                  Your profile is ready. Explore premium properties curated just for you.
                </motion.p>

                {/* Profile summary card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="w-full max-w-xs bg-surface-container-low/50 border border-outline-variant/20 rounded-xl p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: 24 }}>person</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-on-background">{user?.name}</p>
                      <p className="text-xs text-on-surface-variant">{user?.email}</p>
                    </div>
                  </div>
                  {(phone || location) && (
                    <div className="border-t border-outline-variant/15 pt-3 space-y-1">
                      {phone && (
                        <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>phone</span>
                          {phone}
                        </p>
                      )}
                      {location && (
                        <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
                          {location}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Floating confetti particles */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: ['hsl(var(--primary))', 'hsl(var(--tertiary))', 'hsl(var(--secondary))'][i % 3],
                      left: `${15 + Math.random() * 70}%`,
                      top: `${10 + Math.random() * 60}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      y: [0, -60 - Math.random() * 80],
                      x: [-20 + Math.random() * 40],
                    }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 1.5, ease: 'easeOut' }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className={`flex items-center mt-8 pt-6 border-t border-outline-variant/15 ${step === 2 ? 'justify-center' : 'justify-between'}`}>
            {step > 0 && step < 2 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={goBack}
                className="px-5 py-2 text-sm font-label-md text-on-surface-variant hover:text-on-background transition-colors rounded-lg hover:bg-surface-container-low"
              >
                Back
              </motion.button>
            ) : step < 2 ? (
              <div />
            ) : null}

            {step === 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={goNext}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-label-md hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-1.5"
              >
                Continue
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
              </motion.button>
            )}

            {step === 1 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={goNext}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-label-md hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-1.5"
              >
                Continue
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
              </motion.button>
            )}

            {step === 2 && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleComplete}
                disabled={loading}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="px-8 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl text-sm font-label-md hover:shadow-xl hover:shadow-primary/25 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="material-symbols-outlined"
                      style={{ fontSize: 16 }}
                    >
                      progress_activity
                    </motion.span>
                    Setting up...
                  </>
                ) : (
                  <>
                    Go to Dashboard
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
