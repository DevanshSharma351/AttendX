import { TrendingUp, TrendingDown, Target, Book } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const OverallStats = ({ subjects, overallPercentage }) => {
  if (subjects.length === 0) return null;

  const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
  const totalClasses = subjects.reduce((sum, s) => sum + s.total, 0);

  // Prepare data for bar chart
  const chartData = subjects.map(subject => ({
    name: subject.code,
    percentage: subject.total > 0 ? ((subject.attended / subject.total) * 100).toFixed(1) : 0,
    attended: subject.attended,
    total: subject.total,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-effect rounded-lg p-3 border border-white/20">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-pink-300">{data.percentage}%</p>
          <p className="text-gray-300 text-sm">{data.attended}/{data.total} classes</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-effect rounded-2xl p-6 mb-8">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <TrendingUp className="w-7 h-7 text-pink-400" />
        Overall Statistics
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-gray-300 text-sm">Overall</span>
          </div>
          <p className="text-3xl font-bold text-white">{overallPercentage}%</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-xl p-4 border border-pink-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Book className="w-5 h-5 text-pink-400" />
            <span className="text-gray-300 text-sm">Subjects</span>
          </div>
          <p className="text-3xl font-bold text-white">{subjects.length}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-gray-300 text-sm">Attended</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalAttended}</p>
        </div>

        <div className="bg-gradient-to-br from-rose-500/20 to-rose-600/20 rounded-xl p-4 border border-rose-500/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-rose-400" />
            <span className="text-gray-300 text-sm">Total</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalClasses}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Subject-wise Breakdown</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af" 
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af" 
                style={{ fontSize: '12px' }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.percentage >= 75 ? '#a78bfa' : '#f472b6'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Message */}
      {overallPercentage < 75 && (
        <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-300 font-semibold">
            ⚠️ Your overall attendance is below 75%. Focus on attending more classes!
          </p>
        </div>
      )}
    </div>
  );
};

export default OverallStats;
