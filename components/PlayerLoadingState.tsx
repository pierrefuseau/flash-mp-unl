import React from 'react';

interface PlayerLoadingStateProps {
    commodityName: string;
}

export const PlayerLoadingState: React.FC<PlayerLoadingStateProps> = ({ commodityName }) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 animate-fade-in">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-semibold text-gray-600">
                Génération du podcast en cours...
            </p>
            <p className="text-xs text-gray-500 mt-1">
                Veuillez patienter pendant que nous préparons le flash pour {commodityName}.
            </p>
        </div>
    );
};
