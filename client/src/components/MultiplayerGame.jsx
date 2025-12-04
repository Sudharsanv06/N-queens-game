import React from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from './Layout'

const MultiplayerGame = () => {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <h1 className="text-3xl font-bold text-center mb-4">Multiplayer Mode</h1>
          <p className="text-center text-gray-600 mb-6">
            Multiplayer mode is coming soon! Challenge your friends in real-time N-Queens battles.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </Layout>
  )
}

export default MultiplayerGame
