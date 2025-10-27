import React from 'react';

interface GenerationStatusProps {
  progress: number | null;
  isGenerating: boolean;
  onForceGenerate: () => void;
}

export const GenerationStatus: React.FC<GenerationStatusProps> = ({ progress, isGenerating, onForceGenerate }) => {
  if (progress === null && !isGenerating) {
    return (
      <div className="mt-6 p-4 bg-gray-50 border rounded-lg flex items-center">
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-3"></div>
        <p className="text-sm text-gray-600">Vérification du statut des podcasts...</p>
      </div>
    );
  }

  const isComplete = progress === 100;
  const title = isGenerating ? "Génération manuelle en cours" : "Statut de la mise à jour nocturne";
  const statusColor = isComplete && !isGenerating ? 'bg-green-500' : 'bg-yellow-500';

  const statusText = isGenerating 
    ? "Préparation des flashs..."
    : (isComplete ? "Tous les flashs sont à jour" : "Mise à jour en cours...");
  
  return (
    <div className="mt-6 p-4 bg-gray-50 border rounded-lg animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <button
          onClick={onForceGenerate}
          disabled={isGenerating}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-[#d93644] rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-wait transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          {isGenerating ? 'Génération en cours...' : 'Forcer la génération'}
        </button>
      </div>
      <div className="flex justify-between items-center mb-2 mt-3">
        <p className={`text-sm font-bold ${isComplete && !isGenerating ? 'text-green-600' : 'text-yellow-700'}`}>
          {statusText}
        </p>
        <p className={`text-sm font-bold ${isComplete && !isGenerating ? 'text-green-600' : 'text-yellow-700'}`}>
          {progress ?? 0}%
        </p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`${statusColor} h-2.5 rounded-full transition-all duration-300 ease-linear`} 
          style={{ width: `${progress ?? 0}%` }}
        ></div>
      </div>
    </div>
  );
};