"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface VoiceModeContextType {
  isVoiceModeEnabled: boolean;
  toggleVoiceMode: () => void;
  speak: (text: string, options?: { interrupt?: boolean }) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const VoiceModeContext = createContext<VoiceModeContextType | undefined>(undefined);

export function VoiceModeProvider({ children }: { children: React.ReactNode }) {
  const [isVoiceModeEnabled, setIsVoiceModeEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastFocusedElement = useRef<Element | null>(null);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback((text: string, options?: { interrupt?: boolean }) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Always cancel previous speech to prevent overlap
    if (options?.interrupt !== false) {
      window.speechSynthesis.cancel();
    }

    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const toggleVoiceMode = useCallback(() => {
    setIsVoiceModeEnabled(prev => {
      const newState = !prev;
      
      // Stop any ongoing speech when toggling off
      if (!newState) {
        stopSpeaking();
      } else {
        // Announce that voice mode is now enabled
        setTimeout(() => {
          speak('Voice mode enabled. Press Tab to navigate and hear element descriptions.');
        }, 100);
      }
      
      return newState;
    });
  }, [speak, stopSpeaking]);

  // Global keyboard shortcut: Shift + Enter to toggle Voice Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        toggleVoiceMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleVoiceMode]);

  // Smart Focus Announcements - Global focus tracking
  useEffect(() => {
    if (!isVoiceModeEnabled) {
      lastFocusedElement.current = null;
      return;
    }

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      
      // Avoid announcing the same element twice in a row
      if (target === lastFocusedElement.current) return;
      lastFocusedElement.current = target;

      // Only announce interactive elements
      const interactiveTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
      const isInteractive = interactiveTags.includes(target.tagName) || 
                           target.getAttribute('role') === 'button' ||
                           target.hasAttribute('tabindex');

      if (!isInteractive) return;

      // Get announcement text
      let announcement = '';
      
      // Priority order: aria-label > aria-labelledby > text content > placeholder > title
      const ariaLabel = target.getAttribute('aria-label');
      const ariaLabelledBy = target.getAttribute('aria-labelledby');
      const placeholder = target.getAttribute('placeholder');
      const title = target.getAttribute('title');
      
      if (ariaLabel) {
        announcement = ariaLabel;
      } else if (ariaLabelledBy) {
        const labelElement = document.getElementById(ariaLabelledBy);
        announcement = labelElement?.textContent || '';
      } else if (target.textContent && target.textContent.trim()) {
        announcement = target.textContent.trim();
      } else if (placeholder) {
        announcement = `${placeholder} input field`;
      } else if (title) {
        announcement = title;
      }

      // Add element type context
      const tagName = target.tagName.toLowerCase();
      if (tagName === 'button') {
        announcement = `${announcement} button`;
      } else if (tagName === 'a') {
        announcement = `${announcement} link`;
      } else if (tagName === 'input') {
        const inputType = target.getAttribute('type') || 'text';
        announcement = `${announcement} ${inputType} input`;
      }

      if (announcement) {
        speak(announcement);
      }
    };

    // Use capture phase to catch focus events early
    document.addEventListener('focus', handleFocus, true);

    return () => {
      document.removeEventListener('focus', handleFocus, true);
    };
  }, [isVoiceModeEnabled, speak]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  return (
    <VoiceModeContext.Provider
      value={{
        isVoiceModeEnabled,
        toggleVoiceMode,
        speak,
        stopSpeaking,
        isSpeaking,
      }}
    >
      {children}
    </VoiceModeContext.Provider>
  );
}

export function useVoiceMode() {
  const context = useContext(VoiceModeContext);
  if (context === undefined) {
    throw new Error('useVoiceMode must be used within a VoiceModeProvider');
  }
  return context;
}
