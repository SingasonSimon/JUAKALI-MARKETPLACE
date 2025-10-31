import React from 'react';

export default function LoadingButton({ 
  children, 
  loading = false, 
  disabled = false,
  className = '',
  variant = 'primary',
  ...props 
}) {
  const baseClasses = 'font-bold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-500 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}

