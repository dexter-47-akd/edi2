import { ForwardRefExoticComponent, RefAttributes } from 'react';

interface RotatingTextProps {
  texts: string[];
  transition?: {
    type: string;
    damping: number;
    stiffness: number;
  };
  initial?: {
    y: string;
    opacity?: number;
  };
  animate?: {
    y: number;
    opacity?: number;
  };
  exit?: {
    y: string;
    opacity?: number;
  };
  animatePresenceMode?: string;
  animatePresenceInitial?: boolean;
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: string;
  loop?: boolean;
  auto?: boolean;
  splitBy?: string;
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
}

declare const RotatingText: ForwardRefExoticComponent<RotatingTextProps & RefAttributes<any>>;

export default RotatingText;


