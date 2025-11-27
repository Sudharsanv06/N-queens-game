// client/src/router.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Stats from './pages/Stats';
import Leaderboard from './pages/Leaderboard';
import ProtectedRoute from './components/ProtectedRoute';
import Board from './components/Board';
import GameBoard from './components/GameBoard';
import GameModeSelection from './components/GameModeSelection';
import RegisteredGameModes from './components/RegisteredGameModes';
import ClassicMode from './components/ClassicMode';
import TimeTrialMode from './components/TimeTrialMode';
import Tutorial from './components/Tutorial';
import Achievements from './components/Achievements';
import EmailNotificationSettings from './components/EmailNotificationSettings';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import FriendsList from './components/Social/FriendsList';
import GameReplays from './components/Social/GameReplays';
import PuzzleCreator from './components/Puzzles/PuzzleCreator';
import PuzzleLibrary from './components/Puzzles/PuzzleLibrary';
import TournamentList from './components/TournamentList';
import NQueensGame from './components/BoardGame/NQueensGame';
import PuzzleList from './pages/PuzzleList';
import PuzzlePlay from './pages/PuzzlePlay';
import PuzzleCompleted from './pages/PuzzleCompleted';
import SettingsPage from './pages/SettingsPage';
import MultiplayerHome from './pages/MultiplayerHome';
import MultiplayerRoom from './pages/MultiplayerRoom';
import MultiplayerLeaderboard from './pages/MultiplayerLeaderboard';
import Matchmaking from './pages/Matchmaking';
import AchievementsPage from './pages/AchievementsPage';
import BadgesPage from './pages/BadgesPage';
import DailyChallengePage from './pages/DailyChallengePage';

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* Authentication routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Protected User routes */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      
      {/* Public routes */}
      <Route path="/tutorial" element={<Tutorial />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/achievements" element={<Achievements />} />
      <Route path="/achievements-page" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
      <Route path="/badges" element={<ProtectedRoute><BadgesPage /></ProtectedRoute>} />
      <Route path="/daily-challenge" element={<ProtectedRoute><DailyChallengePage /></ProtectedRoute>} />
      <Route path="/email-settings" element={<EmailNotificationSettings />} />
      <Route path="/analytics" element={<AnalyticsDashboard />} />
      
      {/* Social Features */}
      <Route path="/friends" element={<FriendsList />} />
      <Route path="/replays" element={<GameReplays />} />
      
      {/* Tournament System */}
      <Route path="/tournaments" element={<TournamentList />} />
      
      {/* Puzzle Features */}
      <Route path="/puzzle-creator" element={<PuzzleCreator />} />
      <Route path="/puzzle-library" element={<PuzzleLibrary />} />
      
      {/* NEW: Predefined Puzzle Mode System */}
      <Route path="/puzzles" element={<PuzzleList />} />
      <Route path="/puzzles/:puzzleId" element={<ProtectedRoute><PuzzlePlay /></ProtectedRoute>} />
      <Route path="/puzzles/:puzzleId/completed" element={<ProtectedRoute><PuzzleCompleted /></ProtectedRoute>} />
      
      {/* Multiplayer Routes */}
      <Route path="/multiplayer" element={<ProtectedRoute><MultiplayerHome /></ProtectedRoute>} />
      <Route path="/multiplayer/matchmaking" element={<ProtectedRoute><Matchmaking /></ProtectedRoute>} />
      <Route path="/multiplayer/room/:roomId" element={<ProtectedRoute><MultiplayerRoom /></ProtectedRoute>} />
      <Route path="/multiplayer/leaderboard" element={<MultiplayerLeaderboard />} />
      
      {/* NEW: Interactive N-Queens Game */}
      <Route path="/play-game" element={<NQueensGame />} />
      <Route path="/nqueens" element={<NQueensGame />} />
      
      {/* Game routes */}
      <Route path="/game-mode-selection" element={<GameModeSelection />} />
      <Route path="/registered-game-modes" element={<RegisteredGameModes />} />
      <Route path="/classic-mode" element={<ClassicMode />} />
      <Route path="/time-trial-mode" element={<TimeTrialMode />} />
      <Route path="/game/free-trial" element={<GameBoard />} />
      <Route path="/game/classic" element={<GameBoard />} />
      <Route path="/game/time-trial" element={<GameBoard />} />
      <Route path="/game/puzzle-mode" element={<GameBoard />} />
      <Route path="/game/multiplayer" element={<GameBoard />} />
      <Route path="/game/:mode" element={<Board />} />
      <Route path="/game" element={<Board />} />
    </Routes>
  );
};

export default Router;
