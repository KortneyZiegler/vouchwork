import React from 'react';
import type { Applicant } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface ApplicantProfilePageProps {
  applicant: Applicant;
  vouchedSkills: string[];
  onBack: () => void;
  onHire: (applicantId: string) => void;
}

const ApplicantProfilePage: React.FC<ApplicantProfilePageProps> = ({ applicant, vouchedSkills, onBack, onHire }) => {
  const isFirstTimer = applicant.jobHistory.length === 0;

  const communityReputation = React.useMemo(() => {
    const counts: Record<string, number> = {};
    (applicant.jobHistory || []).forEach(job => {
        job.attributes.forEach(attr => {
            counts[attr] = (counts[attr] || 0) + 1;
        });
    });
    return Object.entries(counts).sort((a,b) => b[1] - a[1]);
  }, [applicant.jobHistory]);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-primary-700 font-semibold mb-6 hover:underline">
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Applicants
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <header className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <img src={applicant.profilePictureUrl} alt={applicant.name} className="h-32 w-32 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-grow text-center md:text-left">
                        <h1 className="text-4xl font-extrabold text-primary-800">{applicant.name}</h1>
                        <p className="mt-3 text-lg text-gray-600 max-w-2xl">{applicant.bio}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center md:justify-start">
                            {applicant.isVerifiedSAId && (
                                <div className="flex items-center gap-1.5 text-sm text-blue-700 font-semibold">
                                    <ShieldCheckIcon className="h-5 w-5" />
                                    Verified SA Citizen
                                </div>
                            )}
                            {isFirstTimer && (
                                <div className="flex items-center gap-1.5 text-sm text-secondary-800 font-semibold">
                                    <SparklesIcon className="h-5 w-5" />
                                    First Gig Ready
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            
            <main className="p-8 bg-gray-50 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-8">
                 <section>
                    <h3 className="font-semibold text-xl text-gray-800 mb-4">Vouched-For Skills for This Gig</h3>
                    <div className="flex flex-wrap gap-3">
                    {vouchedSkills.map(skill => (
                        <div key={skill} className="flex items-center gap-2 bg-green-100 text-green-800 font-medium px-4 py-2 rounded-full">
                        <CheckBadgeIcon className="h-5 w-5"/>
                        <span>{skill}</span>
                        </div>
                    ))}
                    </div>
                </section>

                <section>
                    <h3 className="font-semibold text-xl text-gray-800 mb-4">Community Reputation</h3>
                    {communityReputation.length > 0 ? (
                        <div className="space-y-3">
                            {communityReputation.map(([attribute, count]) => (
                                <div key={attribute} className="flex items-center justify-between bg-white p-3 rounded-md border">
                                    <span className="font-semibold text-gray-700">{attribute}</span>
                                    <span className="font-bold text-primary-700 bg-primary-100 px-2.5 py-1 rounded-full text-sm">{count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-white rounded-lg border border-dashed">
                            <p className="text-gray-500 font-semibold">This is their first gig on VouchWork SA!</p>
                            <p className="text-sm text-gray-400 mt-1">Their vouched-for skills show they're ready for the job.</p>
                        </div>
                    )}
                </section>
            </main>

            <footer className="p-6 bg-gray-100 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-end items-center">
                {isFirstTimer && (
                    <div className="text-xs text-green-700 bg-green-100 p-2 rounded-md mr-auto text-center sm:text-left">
                        <p><span className="font-bold">Community Growth Bonus:</span> By hiring a 'First Gig Ready' candidate, you help our community grow.</p>
                    </div>
                )}
                <button className="bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-50 w-full sm:w-auto">
                    Contact Candidate
                </button>
                <button 
                onClick={() => onHire(applicant.id)}
                className="bg-primary-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-800 w-full sm:w-auto"
                >
                    Hire {applicant.name.split(' ')[0]}
                </button>
            </footer>
        </div>
    </div>
  );
};

export default ApplicantProfilePage;
