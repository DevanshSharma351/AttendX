import { useState } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const AttendanceCard = ({ subject, onUpdate, onDelete, onEdit }) => {
  const percentage = subject.total > 0 ? ((subject.attended / subject.total) * 100).toFixed(0) : 0;
  const needsAttention = percentage < 75;

  // Calculate classes needed to reach 75% or can skip
  const calculateMessage = () => {
    if (percentage < 75) {
      const needed = Math.ceil((0.75 * subject.total - subject.attended) / 0.25);
      return { text: `Must attend ${needed} Classes`, type: 'danger' };
    } else {
      // Calculate how many classes can be skipped while maintaining 75%
      const canSkip = Math.floor((subject.attended - 0.75 * subject.total) / 0.75);
      return { text: `Can Skip ${canSkip} Classes`, type: 'success' };
    }
  };

  const message = calculateMessage();

  const handleAttendance = (type) => {
    if (type === 'present') {
      onUpdate(subject.id, subject.attended + 1, subject.total + 1);
    } else if (type === 'absent') {
      onUpdate(subject.id, subject.attended, subject.total + 1);
    } else if (type === 'removeAttended' && subject.attended > 0 && subject.total > 0) {
      onUpdate(subject.id, subject.attended - 1, subject.total - 1);
    } else if (type === 'removeMissed' && (subject.total - subject.attended) > 0) {
      onUpdate(subject.id, subject.attended, subject.total - 1);
    }
  };

  // Data for pie chart
  const data = [
    { name: 'Attended', value: subject.attended || 1 },
    { name: 'Missed', value: (subject.total - subject.attended) || 1 },
  ];

  const chartColor = needsAttention ? '#eab308' : '#22c55e'; // yellow or green

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl p-5 border border-gray-800 relative overflow-hidden">
      {/* Content Container */}
      <div className="flex items-start gap-4">
        {/* Left Side - Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white text-xl font-bold mb-3">{subject.name}</h3>
          
          <div className="space-y-1 mb-4">
            <p className="text-white text-base"><span className="font-bold">{subject.attended}</span> <span className="text-gray-400">Attended</span></p>
            <p className="text-white text-base"><span className="font-bold">{subject.total - subject.attended}</span> <span className="text-gray-400">Missed</span></p>
            <p className="text-white text-base"><span className="font-bold">{subject.total}</span> <span className="text-gray-400">Total</span></p>
          </div>

          <div className="mb-4">
            <p className={`text-sm font-medium ${message.type === 'danger' ? 'text-red-400' : 'text-gray-400'}`}>
              {message.text}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">Requirement : 75%</p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-end gap-3">
            {/* Attended Section */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-gray-400 text-xs font-medium">Attended</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAttendance('removeAttended')}
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all border border-green-500/30"
                >
                  <Minus className="w-4 h-4 text-green-500" />
                </button>
                <button
                  onClick={() => handleAttendance('present')}
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all border border-green-500/30"
                >
                  <Plus className="w-4 h-4 text-green-500" />
                </button>
              </div>
            </div>
            
            {/* Delete Button */}
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${subject.name}"? This action cannot be undone.`)) {
                  onDelete(subject.id);
                }
              }}
              className="flex-1 px-6 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-500 rounded-lg text-sm font-medium transition-all border border-red-500/30"
            >
              Delete
            </button>

            {/* Missed Section */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-gray-400 text-xs font-medium">Missed</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAttendance('removeMissed')}
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all border border-green-500/30"
                >
                  <Minus className="w-4 h-4 text-green-500" />
                </button>
                <button
                  onClick={() => handleAttendance('absent')}
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all border border-green-500/30"
                >
                  <Plus className="w-4 h-4 text-green-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Circular Progress */}
        <div className="flex-shrink-0 relative">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90">
              {/* Background circle */}
              <circle
                cx="56"
                cy="56"
                r="48"
                stroke="#1f2937"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="56"
                cy="56"
                r="48"
                stroke={chartColor}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(percentage / 100) * 301.6} 301.6`}
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 8px ${chartColor})`,
                  transition: 'stroke-dasharray 0.3s ease'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{percentage}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCard;
