import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...rest }) => {
  const base = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const styles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-white text-blue-600 border border-gray-200 hover:bg-gray-50',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-50'
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
};

export default Button;
