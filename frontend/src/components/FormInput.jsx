import React from 'react';

export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder,
  className = '',
  ...props
}) {
  const inputId = `input-${name}`;
  const inputStyle = "w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition";
  const labelStyle = "block text-sm font-medium text-gray-300 mb-2";

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className={labelStyle}>
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={inputStyle}
          {...props}
        />
      ) : (
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={inputStyle}
          {...props}
        />
      )}
      {error && (
        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
          <span>⚠</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

