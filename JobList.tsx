
import React from 'react';
import type { Job } from '../types';
import JobCard from './JobCard';

interface JobListProps {
  jobs: Job[];
  onSelectJob?: (job: Job) => void;
  endorsedSkills?: string[];
  appliedJobIds?: string[];
}

const JobList: React.FC<JobListProps> = ({ jobs, onSelectJob, endorsedSkills = [], appliedJobIds = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {jobs.map(job => {
        const requiredSkills = (job.skills || []).slice(0, 2);
        const isPriority = requiredSkills.length > 0 && requiredSkills.every(skill => endorsedSkills.includes(skill));
        const isApplied = appliedJobIds.includes(job.id);
        return <JobCard key={job.id} job={job} onSelect={onSelectJob} isPriority={isPriority} isApplied={isApplied} />;
      })}
    </div>
  );
};

export default JobList;
