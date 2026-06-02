import React from 'react'
import { useNavigate } from 'react-router-dom'

const About = () => {
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-4xl font-bold mb-6">About N-Queens Game</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">What is the N-Queens Problem?</h2>
          <p className="text-gray-700 mb-4">
            The N-Queens puzzle is a classic problem where the challenge is to place N chess queens on an N×N chessboard 
            so that no two queens threaten each other. This means no two queens can share the same row, column, or diagonal.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">How to Play</h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>Click on any square to place a queen</li>
            <li>Place all N queens on the board</li>
            <li>Make sure no queens are attacking each other</li>
            <li>Check your solution to win!</li>
          </ol>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Features</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Multiple board sizes (4x4 to 12x12)</li>
            <li>Daily challenges</li>
            <li>Achievements and rewards</li>
            <li>Global leaderboard</li>
            <li>Offline mode</li>
          </ul>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition"
        >
          Start Playing
        </button>
      </div>
  )
}

export default About
