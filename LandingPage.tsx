import React from 'react';
import type { Job } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { UsersIcon } from './icons/UsersIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import JobList from './JobList';
import Footer from './Footer';

interface LandingPageProps {
  jobs: Job[];
  onGoToAuth: () => void;
  onOpenPolicyModal: (type: 'tos' | 'privacy' | 'conduct') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ jobs, onGoToAuth, onOpenPolicyModal }) => {
  return (
    <div>
      {/* Hero Section */}
      <section className="text-center py-16 animate-fade-in-up">
        <h1 className="text-5xl md:text-6xl font-extrabold text-primary-800 leading-tight">
          Work, built on <span className="text-secondary-700">community trust.</span>
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
          VouchWork SA helps tackle unemployment by connecting South Africans to odd jobs through a unique system of peer-to-peer skill vouching. It's not just about what you can do, but who trusts you to do it.
        </p>
        <button 
          onClick={onGoToAuth}
          className="mt-10 bg-primary-700 text-white font-bold text-lg py-4 px-8 rounded-lg hover:bg-primary-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          Get Started
        </button>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
                <div className="flex-shrink-0 bg-primary-100 p-4 rounded-full mb-4">
                    <SearchIcon className="h-8 w-8 text-primary-700"/>
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Browse or Post Gigs</h3>
                <p className="text-gray-600">Community members post odd jobs. Job seekers browse local opportunities.</p>
            </div>
            <div className="flex flex-col items-center">
                <div className="flex-shrink-0 bg-primary-100 p-4 rounded-full mb-4">
                    <UsersIcon className="h-8 w-8 text-primary-700"/>
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Get Vouched For</h3>
                <p className="text-gray-600">Build your profile by getting your skills endorsed by people who know you and your work.</p>
            </div>
            <div className="flex flex-col items-center">
                <div className="flex-shrink-0 bg-primary-100 p-4 rounded-full mb-4">
                    <BriefcaseIcon className="h-8 w-8 text-primary-700"/>
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Apply & Get Hired</h3>
                <p className="text-gray-600">Apply for jobs with your trusted profile. Hirers choose from a pool of vetted, reliable candidates.</p>
            </div>
        </div>
      </section>

      {/* Latest Gigs Section */}
      <section className="py-16">
        <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">Latest Gigs</h2>
        <JobList jobs={jobs} />
        <div className="text-center mt-12">
            <button
                onClick={onGoToAuth}
                className="font-bold text-primary-700 hover:underline text-lg"
            >
                Sign Up to see all available gigs &rarr;
            </button>
        </div>
      </section>
      <Footer onOpenPolicyModal={onOpenPolicyModal} />
    </div>
  );
};

export default LandingPage;