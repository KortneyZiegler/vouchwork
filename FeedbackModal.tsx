import React, { useState } from 'react';
import type { Job, Applicant } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface FeedbackModalProps {
  job: Job;
  applicant: Applicant | undefined;
  onClose: () => void;
  onSubmit: (jobId: string, applicantId: string, attributes: string[], feedback: string) => void;
}

const POSITIVE_ATTRIBUTES = [
    'Quality Work',
    'Great Communication',
    'Punctual & Reliable',
    'Professional Attitude'
];

const FeedbackModal: React.FC<FeedbackModalProps> = ({ job, applicant, onClose, onSubmit }) => {
  const [selectedAttributes, setSelectedAttributes] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  if (!applicant) {
    return null;
  }

  const handleAttributeToggle = (attribute: string) => {
    setSelectedAttributes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(attribute)) {
            newSet.delete(attribute);
        } else {
            newSet.add(attribute);
        }
        return newSet;
    });
  };

  const handleSubmit = () => {
    if (selectedAttributes.size === 0 && !feedback) {
      setError('Please select at least one attribute or leave a comment.');
      return;
    }
    setError('');
    onSubmit(job.id, applicant.id, Array.from(selectedAttributes), feedback);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col">
        <header className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Leave Feedback</h2>
            <p className="text-gray-500 text-sm">For {applicant.name} on the gig: "{job.title}"</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </header>

        <main className="p-6 overflow-y-auto space-y-6">
          <div>
            <label className="block text-md font-semibold text-gray-700 mb-3">What qualities did this person demonstrate?</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {POSITIVE_ATTRIBUTES.map(attr => (
                    <button
                        key={attr}
                        onClick={() => handleAttributeToggle(attr)}
                        className={`p-3 w-full text-left rounded-lg border-2 font-semibold transition-colors ${
                            selectedAttributes.has(attr)
                                ? 'bg-primary-50 border-primary-600 text-primary-800'
                                : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {attr}
                    </button>
                ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          
          <div>
            <label htmlFor="feedback" className="block text-md font-semibold text-gray-700 mb-2">
              Leave a brief public comment <span className="text-sm font-normal text-gray-500">(optional)</span>
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder={`e.g., "${applicant.name} was fantastic! Punctual and did an amazing job."`}
            />
          </div>
        </main>
        
        <footer className="p-6 bg-gray-100 border-t border-gray-200 mt-auto rounded-b-lg flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-primary-700 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-800 transition-colors"
          >
            Submit Feedback
          </button>
        </footer>
      </div>
    </div>
  );
};

export default FeedbackModal;