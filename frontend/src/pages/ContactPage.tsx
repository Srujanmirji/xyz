import React, { useState } from 'react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setSent(true);
      setName('');
      setEmail('');
      setMessage('');
    }
  };

  return (
    <main className="pt-24 pb-stack-lg px-gutter max-w-container-max mx-auto">
      <div className="max-w-3xl mx-auto space-y-stack-lg mt-8">
        <div className="text-center space-y-2">
          <h1 className="font-headline-lg text-headline-lg text-on-background">Contact Our Advisor Network</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Have questions about a listing or want to list your own property? Send us a message.
          </p>
        </div>

        {sent ? (
          <div className="bg-primary/10 border border-primary/20 p-8 rounded-xl text-center space-y-2">
            <span className="material-symbols-outlined text-[48px] text-primary">check_circle</span>
            <h3 className="font-bold text-on-background text-lg">Inquiry Sent Successfully</h3>
            <p className="text-sm text-on-surface-variant">
              Thank you for contacting XYZ Homes. A senior property representative will follow up via email within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-surface border border-outline-variant/30 rounded-xl p-stack-lg shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-label-md text-on-surface-variant">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-label-md text-on-surface-variant">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-label-md text-on-surface-variant">Message or Inquiry details</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can our agent network assist you?"
                rows={5}
                className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm"
            >
              Submit Message
            </button>
          </form>
        )}
      </div>
    </main>
  );
};
