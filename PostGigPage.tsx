
import React, { useState, useEffect } from 'react';
import type { Job } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { PRE_DEFINED_SKILLS } from '../constants';
import { generateFairPaySuggestion } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';

// FIX: Added 'createdAt' to the Omit type. The parent component handles setting the 'createdAt' field with a server timestamp, so it should not be part of the data passed from this form.
type NewJobData = Omit<Job, 'id' | 'postedBy' | 'posterId' | 'currentApplicants' | 'applicants' | 'hiredApplicantId' | 'status' | 'createdAt'>;

interface PostGigPageProps {
  onPostJob: (jobData: NewJobData) => void;
  onBack: () => void;
}

const PostGigPage: React.FC<PostGigPageProps> = ({ onPostJob, onBack }) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [pay, setPay] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [maxApplicants, setMaxApplicants] = useState(5);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [paySuggestion, setPaySuggestion] = useState('');
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  
  const availableSkills = PRE_DEFINED_SKILLS.filter(s => !skills.includes(s)).sort();

  useEffect(() => {
    if (availableSkills.length > 0 && !currentSkill) {
        setCurrentSkill(availableSkills[0]);
    } else if (availableSkills.length === 0) {
        setCurrentSkill('');
    }
  }, [skills.length, availableSkills, currentSkill]);

  const handleAddSkill = () => {
    if (currentSkill && !skills.includes(currentSkill)) {
      setSkills([...skills, currentSkill]);
      const nextAvailableSkill = availableSkills.find(s => s !== currentSkill);
      setCurrentSkill(nextAvailableSkill || '');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };
  
  const handleGenerateSuggestion = async () => {
    if (!title || skills.length === 0 || !location) {
      alert('Please fill in Title, Location, and add at least one Skill to get a pay suggestion.');
      return;
    }
    setIsLoadingSuggestion(true);
    const suggestion = await generateFairPaySuggestion(title, skills, location);
    setPaySuggestion(suggestion);
    setIsLoadingSuggestion(false);
  };

  const resetForm = () => {
    setTitle('');
    setLocation('');
    setPay('');
    setDescription('');
    setSkills([]);
    setCurrentSkill(PRE_DEFINED_SKILLS.filter(s => !([] as string[]).includes(s)).sort()[0]);
    setMaxApplicants(5);
    setError('');
    setIsSubmitted(false);
    setPaySuggestion('');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !pay || skills.length === 0 || !description) {
        setError('Please fill out all fields and add at least one skill.');
        return;
    }
    setError('');

    // Logic to check if pay is fair based on suggestion
    let isFairPay = false;
    if (paySuggestion) {
        const payNumber = parseFloat(pay.match(/(\d+)/)?.[0] || '0');
        const suggestionLow = parseFloat(paySuggestion.match(/(\d+)/)?.[0] || '0');
        if (payNumber >= suggestionLow) {
            isFairPay = true;
        }
    }

    const newJobData: NewJobData = {
      title,
      location,
      pay: `R${pay}`,
      description,
      skills,
      maxApplicants,
      isFairPay,
    };
    onPostJob(newJobData);
    setIsSubmitted(true);
  };
  
  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 animate-fade-in">
        <div className="bg-green-100 p-4 rounded-full mb-6">
          <CheckCircleIcon className="h-16 w-16 text-green-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Your Gig is Live!</h2>
        <p className="text-gray-600 max-w-sm mb-8">
          Vetted and vouched-for candidates can now apply. You will be notified when you receive applications.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
          <button
            onClick={onBack}
            className="w-full bg-primary-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-800 transition-colors"
          >
            View My Posted Gig
          </button>
          <button
            onClick={resetForm}
            className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Post Another Gig
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-primary-700 font-semibold mb-6 hover:underline">
        <ArrowLeftIcon className="h-5 w-5" />
        Back to Gigs
      </button>

      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-extrabold text-primary-800 mb-2">Post a New Gig</h1>
        <p className="text-gray-600 mb-8">Fill in the details below to find trusted help from your community.</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6" role="alert">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Gig Title</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="e.g., Part-Time Gardener" />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="e.g., Sandton, Johannesburg" />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
            <p className="text-xs text-gray-500 mb-2">The first two skills are primary and will require vouches from applicants.</p>
            <div className="flex gap-2">
               <select 
                value={currentSkill} 
                onChange={(e) => setCurrentSkill(e.target.value)} 
                className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"
                disabled={availableSkills.length === 0}
              >
                {availableSkills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              <button 
                type="button" 
                onClick={handleAddSkill} 
                className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!currentSkill}
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 min-h-[2.5rem]">
              {skills.map(skill => (
                <span key={skill} className="flex items-center gap-2 bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full animate-fade-in">
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-primary-700 hover:text-primary-900"><XMarkIcon className="h-4 w-4"/></button>
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <label htmlFor="pay" className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
            <div className="flex flex-col sm:flex-row gap-2 items-start">
              <div className="relative rounded-md shadow-sm flex-grow w-full sm:w-auto">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm">R</span>
                  </div>
                  <input 
                      type="text" 
                      id="pay" 
                      value={pay} 
                      onChange={(e) => setPay(e.target.value)} 
                      className="block w-full rounded-md border-gray-300 pl-7 focus:border-primary-500 focus:ring-primary-500" 
                      placeholder="200 / hour or 5000 / project" 
                  />
              </div>
              <button type="button" onClick={handleGenerateSuggestion} disabled={isLoadingSuggestion || skills.length === 0} className="flex items-center justify-center gap-2 bg-secondary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary-700 transition-colors w-full sm:w-auto disabled:bg-gray-400 disabled:cursor-not-allowed">
                <SparklesIcon className="h-5 w-5" />
                {isLoadingSuggestion ? 'Analyzing...' : 'AI Fair Pay Guide'}
              </button>
            </div>
             {paySuggestion && (
              <div className="mt-3 text-sm text-gray-700 bg-secondary-50 border border-secondary-200 p-3 rounded-md">
                <strong>Suggestion:</strong> {paySuggestion}. Jobs that meet this guideline earn a "Fair Pay" badge to attract more applicants.
              </div>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="Describe the work required..."></textarea>
          </div>

          <div className="mb-8">
            <label htmlFor="maxApplicants" className="block text-sm font-medium text-gray-700 mb-1">Limit Number of Applicants</label>
            <p className="text-xs text-gray-500 mb-2">To avoid being overwhelmed, choose the number of applications you want to receive.</p>
            <select id="maxApplicants" value={maxApplicants} onChange={(e) => setMaxApplicants(Number(e.target.value))} className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
              <option>3</option>
              <option>5</option>
              <option>8</option>
              <option>10</option>
              <option>15</option>
            </select>
          </div>

          <div className="border-t border-gray-200 pt-6 flex justify-end">
            <button type="submit" className="bg-primary-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-800 transition-colors">
              Post Gig
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostGigPage;
