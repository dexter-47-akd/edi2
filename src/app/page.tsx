"use client";

import Image from "next/image";
import { createClient } from '@supabase/supabase-js';
import { useEffect, useMemo, useState, useRef } from 'react';
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import StarRating from "./components/StarRating";
import ReviewsModal from "./components/ReviewsModal";
import ProductCard from "./components/ProductCard";
import TextPressure from "./ReactBits/TextPressure/TextPressure";
import RotatingText from "./ReactBits/RotatingText/RotatingText";
import SplashCursor from "./ReactBits/SplashCursor/SplashCursor";
import { useCart } from "./contexts/CartContext";

const supabaseUrl = 'https://njejfdmqtnplfnomjyvd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZWpmZG1xdG5wbGZub21qeXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODczNDIsImV4cCI6MjA3MTI2MzM0Mn0.N2jjDp86bTCnzr8zP-pQlipYzCNpCPrIDndMLGLlBmw';
const supabase = createClient(supabaseUrl, supabaseKey);

// Product categories with icons and colors
const categories = [
  { id: 'all', name: 'All Products', icon: '🛍️', color: 'from-blue-600 to-purple-600', count: 0 },
  { id: 'audio', name: 'Audio & Music', icon: '🎵', color: 'from-pink-500 to-rose-500', count: 0 },
  { id: 'computing', name: 'Computing', icon: '💻', color: 'from-blue-500 to-cyan-500', count: 0 },
  { id: 'gaming', name: 'Gaming', icon: '🎮', color: 'from-purple-500 to-indigo-500', count: 0 },
  { id: 'mobile', name: 'Mobile & Accessories', icon: '📱', color: 'from-green-500 to-emerald-500', count: 0 },
  { id: 'smart-home', name: 'Smart Home', icon: '🏠', color: 'from-orange-500 to-amber-500', count: 0 },
  { id: 'office', name: 'Office & Work', icon: '🏢', color: 'from-gray-500 to-slate-500', count: 0 },
  { id: 'photography', name: 'Photography', icon: '📸', color: 'from-red-500 to-pink-500', count: 0 },
];

// Product category mapping
const productCategories = {
  'Wireless Headphones': 'audio',
  'Noise Cancelling Earbuds': 'audio',
  'Bluetooth Speaker': 'audio',
  'Smart Watch': 'mobile',
  'Action Camera': 'photography',
  '4K Monitor': 'computing',
  'Mechanical Keyboard': 'computing',
  'Ergonomic Mouse': 'computing',
  'USB-C Hub': 'computing',
  'Portable SSD 1TB': 'computing',
  'Gaming Chair': 'gaming',
  'VR Headset': 'gaming',
  'Webcam 1080p': 'computing',
  'Desk Lamp': 'office',
  'Laptop Stand': 'office',
  'Portable Projector': 'computing',
  'Wi-Fi 6 Router': 'smart-home',
  'Power Bank 20,000mAh': 'mobile',
  'Smart Home Plug': 'smart-home',
  'Smart LED Strip': 'smart-home',
};

