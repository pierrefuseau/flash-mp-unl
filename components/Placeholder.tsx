import React from 'react';

export function Placeholder() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 6l12-3" /></svg>
      <p className="text-sm font-semibold text-gray-600">
        Le lecteur audio apparaîtra ici
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Sélectionnez une matière première sur la gauche pour commencer.
      </p>
    </div>
  );
}