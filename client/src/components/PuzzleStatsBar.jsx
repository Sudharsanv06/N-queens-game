import React from 'react';
import { Move, Lightbulb, Target } from 'lucide-react';

const PuzzleStatsBar = ({ movesUsed, hintsUsed, maxHints, queensPlaced, totalQueens }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="grid grid-cols-3 gap-4">
        {/* Moves Counter */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
            <Move className="w-6 h-6 text-purple-600" />
          </div>
          <span className="text-2xl font-bold text-gray-800">{movesUsed}</span>
          <span className="text-xs text-gray-500 font-medium">Moves</span>
        </div>

        {/* Hints Counter */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-gray-800">{hintsUsed}</span>
            <span className="text-sm text-gray-500">/ {maxHints}</span>
          </div>
          <span className="text-xs text-gray-500 font-medium">Hints Used</span>
        </div>

        {/* Queens Placed */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-gray-800">{queensPlaced}</span>
            <span className="text-sm text-gray-500">/ {totalQueens}</span>
          </div>
          <span className="text-xs text-gray-500 font-medium">Queens</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold text-gray-600">Progress</span>
          <span className="text-xs font-semibold text-gray-800">
            {Math.round((queensPlaced / totalQueens) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${(queensPlaced / totalQueens) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default PuzzleStatsBar;