export default function Home() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, cartItemCount } = useCart();
  const [query, setQuery] = useState("");
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [ratingMap, setRatingMap] = useState<Record<string, { avg: number; count: number }>>({});
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);
  
  // Initialize category from URL parameter
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categories.some(cat => cat.id === categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*');
      if (!error) {
        setProducts(data || []);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // Fetch rating aggregates for visible products
  useEffect(() => {
    const loadAggregates = async () => {
      if (!products.length) return;
      const ids = products.map((p: any) => p.id).filter(Boolean);
      if (!ids.length) return;
      const { data, error } = await supabase
        .from('reviews')
        .select('product_id, rating')
        .in('product_id', ids);
      if (!error && Array.isArray(data)) {
        const sums: Record<string, { sum: number; count: number }> = {};
        for (const row of data as any[]) {
          const pid = String(row.product_id);
          if (!sums[pid]) sums[pid] = { sum: 0, count: 0 };
          sums[pid].sum += Number(row.rating) || 0;
          sums[pid].count += 1;
        }
        const next: Record<string, { avg: number; count: number }> = {};
        for (const pid of Object.keys(sums)) {
          const { sum, count } = sums[pid];
          next[pid] = { avg: count ? sum / count : 0, count };
        }
        setRatingMap(next);
      }
    };
    loadAggregates();
  }, [products]);

  // Realtime updates for any review insert
  useEffect(() => {
    const channel = supabase
      .channel('reviews-all')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews' }, (payload) => {
        const review = payload.new as any;
        const productId = String(review.product_id);
        setRatingMap((prev) => {
          const current = prev[productId] || { avg: 0, count: 0 };
          const newCount = current.count + 1;
          const newAvg = (current.avg * current.count + Number(review.rating || 0)) / newCount;
          return { ...prev, [productId]: { avg: newAvg, count: newCount } };
        });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Debug cart data
  useEffect(() => {
    console.log('Home page - Current cart state:', cart);
    console.log('Home page - Cart item count:', cartItemCount);
  }, [cart, cartItemCount]);

  // Filter products by search query and category
  const normalizedQuery = query.trim().toLowerCase();
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product: any) => 
        productCategories[product.name as keyof typeof productCategories] === selectedCategory
      );
    }
    
    // Filter by search query
    if (normalizedQuery) {
      filtered = filtered.filter((product: any) =>
        String(product.name || "").toLowerCase().includes(normalizedQuery) ||
        String(product.description || "").toLowerCase().includes(normalizedQuery)
      );
    }
    
    return filtered;
  }, [products, selectedCategory, normalizedQuery]);

  // Initialize speech recognition (if supported)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.log('Speech recognition not supported in this browser');
      recognitionRef.current = null;
      setSpeechSupported(false);
      return;
    }

    console.log('Speech recognition is supported!');
    setSpeechSupported(true);

    // Create recognition instance once
    if (!recognitionRef.current) {
      try {
        const r = new SpeechRecognition();
        r.lang = 'en-US';
        r.interimResults = false;
        r.maxAlternatives = 1;

        r.onresult = (event: any) => {
          try {
            const transcript = Array.from(event.results)
              .map((res: any) => res[0].transcript)
              .join('')
              .trim();
            if (transcript) {
              setQuery(transcript);
            }
          } catch (e) {
            console.error('Speech result processing error', e);
          }
        };

        r.onerror = (err: any) => {
          console.error('Speech recognition error', err);
          setListening(false);
        };

        r.onend = () => {
          setListening(false);
        };

        recognitionRef.current = r;
      } catch (e) {
        console.error('Failed to initialize SpeechRecognition', e);
        recognitionRef.current = null;
      }
    }

    return () => {
      // cleanup
      try {
        if (recognitionRef.current) {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          try { recognitionRef.current.stop(); } catch {};
          recognitionRef.current = null;
        }
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const toggleListening = () => {
    console.log('toggleListening called. speechSupported:', speechSupported, 'listening:', listening);
    
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    
    const r = recognitionRef.current;
    if (!r) {
      console.warn('Recognition instance not initialized');
      return;
    }

    if (listening) {
      try { 
        r.stop(); 
        console.log('Stopped listening');
      } catch (e) { console.error(e); }
      setListening(false);
    } else {
      try {
        r.start();
        console.log('Started listening');
        setListening(true);
      } catch (e) {
        console.error('Failed to start recognition', e);
        alert('Could not start voice recognition. Please ensure microphone permissions are granted.');
        setListening(false);
      }
    }
  };

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: products.length };
    categories.forEach(cat => {
      if (cat.id !== 'all') {
        counts[cat.id as keyof typeof counts] = products.filter((product: any) => 
          productCategories[product.name as keyof typeof productCategories] === cat.id
        ).length;
      }
    });
    return counts;
  }, [products]);

  // Handle category selection with URL update
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Update URL without page refresh
    const url = new URL(window.location.href);
    if (categoryId === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', categoryId);
    }
    window.history.pushState({}, '', url.toString());
  };

  // Skeleton loader component
  const ProductSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
      <div className="bg-gray-200 rounded-xl h-48 mb-4 animate-pulse-slow"></div>
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 rounded animate-pulse-slow"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse-slow"></div>
        <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse-slow"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse-slow"></div>
        <div className="h-10 bg-gray-200 rounded-xl animate-pulse-slow"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ zIndex: -1 }}>
      {/* Hero Section */}
      {!reviewsOpen && <SplashCursor /> }
              {/* SplashCursor completely removed when reviews modal is open for optimal performance */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
         
          <div className="text-center">
          <RotatingText
            texts={['Shop ALL you want !', 'Electronics', 'Gaming', 'Computing']}
            mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
            staggerFrom="last"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={2000}
          />
            <p className="text-xl sm:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Shop the latest trends with our curated collection of premium products
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full px-6 py-4 text-lg text-gray-900 bg-white rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 transition-all duration-300 pl-14 pr-14"
                />
                <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <button
                    type="button"
                    onClick={toggleListening}
                    aria-pressed={listening}
                    aria-label={listening ? 'Stop voice search' : 'Start voice search'}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                      listening 
                        ? 'bg-red-500 text-white hover:bg-red-600 cursor-pointer animate-pulse' 
                        : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                    }`}
                    title={listening ? 'Stop voice search' : 'Start voice search'}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with cart */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-3xl font-bold text-gray-900">
              {selectedCategory !== 'all' 
                ? categories.find(c => c.id === selectedCategory)?.name 
                : 'Featured Products'}
              {query && ` - Search Results for "${query}"`}
            </h2>
            <p className="text-gray-600 mt-2">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <Link 
            href="/cart" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            View Cart
            {cartItemCount > 0 && (
              <span className="ml-2 bg-white text-blue-600 text-sm font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>

        {/* Category Filter */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`group relative p-4 rounded-xl text-center transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r ' + category.color + ' text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md'
                }`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="text-xs font-medium mb-1">{category.name}</div>
                <div className={`text-xs ${
                  selectedCategory === category.id ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {categoryCounts[category.id as keyof typeof categoryCounts] || 0} items
                </div>
                {selectedCategory === category.id && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              {query 
                ? `No products match "${query}" in the selected category.`
                : 'No products in this category yet.'
              }
            </p>
            <div className="space-x-3">
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Clear Search
                </button>
              )}
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => handleCategorySelect('all')}
                  className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  View All Categories
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product: any) => {
              const category = productCategories[product.name as keyof typeof productCategories];
              const categoryInfo = categories.find(c => c.id === category);
              
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryInfo={categoryInfo}
                  ratingAvg={ratingMap[String(product.id)]?.avg || 0}
                  ratingCount={ratingMap[String(product.id)]?.count || 0}
                  onAddToCart={() => addToCart(product)}
                  onViewReviews={() => {
                    setSelectedProduct({ id: String(product.id), name: String(product.name || '') });
                    setReviewsOpen(true);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Reviews Modal */}
      {selectedProduct && (
        <ReviewsModal
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          isOpen={reviewsOpen}
          onClose={() => setReviewsOpen(false)}
          onAggregates={(avg, count) => {
            // Prevent infinite re-renders by checking if the value actually changed
            setRatingMap((prev) => {
              const current = prev[selectedProduct.id];
              if (current && current.avg === avg && current.count === count) {
                return prev; // No change needed
              }
              return { ...prev, [selectedProduct.id]: { avg, count } };
            });
          }}
        />
      )}
    </div>
  );
}
