"use client";

import { useState, useRef, useEffect } from 'react';
import StarRating from './StarRating';
import { useVoiceMode } from '../contexts/VoiceModeContext';

interface ProductCardProps {
  product: any;
  categoryInfo?: any;
  ratingAvg: number;
  ratingCount: number;
  onAddToCart: () => void;
  onViewReviews: () => void;
}

export default function ProductCard({
  product,
  categoryInfo,
  ratingAvg,
  ratingCount,
  onAddToCart,
  onViewReviews,
}: ProductCardProps) {
  const { isVoiceModeEnabled } = useVoiceMode();
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (utteranceRef.current && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getProductDescription = () => {
    const parts = [];
    parts.push(`Product: ${product.name || 'Unknown product'}.`);
    if (product.description) {
      parts.push(`Description: ${product.description}.`);
    }
    parts.push(`Price: ${product.price ? `₹${product.price}` : 'Price not available'}.`);
    if (ratingCount > 0) {
      parts.push(`Rating: ${ratingAvg.toFixed(1)} out of 5 stars, based on ${ratingCount} reviews.`);
    }
    return parts.join(' ');
  };

  const startReading = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    // If already reading this product, don't restart
    if (isReading && !isPaused) return;

    // If paused, resume
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    const text = getProductDescription();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsReading(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsReading(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utterance.onerror = () => {
      setIsReading(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const togglePause = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else if (isReading) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const stopReading = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
    utteranceRef.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter: Start reading
    if (e.key === 'Enter') {
      e.preventDefault();
      startReading();
    }
    // Spacebar: Toggle pause/resume
    else if (e.key === ' ') {
      e.preventDefault(); // Prevent page scroll
      if (isReading) {
        togglePause();
      } else {
        startReading();
      }
    }
    // Escape: Stop reading
    else if (e.key === 'Escape') {
      e.preventDefault();
      stopReading();
    }
  };

  return (
    <div 
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in"
      tabIndex={-1}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden rounded-t-2xl">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Category Badge */}
        {categoryInfo && (
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryInfo.color} text-white shadow-lg`}>
              {categoryInfo.icon} {categoryInfo.name}
            </span>
          </div>
        )}
        
        {/* Quick action overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 space-x-2">
            <button
              onClick={onAddToCart}
              className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
              title="Add to Cart"
              aria-label={`Add ${product.name} to cart`}
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name || 'No name'}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description || 'No description available'}
        </p>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mb-4 overflow-hidden">
          <div className="flex-shrink-0 overflow-hidden whitespace-nowrap" style={{ maxWidth: '100px' }}>
            <StarRating value={ratingAvg} readOnly />
          </div>
          <span className="text-sm text-gray-500 flex-shrink-0 whitespace-nowrap">
            {ratingCount ? `(${ratingCount})` : '(0)'}
          </span>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-gray-900">
            ₹{product.price || '0.00'}
          </span>
          <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
            In Stock
          </span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onAddToCart}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
            aria-label={`Add ${product.name} to cart`}
          >
            Add to Cart
          </button>
          <button
            onClick={onViewReviews}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            title="View Reviews"
            aria-label={`View reviews for ${product.name}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>

        {/* Listen to Description Button - Only visible in Voice Mode */}
        {isVoiceModeEnabled && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex gap-2">
              <button
                ref={buttonRef}
                onClick={startReading}
                onKeyDown={handleKeyDown}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
                  isReading
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white focus:ring-red-300 shadow-lg'
                    : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 focus:ring-orange-300 shadow-md'
                }`}
                aria-label={`Listen to description of ${product.name}. Press Enter to start, Space to pause or resume, Escape to stop`}
                title="Press Enter to start, Space to pause/resume, Escape to stop"
              >
                <svg className={`w-5 h-5 ${isReading && !isPaused ? 'animate-pulse' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
                <span>
                  {isPaused ? 'Resume' : isReading ? 'Reading...' : 'Listen to Description'}
                </span>
              </button>
              {isReading && (
                <button
                  onClick={stopReading}
                  className="px-3 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-opacity-50"
                  aria-label="Stop reading"
                  title="Stop"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h12v12H6z"/>
                  </svg>
                </button>
              )}
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">
              ⌨️ Enter: Start • Space: Pause/Resume • Esc: Stop
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
