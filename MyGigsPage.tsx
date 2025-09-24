import React, { useState, useMemo } from 'react';
import type { Job, Applicant } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { UsersIcon } from './icons/UsersIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface MyGigsPageProps {
  allJobs: Job[];
  allApplicants: Applicant[];
  currentUserId: string;
  onBack: () => void;
  onViewApplicant: (data: { applicant: Applicant; vouchedSkills: string[]; jobId: string }) => void;
  onRateJob: (job: Job) => void;
}

const MyGigsPage: React.FC<MyGigsPageProps> = ({ allJobs, allApplicants, currentUserId, onBack, onViewApplicant, onRateJob }) => {
  const myGigs = useMemo(() => {
    return allJobs
      .filter(job => job.posterId === currentUserId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [allJobs, currentUserId]);
  
  const [selectedGig, setSelectedGig] = useState<Job | null>(null);

  const applicantsForSelectedGig = useMemo(() => {
    if (!selectedGig) return [];
    return selectedGig.applicants.map(app => {
      const applicantDetails = allApplicants.find(a => a.id === app.applicantId);
      return { ...applicantDetails, vouchedSkills: app.vouchedSkills };
    }).filter(a => a.id && (!selectedGig.hiredApplicantId || a.id === selectedGig.hiredApplicantId)); // Show only hired applicant if one exists
  }, [selectedGig, allApplicants]);

  const handleSelectGig = (job: Job) => {
    setSelectedGig(job);
  };
  
  const renderGigStatus = (job: Job) => {
    switch (job.status) {
        case 'completed':
            return <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-green-600 px-2 py-1 rounded-full"><CheckCircleIcon className="h-4 w-4" />Completed & Rated</span>
        case 'filled':
             return <button onClick={(e) => { e.stopPropagation(); onRateJob(job); }} className="bg-secondary-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-secondary-700 transition-colors text-sm">Mark as Complete & Rate</button>
        default:
            return (
                <div className={`flex items-center gap-2 text-lg font-bold ${job.applicants.length > 0 ? 'text-primary-700' : 'text-gray-500'}`}>
                   <UsersIcon className="h-6 w-6" />
                   <span>{job.applicants.length}</span>
                   <span className="text-sm font-normal text-gray-600 hidden sm:inline">Applicant(s)</span>
                </div>
            );
    }
  }
  
  if (selectedGig) {
    return (
      <div className="animate-fade-in max-w-4xl mx-auto">
        <button onClick={() => setSelectedGig(null)} className="flex items-center gap-2 text-primary-700 font-semibold mb-6 hover:underline">
            <ArrowLeftIcon className="h-5 w-5" />
            Back to My Gigs
        </button>
        <div className="bg-white p-8 rounded-lg shadow-lg">
           <h2 className="text-3xl font-extrabold text-primary-800 mb-1">{selectedGig.title}</h2>
           <p className="text-gray-600 mb-6">Reviewing applicants for this gig.</p>

           {applicantsForSelectedGig.length > 0 ? (
            <div className="space-y-4">
              {applicantsForSelectedGig.map(app => {
                if (!app.id) return null;
                const applicant = app as Applicant & { vouchedSkills: string[] };
                const isFirstTimer = applicant.jobHistory.length === 0;

                return (
                  <div key={applicant.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <img src={applicant.profilePictureUrl} alt={applicant.name} className="h-16 w-16 rounded-full object-cover" />
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-gray-900">{applicant.name}</h3>
                                {isFirstTimer && !selectedGig.hiredApplicantId && (
                                    <span className="flex items-center gap-1 bg-secondary-100 text-secondary-800 text-xs font-bold px-2 py-1 rounded-full">
                                        <SparklesIcon className="h-4 w-4" />
                                        First Gig Ready
                                    </span>
                                )}
                                {selectedGig.hiredApplicantId === applicant.id && (
                                     <span className="text-xs font-bold text-white bg-primary-700 px-2 py-1 rounded-full">Hired</span>
                                )}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                <span className="font-semibold">Vouched for:</span> {applicant.vouchedSkills.join(', ')}
                            </div>
                        </div>
                    </div>
                    {!selectedGig.hiredApplicantId && (
                        <button 
                            onClick={() => onViewApplicant({ applicant, vouchedSkills: applicant.vouchedSkills, jobId: selectedGig.id })}
                            className="bg-primary-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-800 transition-colors w-full sm:w-auto"
                        >
                            View Profile
                        </button>
                    )}
                  </div>
                )
              })}
            </div>
           ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600 font-semibold">No applicants yet.</p>
                <p className="text-sm text-gray-500 mt-1">Check back soon to see who has applied.</p>
            </div>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-primary-700 font-semibold mb-6 hover:underline">
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Browse
        </button>

        <header className="bg-white p-8 rounded-lg shadow-md mb-8 text-center">
            <BriefcaseIcon className="h-16 w-16 mx-auto text-primary-600 mb-4" />
            <h1 className="text-4xl font-extrabold text-primary-800">
                My Posted Gigs
            </h1>
            <p className="mt-2 text-lg text-gray-600">
                Here are the jobs you've posted. Select one to review the applicants.
            </p>
        </header>

        {myGigs.length > 0 ? (
            <div className="space-y-4">
                {myGigs.map(job => (
                    <div key={job.id} onClick={() => handleSelectGig(job)} className={`bg-white p-5 rounded-lg shadow-sm border flex justify-between items-center transition-all duration-200 ${job.status !== 'completed' ? 'cursor-pointer hover:shadow-md hover:border-primary-300' : 'opacity-70 cursor-default'}`}>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                            <p className="text-sm text-gray-500">{job.location}</p>
                        </div>
                        <div className="flex items-center">
                           {renderGigStatus(job)}
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-gray-600 font-semibold">You haven't posted any gigs yet.</p>
                <button onClick={onBack} className="text-primary-700 font-bold mt-2 hover:underline">
                    Click "Post a Gig" to get started!
                </button>
            </div>
        )}
    </div>
  );
};

export default MyGigsPage;