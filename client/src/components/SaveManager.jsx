import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setAutoSaveEnabled, 
  saveGameAsync,
  listGamesAsync,
  deleteGameAsync,
  clearError
} from '../store/slices/saveSlice';
import { useAutoSave } from '../hooks/useAutoSave';

const SaveManager = ({ gameState, sessionId, onLoadGame }) => {
  const dispatch = useDispatch();
  const { 
    autoSaveEnabled, 
    saveStatus, 
    failedSaves, 
    lastSaveTime,
    savesList,
    pagination,
    error 
  } = useSelector(state => state.save);
  
  const [showSavesList, setShowSavesList] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const { forceSave, isSaving, pendingSaves } = useAutoSave(gameState, sessionId, {
    onSaveSuccess: () => {
      showSuccessToast('Game saved successfully!');
    },
    onSaveError: (error) => {
      showErrorToast('Auto-save failed. Will retry...');
    }
  });

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setToastType('success');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const showErrorToast = (message) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const handleToggleAutoSave = () => {
    dispatch(setAutoSaveEnabled(!autoSaveEnabled));
    showSuccessToast(`Auto-save ${!autoSaveEnabled ? 'enabled' : 'disabled'}`);
  };

  const handleForceSave = async () => {
    try {
      await forceSave();
      showSuccessToast('Manual save successful!');
    } catch (error) {
      showErrorToast('Manual save failed');
    }
  };

  const handleLoadSavesList = async () => {
    try {
      await dispatch(listGamesAsync({ page: 1, limit: 10 })).unwrap();
      setShowSavesList(true);
    } catch (error) {
      showErrorToast('Failed to load saves list');
    }
  };

  const handleLoadSave = (save) => {
    if (onLoadGame) {
      onLoadGame(save);
      setShowSavesList(false);
      showSuccessToast('Game loaded successfully!');
    }
  };

  const handleDeleteSave = async (saveId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this save?')) {
      try {
        await dispatch(deleteGameAsync(saveId)).unwrap();
        showSuccessToast('Save deleted successfully');
      } catch (error) {
        showErrorToast('Failed to delete save');
      }
    }
  };

  const formatLastSaveTime = () => {
    if (!lastSaveTime) return 'Never';
    const seconds = Math.floor((Date.now() - lastSaveTime) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getSaveStatusColor = () => {
    if (isSaving) return 'text-blue-500';
    if (failedSaves > 0) return 'text-red-500';
    if (saveStatus === 'succeeded') return 'text-green-500';
    return 'text-gray-500';
  };

  const getSaveStatusIcon = () => {
    if (isSaving) return '⟳';
    if (failedSaves > 0) return '⚠';
    if (saveStatus === 'succeeded') return '✓';
    return '○';
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Save Manager</h3>
          <div className={`flex items-center gap-2 ${getSaveStatusColor()}`}>
            <span className="text-xl">{getSaveStatusIcon()}</span>
            <span className="text-sm font-medium">
              {isSaving ? 'Saving...' : formatLastSaveTime()}
            </span>
          </div>
        </div>

        {failedSaves > 0 && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {failedSaves} save(s) failed. {pendingSaves > 0 && `${pendingSaves} pending retry.`}
          </div>
        )}

        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => dispatch(clearError())}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={handleForceSave}
            disabled={isSaving || !gameState}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
          >
            Save Now
          </button>

          <button
            onClick={handleLoadSavesList}
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
          >
            Load Game
          </button>

          <button
            onClick={handleToggleAutoSave}
            className={`${
              autoSaveEnabled 
                ? 'bg-purple-500 hover:bg-purple-600' 
                : 'bg-gray-400 hover:bg-gray-500'
            } text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm`}
          >
            Auto: {autoSaveEnabled ? 'ON' : 'OFF'}
          </button>

          <div className="flex items-center justify-center bg-gray-100 rounded-lg px-2">
            <span className="text-xs text-gray-600">
              Every 10s
            </span>
          </div>
        </div>
      </div>

      {showSavesList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Your Saved Games</h2>
                <button
                  onClick={() => setShowSavesList(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {savesList.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No saved games found</p>
              ) : (
                <div className="space-y-3">
                  {savesList.map((save) => (
                    <div
                      key={save.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
                      onClick={() => handleLoadSave(save)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {save.n}×{save.n} Board
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(save.lastUpdated).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteSave(save.id, e)}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Queens:</span> {save.placedQueens}
                        </div>
                        <div>
                          <span className="font-medium">Moves:</span> {save.moves?.length || 0}
                        </div>
                        <div>
                          <span className="font-medium">Time:</span> {Math.floor((save.timer || 0) / 1000)}s
                        </div>
                        <div>
                          <span className="font-medium">Hints:</span> {save.hintsUsed || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {pagination && pagination.pages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    onClick={() => dispatch(listGamesAsync({ page: pagination.page - 1, limit: 10 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => dispatch(listGamesAsync({ page: pagination.page + 1, limit: 10 }))}
                    disabled={pagination.page >= pagination.pages}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white font-medium animate-fade-in`}>
          {toastMessage}
        </div>
      )}
    </>
  );
};

export default SaveManager;
