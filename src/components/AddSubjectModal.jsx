import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AddSubjectModal = ({ onClose, onSubmit, editingSubject }) => {
  const [formData, setFormData] = useState({
    name: '',
    attended: 0,
    total: 0,
  });

  useEffect(() => {
    if (editingSubject) {
      setFormData(editingSubject);
    }
  }, [editingSubject]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'attended' || name === 'total' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl p-8 max-w-md w-full relative animate-scale-in border border-gray-800 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-400 hover:text-white" />
        </button>

        <h2 className="text-3xl font-bold text-white mb-2">
          {editingSubject ? 'Edit Subject' : 'Add New Subject'}
        </h2>
        <p className="text-gray-500 text-sm mb-6">Track your attendance for this subject</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Basic Electronics"
              className="w-full px-4 py-3.5 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-base"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Classes Attended
              </label>
              <input
                type="number"
                name="attended"
                value={formData.attended}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3.5 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-base text-center font-semibold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Total Classes
              </label>
              <input
                type="number"
                name="total"
                value={formData.total}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3.5 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-base text-center font-semibold"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all duration-300 font-bold text-base border border-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-300 font-bold text-base shadow-lg shadow-green-600/20"
            >
              {editingSubject ? 'Update' : 'Add'}
            </button>
          </div>
        </form>

        <style>{`
          @keyframes scale-in {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-scale-in {
            animation: scale-in 0.2s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AddSubjectModal;
