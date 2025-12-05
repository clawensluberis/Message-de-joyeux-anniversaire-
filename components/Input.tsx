import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    <input
      className={`w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 
      focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${className}`}
      {...props}
    />
  </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className = '', ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    <textarea
      className={`w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 
      focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 min-h-[100px] ${className}`}
      {...props}
    />
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    <select
      className={`w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-white 
      focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);
