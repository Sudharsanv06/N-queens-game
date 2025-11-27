// Analytics utilities for tournament system and daily challenges
export const calculateTournamentStats = (tournament) => {
  const totalParticipants = tournament.participants.length
  const completedMatches = tournament.matches.filter(match => match.status === 'completed').length
  const totalMatches = tournament.matches.length
  const progressPercentage = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0

  return {
    totalParticipants,
    completedMatches,
    totalMatches,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
    status: tournament.status,
    averageScore: tournament.participants.reduce((sum, p) => sum + (p.score || 0), 0) / totalParticipants || 0
  }
}

export const generateMatchAnalytics = (match) => {
  if (!match.player1Score && !match.player2Score) {
    return null
  }

  return {
    matchId: match._id,
    duration: match.completedAt && match.startedAt 
      ? new Date(match.completedAt) - new Date(match.startedAt)
      : null,
    scoreDifference: Math.abs((match.player1Score || 0) - (match.player2Score || 0)),
    isCloseMatch: Math.abs((match.player1Score || 0) - (match.player2Score || 0)) <= 100
  }
}

export const getTournamentLeaderboard = (tournament) => {
  return tournament.participants
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .map((participant, index) => ({
      rank: index + 1,
      userId: participant.user,
      score: participant.score || 0,
      matchesPlayed: tournament.matches.filter(match => 
        match.player1 === participant.user || match.player2 === participant.user
      ).length
    }))
}

// Daily challenge analytics tracking
export const trackDailyChallengeCompleted = (challengeData) => {
  // This would typically integrate with an analytics service
  console.log('Daily challenge completed:', challengeData)
  return true
}

export const trackDailyChallengeAttempted = (challengeData) => {
  console.log('Daily challenge attempted:', challengeData)
  return true
}

export const trackDailyChallengeGenerated = (challengeData) => {
  console.log('Daily challenge generated:', challengeData)
  return true
}