import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const IconButton: React.FC<IconButtonProps> = ({ children, className = '', ...rest }) => (
  <button className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${className}`} {...rest}>
    {children}
  </button>
);

export default IconButton;
