import { useState, useEffect } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import AttendanceCard from './components/AttendanceCard';
import AddSubjectModal from './components/AddSubjectModal';

function App() {
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSubjects = localStorage.getItem('attendanceData');
    if (savedSubjects) {
      try {
        const parsed = JSON.parse(savedSubjects);
        setSubjects(parsed);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save data to localStorage whenever subjects change (after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('attendanceData', JSON.stringify(subjects));
    }
  }, [subjects, isLoaded]);

  const addSubject = (subjectData) => {
    if (editingSubject) {
      setSubjects(subjects.map(s => 
        s.id === editingSubject.id ? { ...subjectData, id: s.id } : s
      ));
      setEditingSubject(null);
    } else {
      setSubjects([...subjects, { ...subjectData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const deleteSubject = (id) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const updateAttendance = (id, attended, total) => {
    setSubjects(subjects.map(s => 
      s.id === id ? { ...s, attended, total } : s
    ));
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const getCurrentDate = () => {
    const now = new Date();
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return now.toLocaleDateString('en-US', options);
  };

  const getLastUpdated = () => {
    const now = new Date();
    const options = { day: 'numeric', month: 'long' };
    const date = now.toLocaleDateString('en-US', options);
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `Last Updated on ${date} at ${time}`;
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-6 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-gray-500 text-xs mb-1">{getCurrentDate()}</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">
                Your Attendance
              </h1>
              <p className="text-gray-600 text-xs">{getLastUpdated()}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingSubject(null);
                  setIsModalOpen(true);
                }}
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-all"
              >
                <Plus className="w-5 h-5 text-green-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Subjects List */}
        {subjects.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-900 rounded-3xl p-12 inline-block border border-gray-800">
              <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No subjects added yet</p>
              <p className="text-gray-600 text-sm">Tap the + button to add your first subject</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {subjects.map(subject => (
              <AttendanceCard
                key={subject.id}
                subject={subject}
                onUpdate={updateAttendance}
                onDelete={deleteSubject}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AddSubjectModal
          onClose={() => {
            setIsModalOpen(false);
            setEditingSubject(null);
          }}
          onSubmit={addSubject}
          editingSubject={editingSubject}
        />
      )}

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default App;
