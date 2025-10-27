import React, { useState, useCallback, useEffect } from 'react';
import { CommodityListItem } from './components/CommodityListItem';
import { AudioPlayer } from './components/AudioPlayer';
import { TopHeader } from './components/TopHeader';
import { ErrorDisplay } from './components/ErrorDisplay';
import { Placeholder } from './components/Placeholder';
import { GenerationStatus } from './components/GenerationStatus';
import { COMMODITIES, PODCAST_STORAGE_BASE_URL } from './constants';
import { generatePodcastScript, generatePodcastAudio } from './services/geminiService';
import { getAudioFromCache, putAudioInCache } from './services/cacheService';
import type { Commodity } from './types';

function base64ToBlob(base64: string, contentType: string = 'audio/mpeg'): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

export default function App() {
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<number | null>(null);
  const [isManualGenerating, setIsManualGenerating] = useState(false);
  const [manualAudioUrls, setManualAudioUrls] = useState<Record<string, string>>({});


  useEffect(() => {
    // Initial check for pre-generated files
    const checkPodcastStatus = async () => {
      let generatedCount = 0;
      const totalCommodities = COMMODITIES.length;

      for (const commodity of COMMODITIES) {
        const url = `${PODCAST_STORAGE_BASE_URL}/podcast_${commodity.id}.mp3`;
        try {
          // Check cache first for faster verification
          const cached = await getAudioFromCache(url);
          if (cached) {
            generatedCount++;
          } else {
            const response = await fetch(url, { method: 'HEAD', cache: 'no-store' });
            if (response.ok) {
              generatedCount++;
            }
          }
        } catch (e) {
          // Ignore fetch errors, treat as file not found
        }
        const currentProgress = Math.round((generatedCount / totalCommodities) * 100);
        setGenerationProgress(currentProgress);
      }
    };

    checkPodcastStatus();
  }, []);

  const handleForceGeneration = useCallback(async () => {
    setError(null);
    setIsManualGenerating(true);
    setGenerationProgress(0);
    setManualAudioUrls({});
    
    try {
        for (const [index, commodity] of COMMODITIES.entries()) {
            const script = await generatePodcastScript(commodity);
            const base64Audio = await generatePodcastAudio(script);
            
            const audioBlob = base64ToBlob(base64Audio);
            const objectUrl = URL.createObjectURL(audioBlob);
            
            setManualAudioUrls(prev => ({...prev, [commodity.id]: objectUrl}));
            
            // Cache the manually generated blob
            const urlToCache = `${PODCAST_STORAGE_BASE_URL}/podcast_${commodity.id}.mp3`;
            const responseToCache = new Response(audioBlob, {
                headers: { 'Content-Type': 'audio/mpeg' }
            });
            await putAudioInCache(urlToCache, responseToCache);
            
            const currentProgress = Math.round(((index + 1) / COMMODITIES.length) * 100);
            setGenerationProgress(currentProgress);
        }
    } catch (e: any) {
        setError(e.message || 'Une erreur est survenue lors de la génération manuelle.');
    } finally {
        setIsManualGenerating(false);
    }
  }, []);

  const handleCommoditySelect = useCallback(async (commodity: Commodity) => {
    if (selectedCommodity?.id === commodity.id) {
      return;
    }
    
    setSelectedCommodity(commodity);
    setError(null);
    setAudioUrl(null); // Show loading briefly

    // 1. Prioritize manually generated audio from the current session
    if (manualAudioUrls[commodity.id]) {
      setAudioUrl(manualAudioUrls[commodity.id]);
      return;
    } 

    const url = `${PODCAST_STORAGE_BASE_URL}/podcast_${commodity.id}.mp3`;

    // 2. Check cache for pre-generated file
    const cachedResponse = await getAudioFromCache(url);
    if (cachedResponse) {
        const audioBlob = await cachedResponse.blob();
        setAudioUrl(URL.createObjectURL(audioBlob));
        return;
    }

    // 3. If not in cache, use network URL and cache it for next time
    setAudioUrl(url); // Let the player stream directly from the network
    
    // Fetch and cache in the background for subsequent plays
    try {
        const networkResponse = await fetch(url);
        if (networkResponse.ok) {
            await putAudioInCache(url, networkResponse);
        } else {
             // The player's onError will handle the user-facing error.
             console.warn(`Failed to cache ${url}, status: ${networkResponse.status}`);
        }
    } catch (e) {
        console.error(`Failed to fetch and cache ${url}`, e);
    }

  }, [selectedCommodity, manualAudioUrls]);
  
  const handleAudioError = useCallback(() => {
    setError(`Le podcast pour "${selectedCommodity?.name}" n'a pas pu être chargé. Il est peut-être en cours de génération ou indisponible pour le moment.`);
    setAudioUrl(null);
    setSelectedCommodity(null);
  }, [selectedCommodity]);


  return (
    <div className="min-h-screen bg-gray-100">
      <TopHeader />
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Retour au tableau de bord
        </a>

        <main className="mt-4 bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#d93644]">
            Agent Marketing - Flash Matières Premières
          </h1>
          <p className="mt-2 text-gray-500">
            Écoutez les derniers flashs quotidiens sur les marchés. Le contenu est mis à jour chaque nuit à 1h.
          </p>

          <GenerationStatus 
            progress={generationProgress} 
            isGenerating={isManualGenerating}
            onForceGenerate={handleForceGeneration}
          />

          {error && <div className="mt-6"><ErrorDisplay message={error} /></div>}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Panel */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-base font-semibold text-gray-700 pb-3 border-b border-gray-200">
                1. Sélectionnez un flash à écouter
              </h2>
              <div className="mt-4 space-y-2">
                {COMMODITIES.map((commodity) => (
                  <CommodityListItem
                    key={commodity.id}
                    commodity={commodity}
                    onSelect={handleCommoditySelect}
                    isSelected={selectedCommodity?.id === commodity.id}
                  />
                ))}
              </div>
            </div>

            {/* Right Panel */}
            <div className="border border-gray-200 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
              {selectedCommodity && audioUrl ? (
                <AudioPlayer
                  key={selectedCommodity.id}
                  audioUrl={audioUrl}
                  commodity={selectedCommodity}
                  onError={handleAudioError}
                />
              ) : (
                <Placeholder />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}