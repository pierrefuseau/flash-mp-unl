import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="w-full p-4 text-center bg-red-50 border border-red-200 rounded-lg">
      <h3 className="font-semibold text-red-800">Une erreur est survenue</h3>
      <p className="text-red-600 text-sm mt-1">{message}</p>
    </div>
  );
};