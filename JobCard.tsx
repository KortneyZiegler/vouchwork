import React from 'react';
import type { Job } from '../types';
import { MapPinIcon } from './icons/MapPinIcon';
import { RandIcon } from './icons/RandIcon';
import { BoltIcon } from './icons/BoltIcon';
import { UsersIcon } from './icons/UsersIcon';
import { TagIcon } from './icons/TagIcon';

interface JobCardProps {
  job: Job;
  onSelect?: (job: Job) => void;
  isPriority?: boolean;
  isApplied?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, onSelect, isPriority, isApplied }) => {
  const applicationPercentage = (job.currentApplicants / job.maxApplicants) * 100;
  
  const isClickable = !!onSelect && !isApplied;

  const cardClasses = `bg-white rounded-lg shadow-md flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
    isApplied 
      ? 'opacity-60 cursor-default' 
      : isClickable
      ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
      : 'cursor-default'
  }`;

  return (
    <div
      className={cardClasses}
      onClick={() => isClickable && onSelect && onSelect(job)}
    >
      <div className="absolute top-4 right-0 flex flex-col items-end gap-2 z-10">
        {isApplied ? (
          <div className="flex items-center bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-l-full shadow-lg">
            Applied
          </div>
        ) : isPriority && (
          <div className="flex items-center bg-secondary-600 text-white text-xs font-bold px-3 py-1 rounded-l-full shadow-lg">
            <BoltIcon className="h-4 w-4 mr-1" />
            Priority Access
          </div>
        )}
         {job.isFairPay && !isApplied && (
            <div className="flex items-center bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-l-full shadow-lg">
                <TagIcon className="h-4 w-4 mr-1" />
                Fair Pay
            </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
        <p className="text-gray-500 font-medium mt-1 text-sm">Posted by <span className="font-semibold text-gray-600">{job.postedBy}</span></p>
        
        <div className="flex items-center text-gray-500 mt-4 text-sm">
          <MapPinIcon className="h-4 w-4 mr-2 text-primary-700" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center text-gray-500 mt-2 text-sm">
          <RandIcon className="h-4 w-4 mr-2 text-primary-700" />
          <span>{job.pay}</span>
        </div>
        <p className="text-sm text-gray-700 mt-4 h-10">{job.description.substring(0, 75)}...</p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 p-6">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <UsersIcon className="h-4 w-4 mr-2" />
            <span>Applicants</span>
          </div>
          <span className="font-semibold">{job.currentApplicants} of {job.maxApplicants}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
                className={`h-2 rounded-full ${applicationPercentage > 80 ? 'bg-red-500' : 'bg-primary-600'}`}
                style={{ width: `${applicationPercentage}%` }}
            ></div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;