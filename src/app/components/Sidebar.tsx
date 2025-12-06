"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useCart } from "../contexts/CartContext";
import { useVoiceMode } from "../contexts/VoiceModeContext";

const supabaseUrl = "https://njejfdmqtnplfnomjyvd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZWpmZG1xdG5wbGZub21qeXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODczNDIsImV4cCI6MjA3MTI2MzM0Mn0.N2jjDp86bTCnzr8zP-pQlipYzCNpCPrIDndMLGLlBmw";
const supabase = createClient(supabaseUrl, supabaseKey);

// Product categories for sidebar navigation
const categories = [
  { id: 'all', name: 'All Products', icon: '🛍️', color: 'from-blue-600 to-purple-600' },
  { id: 'audio', name: 'Audio & Music', icon: '🎵', color: 'from-pink-500 to-rose-500' },
  { id: 'computing', name: 'Computing', icon: '💻', color: 'from-blue-500 to-cyan-500' },
  { id: 'gaming', name: 'Gaming', icon: '🎮', color: 'from-purple-500 to-indigo-500' },
  { id: 'mobile', name: 'Mobile & Accessories', icon: '📱', color: 'from-green-500 to-emerald-500' },
  { id: 'smart-home', name: 'Smart Home', icon: '🏠', color: 'from-orange-500 to-amber-500' },
  { id: 'office', name: 'Office & Work', icon: '🏢', color: 'from-gray-500 to-slate-500' },
  { id: 'photography', name: 'Photography', icon: '📸', color: 'from-red-500 to-pink-500' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { cartItemCount } = useCart();
  const { isVoiceModeEnabled, toggleVoiceMode } = useVoiceMode();

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Ecommerce Store</h2>
                <p className="text-sm text-gray-600">Premium Shopping</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Main Navigation */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Navigation</h3>
                
                <div className="space-y-2">
                  <Link 
                    href="/" 
                    className="flex items-center p-3 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-200 group"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <span className="font-medium">Home</span>
                  </Link>
                  
                  <Link 
                    href="/cart" 
                    className="flex items-center p-3 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-200 group"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors relative">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                      {cartItemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {cartItemCount}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">Cart</span>
                  </Link>
                  
                  {user && (
                    <Link 
                      href="/orders" 
                      className="flex items-center p-3 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-200 group"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-indigo-200 transition-colors">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <span className="font-medium">My Orders</span>
                    </Link>
                  )}
                  
                  <Link 
                    href="/about" 
                    className="flex items-center p-3 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-200 group"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-medium">About</span>
                  </Link>
                </div>
              </div>

              {/* Accessibility */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Accessibility</h3>
                
                <button
                  onClick={toggleVoiceMode}
                  aria-label={isVoiceModeEnabled ? 'Disable voice mode' : 'Enable voice mode'}
                  className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${
                    isVoiceModeEnabled 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-colors ${
                    isVoiceModeEnabled 
                      ? 'bg-white bg-opacity-20' 
                      : 'bg-orange-100 group-hover:bg-orange-200'
                  }`}>
                    <svg className={`w-5 h-5 ${isVoiceModeEnabled ? 'text-white' : 'text-orange-600'}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-medium block">Voice Mode</span>
                    <span className={`text-xs ${isVoiceModeEnabled ? 'text-white text-opacity-90' : 'text-gray-500'}`}>
                      {isVoiceModeEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </button>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Categories</h3>
                
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Link 
                      key={category.id}
                      href={`/?category=${category.id}`}
                      className="flex items-center p-3 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-200 group"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-colors bg-gradient-to-r ${category.color}`}>
                        <span className="text-lg">{category.icon}</span>
                      </div>
                      <span className="font-medium text-sm">{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* User section */}
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                    <p className="text-xs text-gray-500">Signed in</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-3 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-200 font-medium"
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full px-4 py-3 text-sm text-center text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block w-full px-4 py-3 text-sm text-center text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  onClick={() => setIsOpen(false)}
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
