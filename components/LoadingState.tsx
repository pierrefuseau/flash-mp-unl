import React from 'react';

interface LoadingStateProps {
    message: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
    return (
        <div className="fixed inset-0 bg-gray-100 flex flex-col items-center justify-center text-center p-4 z-50">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-800">
                Préparation de votre agent marketing...
            </h2>
            <p className="text-gray-600 mt-2">{message}</p>
        </div>
    );
};