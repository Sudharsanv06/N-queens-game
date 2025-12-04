import React from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from './Layout'

const DailyChallenge = () => {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <h1 className="text-3xl font-bold text-center mb-4">Daily Challenge</h1>
          <p className="text-center text-gray-600 mb-6">
            Complete today's challenge to earn bonus rewards and climb the leaderboard!
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </Layout>
  )
}

export default DailyChallenge
