import React, { useState, useCallback, useMemo } from 'react';
import type { Job, Applicant } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { RandIcon } from './icons/RandIcon';
import { generateApplicationTips } from '../services/geminiService';
import { UsersIcon } from './icons/UsersIcon';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { TagIcon } from './icons/TagIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface JobDetailModalProps {
  job: Job;
  currentUser: Applicant;
  onClose: () => void;
  onApply: () => void;
  isApplied: boolean;
  onGoToProfile: () => void;
}

type ModalView = 'details' | 'confirmation';

const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, currentUser, onClose, onApply, isApplied, onGoToProfile }) => {
  const [tips, setTips] = useState<string>('');
  const [isLoadingTips, setIsLoadingTips] = useState<boolean>(false);
  const [view, setView] = useState<ModalView>('details');

  const requiredSkills = useMemo(() => (job.skills || []).slice(0, 2), [job.skills]);

  const allRequirementsMet = useMemo(() => {
    return requiredSkills.every(skill => (currentUser.endorsedSkills[skill] || 0) >= 2);
  }, [requiredSkills, currentUser.endorsedSkills]);

  const isJobFull = job.currentApplicants >= job.maxApplicants;

  const handleApply = () => {
    onApply();
    setView('confirmation');
  };

  const handleGenerateTips = useCallback(async () => {
    setIsLoadingTips(true);
    setTips('');
    const generatedTips = await generateApplicationTips(job.title, job.description);
    setTips(generatedTips);
    setIsLoadingTips(false);
  }, [job.title, job.description]);

  const getApplyButtonState = () => {
    if (isApplied) return { text: 'Applied Successfully', disabled: true, className: 'bg-green-600' };
    if (isJobFull) return { text: 'Application Closed (Full)', disabled: true, className: 'bg-gray-400' };
    if (!allRequirementsMet) return { text: 'Apply (Endorsements Needed)', disabled: true, className: 'bg-gray-400' };
    return { text: 'Apply Now', disabled: false, className: 'bg-primary-700 hover:bg-primary-800' };
  };

  const renderDetailsView = () => {
    const applyButtonState = getApplyButtonState();
    return (
        <>
        <header className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
            <p className="text-gray-500 text-sm">Posted by <span className="font-semibold text-gray-600">{job.postedBy}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </header>

        <main className="p-6 overflow-y-auto">
          <div className="flex flex-wrap gap-x-6 gap-y-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center"><MapPinIcon className="h-4 w-4 mr-2 text-primary-700" /> {job.location}</div>
            <div className="flex items-center"><RandIcon className="h-4 w-4 mr-2 text-primary-700" /> {job.pay}</div>
            <div className="flex items-center"><UsersIcon className="h-4 w-4 mr-2 text-primary-700" /> {job.currentApplicants} of {job.maxApplicants} slots filled</div>
            {job.isFairPay && (
                <div className="flex items-center text-blue-600 font-semibold bg-blue-100 px-2 py-1 rounded-full">
                    <TagIcon className="h-4 w-4 mr-1.5" /> Fair Pay
                </div>
            )}
          </div>
          
          <h3 className="font-semibold text-gray-800 mb-2">Job Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap mb-4">{job.description}</p>
          
          <h3 className="font-semibold text-gray-800 mb-2">All Skills for this Gig</h3>
          <div className="flex flex-wrap gap-2">
            {(job.skills || []).map(skill => (
              <span key={skill} className="bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full">{skill}</span>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
             <h3 className="font-semibold text-gray-800 mb-2">AI Application Tips</h3>
             {!tips && !isLoadingTips && (
                <button onClick={handleGenerateTips} className="bg-secondary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary-700 transition-colors text-sm">Generate Tips</button>
             )}
             {isLoadingTips && <div className="text-sm text-gray-500">Generating tips...</div>}
             {tips && !isLoadingTips && (
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                  {tips.split('\n').filter(tip => tip.trim().length > 0).map((tip, index) => <li key={index}>{tip.replace(/^- /, '')}</li>)}
                </ul>
             )}
          </div>
        </main>

        <footer className="p-6 bg-gray-100 border-t border-gray-200 mt-auto rounded-b-lg">
          <h3 className="font-semibold text-lg text-gray-800">Application Requirements</h3>
          <p className="text-sm text-gray-600 mb-4">You need to have the primary skills for this job endorsed on your profile before applying.</p>

          <div className="space-y-3">
            {requiredSkills.map(skill => {
              const isEndorsed = (currentUser.endorsedSkills[skill] || 0) >= 2;
              return (
                 <div key={skill} className={`flex items-center gap-3 p-3 rounded-md text-sm font-medium ${isEndorsed ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {isEndorsed ? <CheckCircleIcon className="h-5 w-5" /> : <XCircleIcon className="h-5 w-5" />}
                    <span>{skill} - {isEndorsed ? 'Endorsed!' : 'Endorsement Needed'}</span>
                 </div>
              );
            })}
          </div>

          {!allRequirementsMet && (
            <div className="mt-4 text-center">
              <button onClick={onGoToProfile} className="text-primary-700 font-bold hover:underline">
                Go to My Profile to get endorsed
              </button>
            </div>
          )}

          <div className="mt-6">
            <button 
              onClick={handleApply}
              disabled={applyButtonState.disabled}
              className={`w-full text-white py-3 px-4 rounded-lg disabled:cursor-not-allowed transition-colors ${applyButtonState.className}`}
            >
              {applyButtonState.text}
            </button>
          </div>
        </footer>
        </>
    );
  };

  const renderConfirmationView = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12">
            <div className="bg-green-100 p-4 rounded-full mb-6">
                <ThumbsUpIcon className="h-12 w-12 text-green-600"/>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Application Sent!</h2>
            <p className="text-gray-600 max-w-sm mb-8">
                Your profile, including your endorsed skills, has been sent to <span className="font-semibold">{job.postedBy}</span>. They will be in touch if you are a good fit. Good luck!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
                <button 
                    onClick={onClose}
                    className="w-full bg-primary-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-800 transition-colors"
                >
                    Browse More Gigs
                </button>
                <button 
                    onClick={onGoToProfile}
                    className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    View My Profile
                </button>
            </div>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {view === 'details' ? renderDetailsView() : renderConfirmationView()}
      </div>
    </div>
  );
};

export default JobDetailModal;
