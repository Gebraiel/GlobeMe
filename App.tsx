import React, { useState, useRef } from 'react';
import UploadZone from './components/UploadZone';
import ResultCard from './components/ResultCard';
import { COUNTRIES } from './constants';
import { GeneratedImage, CountryConfig } from './types';
import { generateCountryVariant } from './services/geminiService';

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<{ base64: string; mimeType: string } | null>(null);
  
  // Initialize state for all countries as 'idle'
  const [results, setResults] = useState<Record<string, GeneratedImage>>(() => {
    const initial: Record<string, GeneratedImage> = {};
    COUNTRIES.forEach(c => {
      initial[c.id] = { countryId: c.id, imageUrl: null, status: 'idle' };
    });
    return initial;
  });

  const [globalError, setGlobalError] = useState<string | null>(null);
  
  // Ref to track if generation should continue (handles "Start Over" interruption)
  const shouldContinueRef = useRef(false);

  const handleImageSelected = (base64: string, mimeType: string) => {
    setSourceImage({ base64, mimeType });
    setGlobalError(null);
    startGeneration(base64, mimeType);
  };

  const startGeneration = (base64: string, mimeType: string) => {
    shouldContinueRef.current = true;

    // Reset all statuses to loading
    setResults(prev => {
      const next = { ...prev };
      COUNTRIES.forEach(c => {
        next[c.id] = { countryId: c.id, imageUrl: null, status: 'loading' };
      });
      return next;
    });

    // Initiate requests IN PARALLEL
    // The service layer handles rate limit retries (429) internally.
    // This allows the UI to show all cards loading at once.
    COUNTRIES.forEach(country => {
      processCountry(base64, mimeType, country);
    });
  };

  const processCountry = async (base64: string, mimeType: string, country: CountryConfig) => {
    try {
      const imageUrl = await generateCountryVariant(base64, mimeType, country);
      
      // Check if user has reset the app while this was generating
      if (!shouldContinueRef.current) return;

      setResults(prev => ({
        ...prev,
        [country.id]: {
          countryId: country.id,
          imageUrl,
          status: 'success'
        }
      }));
    } catch (err: any) {
      if (!shouldContinueRef.current) return;

      // Error is already cleaned in the service layer, but we ensure it's a string here
      const errorMessage = typeof err.message === 'string' ? err.message : 'Unknown error occurred';
      
      console.error(`Failed for ${country.name}`, err);
      setResults(prev => ({
        ...prev,
        [country.id]: {
          countryId: country.id,
          imageUrl: null,
          status: 'error',
          error: errorMessage
        }
      }));
    }
  };

  const handleRetry = (countryId: string) => {
    if (!sourceImage) return;
    
    const country = COUNTRIES.find(c => c.id === countryId);
    if (!country) return;

    // Set specific card to loading
    setResults(prev => ({
      ...prev,
      [countryId]: { ...prev[countryId], status: 'loading', error: undefined }
    }));

    processCountry(sourceImage.base64, sourceImage.mimeType, country);
  };

  const handleReset = () => {
    shouldContinueRef.current = false; // Stop any ongoing loop/updates
    setSourceImage(null);
    setResults(prev => {
      const next: Record<string, GeneratedImage> = {};
      COUNTRIES.forEach(c => {
        next[c.id] = { countryId: c.id, imageUrl: null, status: 'idle' };
      });
      return next;
    });
    setGlobalError(null);
  };

  const isAnyLoading = Object.values(results).some((r: GeneratedImage) => r.status === 'loading');

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 18z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">GlobalMe <span className="text-blue-600">Identity</span></h1>
          </div>
          {sourceImage && (
            <button 
              onClick={handleReset}
              className="text-sm text-gray-600 hover:text-red-600 font-medium transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Intro / Upload Section */}
        <div className={`transition-all duration-500 ease-in-out ${sourceImage ? 'mb-8' : 'mb-20 mt-10'}`}>
          {!sourceImage && (
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                See yourself <span className="text-blue-600">everywhere</span>.
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload one photo. Our AI will reimagine you living naturally in Egypt, USA, Saudi Arabia, UAE, Germany, and China.
              </p>
            </div>
          )}

          <div className={`${sourceImage ? 'hidden' : 'block'}`}>
            <UploadZone onImageSelected={handleImageSelected} isProcessing={isAnyLoading} />
          </div>

          {/* Source Image Preview (Small, when results are showing) */}
          {sourceImage && (
            <div className="flex items-center justify-center mb-8 gap-4 animate-fadeIn">
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Original Photo</span>
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-blue-100">
                  <img src={sourceImage.base64} alt="Original" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="h-0.5 w-16 bg-gray-200"></div>
              <div className="text-gray-400 text-sm italic">
                {isAnyLoading ? 'Generating variants...' : 'Generation Complete'}
              </div>
            </div>
          )}
        </div>

        {/* Global Error */}
        {globalError && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {globalError}
          </div>
        )}

        {/* Results Grid */}
        {sourceImage && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {COUNTRIES.map((country) => (
              <ResultCard 
                key={country.id}
                country={country}
                data={results[country.id]}
                onRetry={handleRetry}
              />
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default App;