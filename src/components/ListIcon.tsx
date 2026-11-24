import React from 'react';
import {
  BookOpen,
  Briefcase,
  CheckSquare,
  Compass,
  Dumbbell,
  Gamepad2,
  Home,
  Music,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

export const LIST_ICON_OPTIONS = [
  { name: 'Gamepad2', label: 'Gaming' },
  { name: 'Home', label: 'Home & Chores' },
  { name: 'Sparkles', label: 'Seasonal & Events' },
  { name: 'CheckSquare', label: 'General Tasks' },
  { name: 'Compass', label: 'Exploration' },
  { name: 'Briefcase', label: 'Work' },
  { name: 'BookOpen', label: 'Study' },
  { name: 'ShoppingBag', label: 'Shopping' },
  { name: 'Dumbbell', label: 'Fitness' },
  { name: 'Music', label: 'Creative' },
] as const;

interface ListIconProps {
  name: string;
  className?: string;
}

export const ListIcon: React.FC<ListIconProps> = ({ name, className = 'w-4 h-4' }) => {
  switch (name) {
    case 'Gamepad2':
      return <Gamepad2 className={className} aria-hidden="true" />;
    case 'Home':
      return <Home className={className} aria-hidden="true" />;
    case 'Sparkles':
      return <Sparkles className={className} aria-hidden="true" />;
    case 'Compass':
      return <Compass className={className} aria-hidden="true" />;
    case 'Briefcase':
      return <Briefcase className={className} aria-hidden="true" />;
    case 'BookOpen':
      return <BookOpen className={className} aria-hidden="true" />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} aria-hidden="true" />;
    case 'Dumbbell':
      return <Dumbbell className={className} aria-hidden="true" />;
    case 'Music':
      return <Music className={className} aria-hidden="true" />;
    case 'CheckSquare':
    default:
      return <CheckSquare className={className} aria-hidden="true" />;
  }
};
