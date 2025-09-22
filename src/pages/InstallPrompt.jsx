import React from 'react';

const InstallPrompt = ({ canInstall, promptInstall }) => {
  if (!canInstall) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-md p-4 z-50">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Install Our App</h3>
      <p className="text-sm text-gray-600 mb-4">Add this app to your home screen for a better experience!</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={promptInstall}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          Install
        </button>
        <button
          onClick={() => localStorage.setItem('pwa-installed', 'true')} // Simulate dismissal
          className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors text-sm"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;