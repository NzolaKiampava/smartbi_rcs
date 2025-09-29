import React from 'react';

interface AvatarProps {
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  alt?: string;
  className?: string;
  name?: string; // used to render initials fallback
}

const sizeMap: Record<string, string> = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16'
};

const Avatar: React.FC<AvatarProps> = ({ src, size = 'md', alt = 'Avatar', className = '', name }) => {
  const initials = (() => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return '';
  })();

  return (
    <div className={`${sizeMap[size]} bg-blue-500 rounded-full flex items-center justify-center overflow-hidden ${className}`} aria-hidden>
      {src ? <img src={src} alt={alt} className="w-full h-full object-cover" /> : (initials ? <span className="text-white font-medium">{initials}</span> : null)}
    </div>
  );
};

export default Avatar;
