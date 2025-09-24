import React from 'react';
import { XMarkIcon } from './icons/XMarkIcon';

interface PolicyModalProps {
  title: string;
  content: React.ReactNode;
  onClose: () => void;
}

const PolicyModal: React.FC<PolicyModalProps> = ({ title, content, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <header className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </header>
        <main className="p-8 overflow-y-auto">
          <div className="prose max-w-none text-gray-700">
            {content}
          </div>
        </main>
        <footer className="p-4 bg-gray-50 border-t mt-auto">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-primary-700 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-800 transition-colors"
            >
              Close
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PolicyModal;
