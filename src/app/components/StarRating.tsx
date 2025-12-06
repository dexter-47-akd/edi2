"use client";

import React, { useMemo, useState } from "react";

type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const Star: React.FC<{ filled: boolean; sizeClass: string } & React.HTMLAttributes<HTMLSpanElement>> = ({ filled, sizeClass, ...rest }) => {
  return (
    <span
      {...rest}
      className={`${sizeClass} inline-flex items-center justify-center flex-shrink-0`}
      aria-hidden="true"
      style={{ minWidth: 'var(--star-size)', minHeight: 'var(--star-size)' }}
    >
      <svg
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        className={`${filled ? "text-yellow-500" : "text-gray-300"} w-full h-full flex-shrink-0`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.889a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.889a1 1 0 00-1.176 0l-3.976 2.889c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.078 10.1c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.518-4.674z"
        />
      </svg>
    </span>
  );
};

export const StarRating: React.FC<StarRatingProps> = ({ value, onChange, readOnly = false, size = "md", className }) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const sizeClass = useMemo(() => {
    switch (size) {
      case "sm":
        return "w-4 h-4";
      case "lg":
        return "w-7 h-7";
      default:
        return "w-5 h-5";
    }
  }, [size]);

  const displayValue = hovered ?? Math.round(value);

  if (readOnly) {
    // Render fractional display with overlay for partial stars (averages)
    const clamped = Math.max(0, Math.min(5, value || 0));
    const percentage = (clamped / 5) * 100;
    
    // Set CSS variable for star size based on size prop
    const starSize = size === 'sm' ? '16px' : size === 'lg' ? '28px' : '20px';
    
    return (
      <div 
        className={`relative inline-flex overflow-hidden whitespace-nowrap max-w-full ${className || ""}`} 
        title={`${clamped.toFixed(1)} / 5`}
        style={{ '--star-size': starSize } as React.CSSProperties}
      >
        <div className="flex flex-shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={`bg-${i}`} filled={false} sizeClass={sizeClass} />
          ))}
        </div>
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${percentage}%` }}>
          <div className="flex flex-shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={`fg-${i}`} filled={true} sizeClass={sizeClass} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Set CSS variable for star size based on size prop
  const starSize = size === 'sm' ? '16px' : size === 'lg' ? '28px' : '20px';
  
  return (
    <div 
      className={`flex items-center gap-1 overflow-hidden whitespace-nowrap max-w-full ${className || ""}`} 
      role="radiogroup" 
      aria-label="Rating"
      style={{ '--star-size': starSize } as React.CSSProperties}
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayValue;
        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onChange && onChange(starValue)}
            className="focus:outline-none flex-shrink-0"
            aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
          >
            <Star filled={isFilled} sizeClass={sizeClass} />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;


