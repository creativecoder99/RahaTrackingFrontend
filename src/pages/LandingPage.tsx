'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, MapPin, ClipboardList, Navigation, ArrowRight, Zap, Check, AlertCircle, RefreshCw } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const router = useRouter();

  // States for the interactive access request form widget
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<'default' | 'hover' | 'active' | 'loading' | 'success' | 'error'>('default');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLaunch = () => {
    router.push('/dashboard');
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setFormState('error');
      setErrorMessage('Email address is required.');
      return;
    }
    
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormState('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setFormState('loading');
    
    // Simulate API request to show all states
    setTimeout(() => {
      // Simulate success/error toggle based on input text for demonstration
      if (email.toLowerCase().includes('fail')) {
        setFormState('error');
        setErrorMessage('This email is blacklisted from sandbox access.');
      } else {
        setFormState('success');
        setEmail('');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-surface-base text-text-secondary selection:bg-surface-strong selection:text-surface-base overflow-hidden font-sans">
      
      {/* Subtle brand glow matches #2ec697 */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-surface-strong/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-surface-strong/5 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-space-6 py-space-6 flex items-center justify-between border-b border-border-default/10 sticky top-0 bg-surface-base/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-space-2 cursor-pointer" onClick={() => router.push('/')}>
          <img src="/logo.svg" alt="Raha Logo" className="h-8 w-auto" />
        </div>

        {/* Navigation links matching reference style */}
        <div className="hidden md:flex items-center gap-space-6 text-sm font-semibold text-text-inverse">
          <a href="#features" className="hover:text-text-secondary transition-colors duration-fast">Features</a>
          <a href="#request-access" className="hover:text-text-secondary transition-colors duration-fast">Request Access</a>
          <a href="#audit-cycle" className="hover:text-text-secondary transition-colors duration-fast">Audit Cycle</a>
        </div>

        <button
          onClick={handleLaunch}
          className="px-space-5 py-space-2 bg-surface-strong hover:bg-[#25ab81] text-text-primary active:scale-95 duration-fast focus-visible:ring-2 focus-visible:ring-focus-ring outline-hidden text-sm font-bold rounded-xs transition-all cursor-pointer"
        >
          Login
        </button>
      </header>

      {/* Full-bleed Hero Section with absolute background mapping image */}
      <section className="relative w-full min-h-[550px] md:min-h-[650px] flex items-center justify-start border-b border-border-default/10 overflow-hidden">
        {/* Background Image with Tech Mesh and Radial Glow Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          {/* High-tech vector grid mesh overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(46,198,151,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(46,198,151,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-75" />
          
          {/* Glowing mint accent radial light source on the right side */}
          <div className="absolute top-[10%] right-[5%] w-[450px] h-[450px] bg-surface-strong/15 rounded-full blur-3xl opacity-60 mix-blend-screen animate-pulse" />
          
          <img 
            src="/hero_audit_dashboard.png" 
            alt="Dashboard Background" 
            className="w-full h-full object-cover opacity-20 md:opacity-35 object-right md:object-center transition-all duration-1000 scale-100 hover:scale-[1.02]" 
          />
          
          {/* High contrast linear gradient fades from pure black on the left to transparent on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-surface-base via-surface-base/85 to-surface-base/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-transparent to-transparent opacity-90" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-space-6 py-space-8 w-full text-left">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-space-2 bg-surface-strong/10 text-surface-strong px-space-4 py-space-2 rounded-xs text-xs font-semibold border border-surface-strong/20 mb-space-5 tracking-wide uppercase">
              <Zap className="h-3 w-3" />
              <span>Streamlining Field Operations</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-bold tracking-tight leading-tight text-text-secondary">
              Smart Location Tracking for{' '}
              <span className="bg-gradient-to-r from-surface-strong via-[#57dfb2] to-text-secondary bg-clip-text text-transparent">
                Insurance Field Audits
              </span>
            </h1>

            {/* Paragraph */}
            <p className="text-text-inverse text-lg mt-space-4 leading-relaxed font-normal">
              Empower claims inspectors and sales associates with automated route audits, real-road distance calculation, and monthly fuel reimbursement sheets.
            </p>

            {/* Buttons */}
            <div className="mt-space-6 flex flex-col sm:flex-row gap-space-4">
              <button
                onClick={handleLaunch}
                className="w-full sm:w-auto px-space-6 py-space-3 bg-surface-strong text-text-primary hover:bg-[#25ab81] active:bg-[#1f916d] active:scale-95 duration-fast focus-visible:ring-2 focus-visible:ring-focus-ring outline-hidden font-bold rounded-xs shadow-md transition-all cursor-pointer text-sm flex items-center justify-center gap-space-2"
              >
                <span>Enter Field Portal</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              
              <a
                href="#features"
                className="w-full sm:w-auto px-space-6 py-space-3 bg-transparent hover:bg-text-secondary/5 border border-border-default/20 active:scale-95 duration-fast focus-visible:ring-2 focus-visible:ring-focus-ring outline-hidden font-bold rounded-xs transition-all cursor-pointer flex items-center justify-center text-text-secondary text-sm"
              >
                Explore Features
              </a>
            </div>

            {/* Stats list overlay directly under hero text (matching original layout style) */}
            <div className="mt-space-8 grid grid-cols-2 sm:grid-cols-4 gap-space-4 border-t border-border-default/10 pt-space-6">
              <div>
                <p className="text-2xl font-bold text-surface-strong">100%</p>
                <p className="text-[10px] font-semibold text-text-inverse uppercase tracking-wider">Audit Accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-strong">OSRM</p>
                <p className="text-[10px] font-semibold text-text-inverse uppercase tracking-wider">Routing Provider</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-strong">₹12 / km</p>
                <p className="text-[10px] font-semibold text-text-inverse uppercase tracking-wider">Fuel Rate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-strong">Secure</p>
                <p className="text-[10px] font-semibold text-text-inverse uppercase tracking-wider">Role Access</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="max-w-7xl mx-auto px-space-6 py-space-8 border-t border-border-default/10 scroll-mt-24 mt-space-8">
        <div className="text-center max-w-3xl mx-auto mb-space-8">
          <h2 className="text-3xl font-bold tracking-tight text-text-secondary">
            Precision tools built for Insurance Operations
          </h2>
          <p className="text-text-inverse text-sm mt-space-4 leading-relaxed">
            Ensure audit integrity and accurate reimbursement ledgers using automated GPS capture and exact-road directions calculations.
          </p>
        </div>

        {/* Structured high-contrast tokenized cards: bg-surface-raised (white) on bg-surface-base (black) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-6">
          
          {/* Card 1 */}
          <div className="bg-surface-raised border border-border-default rounded-sm p-space-6 transition-all duration-fast hover:scale-[1.02] hover:shadow-lg focus-within:ring-2 focus-within:ring-focus-ring outline-hidden flex flex-col">
            <div className="p-space-3 bg-surface-strong/10 text-[#1b8060] rounded-xs w-fit mb-space-5 border border-surface-strong/10">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="text-text-primary text-xl font-bold mb-space-3">
              GPS Location Audits
            </h3>
            <p className="text-text-tertiary text-sm leading-relaxed">
              Capture exact geo-coordinates and accuracy radiuses automatically when associates check-in. Seamlessly falls back to local client locations if browser permissions are denied.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-surface-raised border border-border-default rounded-sm p-space-6 transition-all duration-fast hover:scale-[1.02] hover:shadow-lg focus-within:ring-2 focus-within:ring-focus-ring outline-hidden flex flex-col">
            <div className="p-space-3 bg-surface-strong/10 text-[#1b8060] rounded-xs w-fit mb-space-5 border border-surface-strong/10">
              <Navigation className="h-6 w-6" />
            </div>
            <h3 className="text-text-primary text-xl font-bold mb-space-3">
              Real-Road Routing
            </h3>
            <p className="text-text-tertiary text-sm leading-relaxed">
              Ditch straight-line assumptions. Connects to OSRM mapping servers to calculate exact driving routes, drawing the road route dynamically on active associate timeline maps.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-surface-raised border border-border-default rounded-sm p-space-6 transition-all duration-fast hover:scale-[1.02] hover:shadow-lg focus-within:ring-2 focus-within:ring-focus-ring outline-hidden flex flex-col">
            <div className="p-space-3 bg-surface-strong/10 text-[#1b8060] rounded-xs w-fit mb-space-5 border border-surface-strong/10">
              <ClipboardList className="h-6 w-6" />
            </div>
            <h3 className="text-text-primary text-xl font-bold mb-space-3">
              HR Fuel Reimbursements
            </h3>
            <p className="text-text-tertiary text-sm leading-relaxed">
              Branch Heads can search associates, review audit timelines, and download monthly CSV sheets compiling cumulative distances and cost details (₹12 per km).
            </p>
          </div>

        </div>
      </section>

      {/* Interactive Form Component: Request Access Side-by-Side */}
      <section id="request-access" className="max-w-6xl mx-auto px-space-6 py-space-8 mt-space-8 border-y border-border-default/10 scroll-mt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-8 items-center">
          {/* Left Column: Sandbox Details & Content */}
          <div className="text-left space-y-space-4">
            <h3 className="text-3xl font-bold text-text-secondary">Request Sandbox Access</h3>
            <p className="text-text-inverse text-sm leading-relaxed">
              Experience the claims auditing system first-hand. Our secure sandbox environment lets you toggle between role views:
            </p>
            <ul className="space-y-space-3 text-text-inverse text-xs pl-space-4 list-disc marker:text-surface-strong">
              <li><strong>Sales Associate View:</strong> Start daily audits, input check-in notes, map route trails, and request fuel log claims.</li>
              <li><strong>Branch Head View:</strong> Review active field inspector timelines, verify road distances via OSRM, and download compiled HR reimbursement CSV ledgers.</li>
              <li><strong>Role-Based Security:</strong> Verify token authentication, private routes, and real-time MongoDB transaction logs.</li>
            </ul>
            <div className="p-space-3 bg-surface-strong/5 rounded-xs border border-surface-strong/10 text-text-inverse text-xs">
              💡 Submitting an email address containing the word <code className="text-surface-strong font-semibold">fail</code> will simulate validation rules and trigger an error state.
            </div>
          </div>

          {/* Right Column: Interactive State Form Card */}
          <div className="bg-surface-raised border border-border-default rounded-sm p-space-6 shadow-md text-left">
            <h4 className="text-text-primary text-lg font-bold mb-space-3">Access Portal Gateway</h4>
            <form onSubmit={handleRequestSubmit} className="space-y-space-4">
              <div className="relative">
                <label htmlFor="sandbox-email" className="block text-xs font-semibold text-text-tertiary mb-space-2">
                  Corporate Email Address
                </label>
                <input
                  id="sandbox-email"
                  type="text"
                  placeholder="operator@company.com"
                  value={email}
                  disabled={formState === 'loading' || formState === 'success'}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formState === 'error') setFormState('default');
                  }}
                  onFocus={() => {
                    if (formState !== 'loading' && formState !== 'success') {
                      setFormState('active');
                    }
                  }}
                  onBlur={() => {
                    if (formState !== 'loading' && formState !== 'success') {
                      setFormState('default');
                    }
                  }}
                  className={`w-full px-space-4 py-space-3 bg-transparent border text-text-primary text-sm font-sans rounded-xs focus-visible:ring-2 focus-visible:ring-focus-ring outline-hidden transition-all duration-instant
                    ${formState === 'error' ? 'border-red-500 bg-red-50 text-red-800' : 'border-border-default/80 hover:border-text-inverse'}
                    ${(formState === 'loading' || formState === 'success') ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-space-3 items-stretch sm:items-center justify-between pt-space-2">
                <div>
                  {/* Form Message States */}
                  {formState === 'error' && (
                    <div className="flex items-center gap-space-2 text-red-600 text-xs font-semibold">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                  {formState === 'success' && (
                    <div className="flex items-center gap-space-2 text-[#1b8060] text-xs font-semibold">
                      <Check className="h-4 w-4 shrink-0" />
                      <span>Access invite sent to your inbox!</span>
                    </div>
                  )}
                  {formState === 'loading' && (
                    <div className="flex items-center gap-space-2 text-text-tertiary text-xs font-semibold">
                      <RefreshCw className="h-3 w-3 animate-spin shrink-0" />
                      <span>Verifying credentials...</span>
                    </div>
                  )}
                  {formState === 'default' && (
                    <span className="text-text-tertiary text-xs font-normal">Requires active internet connection.</span>
                  )}
                  {formState === 'active' && (
                    <span className="text-[#1b8060] text-xs font-medium">Entering secure sandbox credentials...</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={formState === 'loading' || formState === 'success'}
                  className={`px-space-5 py-space-3 font-bold text-xs uppercase tracking-wider rounded-xs duration-instant transition-all outline-hidden
                    ${formState === 'success' 
                      ? 'bg-transparent text-[#1b8060] border border-[#1b8060]/30 cursor-default' 
                      : 'bg-surface-strong text-text-primary hover:bg-[#25ab81] active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-focus-ring'}
                    ${formState === 'loading' ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {formState === 'loading' ? 'Loading' : formState === 'success' ? 'Sent' : 'Submit Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>



      {/* Audit Flow Section with detailed cards */}
      <section id="audit-cycle" className="max-w-6xl mx-auto px-space-6 py-space-8 mt-space-8 mb-space-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-space-8">
          <h2 className="text-3xl font-bold tracking-tight text-text-secondary">Simple Field Audit Cycle</h2>
          <p className="text-text-inverse text-sm mt-space-2 font-normal">From start-of-day checks to monthly expense payouts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-4 relative">
          {/* Card 1 */}
          <div className="bg-surface-raised border border-border-default rounded-sm p-space-5 relative flex flex-col justify-between">
            <div>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-strong font-bold text-xs text-text-primary mb-space-4">1</span>
              <h4 className="font-bold text-text-primary text-base">Start Day</h4>
              <p className="text-xs text-text-tertiary mt-space-2 leading-relaxed">
                Associate initiates operations in the field portal. Verifies GPS coordinates and checks offline caching capabilities before client visit.
              </p>
            </div>
            <div className="text-[10px] text-text-tertiary font-bold tracking-wider uppercase mt-space-4 border-t border-border-default/20 pt-space-2">
              📍 Geolocation Check-In
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-surface-raised border border-border-default rounded-sm p-space-5 relative flex flex-col justify-between">
            <div>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-strong font-bold text-xs text-text-primary mb-space-4">2</span>
              <h4 className="font-bold text-text-primary text-base">Log Visit Notes</h4>
              <p className="text-xs text-text-tertiary mt-space-2 leading-relaxed">
                Claims inspectors input detailed audit notes on-site. The system captures geo-tags and precision radius metrics automatically.
              </p>
            </div>
            <div className="text-[10px] text-text-tertiary font-bold tracking-wider uppercase mt-space-4 border-t border-border-default/20 pt-space-2">
              📝 On-Site Auditing
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-surface-raised border border-border-default rounded-sm p-space-5 relative flex flex-col justify-between">
            <div>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-strong font-bold text-xs text-text-primary mb-space-4">3</span>
              <h4 className="font-bold text-text-primary text-base">Close Day</h4>
              <p className="text-xs text-text-tertiary mt-space-2 leading-relaxed">
                Associate ends the day. Portal sends check-in locations to the backend distance engine for route calculations.
              </p>
            </div>
            <div className="text-[10px] text-text-tertiary font-bold tracking-wider uppercase mt-space-4 border-t border-border-default/20 pt-space-2">
              🛣️ OSRM Road Solvers
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-surface-raised border border-border-default rounded-sm p-space-5 relative flex flex-col justify-between">
            <div>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-strong font-bold text-xs text-text-primary mb-space-4">4</span>
              <h4 className="font-bold text-text-primary text-base">Export Log</h4>
              <p className="text-xs text-text-tertiary mt-space-2 leading-relaxed">
                Managers review the routing lines on the timeline maps and export cumulative logs (₹12/km) to payroll CSVs for reimbursement.
              </p>
            </div>
            <div className="text-[10px] text-text-tertiary font-bold tracking-wider uppercase mt-space-4 border-t border-border-default/20 pt-space-2">
              📊 HR CSV Payroll Export
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-default/10 py-space-6 bg-surface-base">
        <div className="max-w-7xl mx-auto px-space-6 flex flex-col sm:flex-row justify-between items-center text-text-inverse text-xs gap-space-4">
          <div className="flex items-center gap-space-2">
            <img src="/logo.svg" alt="Raha Logo" className="h-5 w-auto" />
            <span className="font-semibold text-text-secondary">Insure Services</span>
          </div>
          <p>© {new Date().getFullYear()} Raha Fintech Pvt. Ltd. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;

