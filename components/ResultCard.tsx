import React from 'react';
import { GeneratedImage, CountryConfig } from '../types';

interface ResultCardProps {
  country: CountryConfig;
  data: GeneratedImage;
  onRetry: (countryId: string) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ country, data, onRetry }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full border border-gray-100">
      <div className="h-64 sm:h-72 w-full bg-gray-100 relative group">
        {data.status === 'success' && data.imageUrl ? (
          <>
            <img 
              src={data.imageUrl} 
              alt={`Person in ${country.name}`} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
            <a 
              href={data.imageUrl} 
              download={`globalme-${country.id}.png`}
              className="absolute bottom-3 right-3 bg-white/90 p-2 rounded-full shadow-sm hover:bg-white text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              title="Download"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          </>
        ) : data.status === 'loading' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
             <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-10 w-10"></div>
             <span className="text-xs text-gray-500 font-medium animate-pulse">Generating...</span>
          </div>
        ) : data.status === 'error' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-600 mb-1 font-medium">Generation Failed</p>
            {data.error && (
              <p className="text-xs text-red-400 mb-3 px-2 line-clamp-2" title={data.error}>
                {data.error}
              </p>
            )}
            <button 
              onClick={() => onRetry(country.id)}
              className="text-xs bg-red-50 hover:bg-red-100 text-red-700 py-2 px-4 rounded-full transition-colors border border-red-200"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <span className="text-gray-300">Waiting for upload</span>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-50 bg-white">
        <h3 className="font-bold text-gray-800">{country.name}</h3>
        <p className="text-xs text-gray-400 mt-1">AI Generated Variant</p>
      </div>
    </div>
  );
};

export default ResultCard;