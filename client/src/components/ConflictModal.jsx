import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mergeSaveAsync, clearConflictData } from '../store/slices/saveSlice';
import { useResumeOnLogin } from '../hooks/useResumeOnLogin';

const ConflictModal = ({ onResolve }) => {
  const dispatch = useDispatch();
  const { conflictData } = useSelector(state => state.save);
  const { mergeGameStates } = useResumeOnLogin();

  if (!conflictData) return null;

  const { local, server, localTime, serverTime, newerSource } = conflictData;

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleUseLocal = async () => {
    try {
      await dispatch(mergeSaveAsync(local)).unwrap();
      dispatch(clearConflictData());
      if (onResolve) onResolve(local);
    } catch (error) {
      console.error('Failed to use local save:', error);
    }
  };

  const handleUseServer = async () => {
    try {
      dispatch(clearConflictData());
      if (onResolve) onResolve(server);
    } catch (error) {
      console.error('Failed to use server save:', error);
    }
  };

  const handleMerge = async () => {
    try {
      const merged = mergeGameStates(local, server);
      await dispatch(mergeSaveAsync(merged)).unwrap();
      dispatch(clearConflictData());
      if (onResolve) onResolve(merged);
    } catch (error) {
      console.error('Failed to merge saves:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Save Conflict Detected
          </h2>
          
          <p className="text-gray-600 mb-6">
            Your local save and server save differ. Choose which version to use:
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className={`border-2 rounded-lg p-4 ${newerSource === 'local' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">Local Save</h3>
                {newerSource === 'local' && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Newer</span>
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Time:</strong> {formatTime(localTime)}</p>
                <p><strong>Moves:</strong> {local.moves?.length || 0}</p>
                <p><strong>Queens:</strong> {local.placedQueens || 0}</p>
                <p><strong>Timer:</strong> {Math.floor((local.timer || 0) / 1000)}s</p>
                <p><strong>Hints Used:</strong> {local.hintsUsed || 0}</p>
              </div>
            </div>

            <div className={`border-2 rounded-lg p-4 ${newerSource === 'server' ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">Server Save</h3>
                {newerSource === 'server' && (
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">Newer</span>
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Time:</strong> {formatTime(serverTime)}</p>
                <p><strong>Moves:</strong> {server.moves?.length || 0}</p>
                <p><strong>Queens:</strong> {server.placedQueens || 0}</p>
                <p><strong>Timer:</strong> {Math.floor((server.timer || 0) / 1000)}s</p>
                <p><strong>Hints Used:</strong> {server.hintsUsed || 0}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUseLocal}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Use Local
            </button>
            
            <button
              onClick={handleUseServer}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Use Server
            </button>
            
            <button
              onClick={handleMerge}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Smart Merge
            </button>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Smart Merge:</strong> Combines both saves by taking the latest timestamp for each move. 
              Recommended if you made changes on different devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;
