import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserStats } from '../store/slices/statsSlice';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Clock, Target, Zap, Award, Calendar } from 'lucide-react';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const Stats = () => {
  const dispatch = useDispatch();
  const { userStats, loading } = useSelector((state) => state.stats);
  
  useEffect(() => {
    dispatch(getUserStats());
  }, [dispatch]);
  
  if (loading || !userStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  const { overview, charts, recentGames } = userStats;
  
  // Prepare data for charts
  const gamesPerDayData = charts.gamesPerDay || [];
  const boardSizeData = charts.boardSizeDistribution || [];
  const timeByBoardData = charts.timeByBoardSize || [];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Your Statistics Dashboard
          </h1>
          <p className="text-gray-600">Track your progress and achievements</p>
        </motion.div>
        
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard
            icon={<TrendingUp />}
            label="Total Games"
            value={overview.totalGames}
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={<Zap />}
            label="Fastest Time"
            value={formatTime(overview.fastestTime)}
            sublabel={overview.fastestBoardSize ? `${overview.fastestBoardSize}×${overview.fastestBoardSize}` : ''}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<Target />}
            label="Highest Board"
            value={`${overview.highestBoardSize}×${overview.highestBoardSize}`}
            color="from-green-500 to-teal-500"
          />
          <StatCard
            icon={<Clock />}
            label="Avg Solve Time"
            value={formatTime(overview.averageSolveTime)}
            color="from-orange-500 to-red-500"
          />
          <StatCard
            icon={<Award />}
            label="Total Hints"
            value={overview.totalHintsUsed}
            color="from-indigo-500 to-purple-500"
          />
          <StatCard
            icon={<Calendar />}
            label="Total Time"
            value={formatTotalTime(overview.totalTimeSpent)}
            color="from-pink-500 to-rose-500"
          />
        </div>
        
        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Games Per Day */}
          <ChartCard title="Games Played (Last 14 Days)">
            {gamesPerDayData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={gamesPerDayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="games"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No games played in the last 14 days" />
            )}
          </ChartCard>
          
          {/* Board Size Distribution */}
          <ChartCard title="Board Size Distribution">
            {boardSizeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={boardSizeData}
                    dataKey="games"
                    nameKey="size"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.size}×${entry.size}`}
                  >
                    {boardSizeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No board size data available" />
            )}
          </ChartCard>
        </div>
        
        {/* Time by Board Size Chart */}
        <ChartCard title="Average Solve Time by Board Size" className="mb-6">
          {timeByBoardData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeByBoardData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="size"
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Board Size', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value) => `${value}s`}
                />
                <Legend />
                <Bar dataKey="averageTime" fill="#8b5cf6" name="Average Time" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No time data available" />
          )}
        </ChartCard>
        
        {/* Recent Games */}
        <ChartCard title="Recent Games">
          {recentGames && recentGames.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Board Size</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Queens</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hints</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentGames.map((game, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-800">{game.n}×{game.n}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">{formatTime(game.timer)}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">{game.placedQueens}/{game.n}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">{game.hintsUsed}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(game.lastUpdated).toLocaleDateString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="No recent games" />
          )}
        </ChartCard>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, sublabel, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow"
  >
    <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center text-white mb-2`}>
      {icon}
    </div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-xl font-bold text-gray-800">{value}</p>
    {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
  </motion.div>
);

const ChartCard = ({ title, children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-2xl shadow-xl p-6 ${className}`}
  >
    <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
    {children}
  </motion.div>
);

const EmptyState = ({ message }) => (
  <div className="flex items-center justify-center h-64 text-gray-400">
    <p>{message}</p>
  </div>
);

const formatTime = (seconds) => {
  if (!seconds) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

const formatTotalTime = (seconds) => {
  if (!seconds) return '0h';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export default Stats;
