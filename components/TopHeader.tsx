import React from 'react';

export function TopHeader() {
  return (
    <header className="bg-[#d93644] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center">
            <div className="flex items-center">
                <div className="bg-white p-1 rounded-md mr-3">
                    <span className="text-xl font-bold text-[#d93644]">unl</span>
                </div>
                <div>
                    <h1 className="font-bold text-lg">Idéal by UNL</h1>
                    <p className="text-xs text-red-100">Assistants IA pour le commerce de gros alimentaire</p>
                </div>
            </div>
        </div>
    </header>
  );
}