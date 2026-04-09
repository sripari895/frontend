import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// ── Lazy-loaded pages (code splitting) ──────────────────────────────────────
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CreateShipment = lazy(() => import('./pages/CreateShipment'));
const TrackShipment = lazy(() => import('./pages/TrackShipment'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const SupportForm = lazy(() => import('./pages/SupportForm'));
const AdminSupport = lazy(() => import('./pages/AdminSupport'));

// ── Suspense fallback ───────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-3" />
      <p className="text-slate-400 text-sm">Loading…</p>
    </div>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreateShipment />
                  </ProtectedRoute>
                }
              />
              <Route path="/track" element={<TrackShipment />} />
              <Route path="/track/:trackingId" element={<TrackShipment />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['user', 'admin']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/help" element={<HelpCenter />} />
              <Route
                path="/support"
                element={
                  <ProtectedRoute>
                    <SupportForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/support"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminSupport />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </main>
        <footer className="border-t border-slate-200 bg-white pt-16 pb-8 mt-auto">
          <div className="container-app">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              {/* Column 1: Brand & About */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-violet-500 flex items-center justify-center shadow-md">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-violet-500 bg-clip-text text-transparent">SwiftShip</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                  A modern, AI-driven logistics platform ensuring fast, secure, and transparent delivery management worldwide.
                </p>
              </div>

              {/* Column 2: Quick Links */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Quick Links</h4>
                <ul className="space-y-3 text-sm text-slate-500">
                  <li><a href="/track" className="hover:text-primary-600 transition-colors">Track Package</a></li>
                  <li><a href="/create" className="hover:text-primary-600 transition-colors">Ship a Parcel</a></li>
                  <li><a href="/" className="hover:text-primary-600 transition-colors">Pricing & Rate Card</a></li>
                </ul>
              </div>

              {/* Column 3: Support */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
                <ul className="space-y-3 text-sm text-slate-500">
                  <li><a href="/help" className="hover:text-primary-600 transition-colors">Help Center / FAQs</a></li>
                  <li><a href="/support" className="hover:text-primary-600 transition-colors">Contact Us</a></li>
                  <li><button onClick={() => window.location.href='/support'} className="hover:text-primary-600 transition-colors text-left">Submit a Ticket</button></li>
                </ul>
              </div>

              {/* Column 4: Newsletter */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Newsletter</h4>
                <p className="text-sm text-slate-500 mb-3">Get the latest logistics news and updates.</p>
                <form className="flex rounded-lg overflow-hidden border border-slate-200">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 px-3 py-2 text-sm outline-none text-slate-700"
                    required
                  />
                  <button type="button" className="bg-slate-900 text-white px-4 text-sm font-medium hover:bg-primary-600 transition-colors">
                    Subscribe
                  </button>
                </form>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500">
                &copy; 2026 SwiftShip Logistics. All rights reserved.
              </p>
              <div className="flex gap-4 text-sm text-slate-500">
                <a href="/" className="hover:text-primary-600 transition">Privacy Policy</a>
                <a href="/" className="hover:text-primary-600 transition">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#1e293b', color: '#f8fafc', fontSize: '14px', borderRadius: '12px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  );
}
