export interface Applicant {
  id: string;
  name: string;
  profilePictureUrl: string;
  bio?: string;
  jobHistory: {
    jobTitle: string;
    attributes: string[];
    feedback: string;
  }[];
  skills: string[];
  endorsedSkills: Record<string, number>; // e.g. { 'Gardening': 2, 'Painting': 1 }
  isVerifiedSAId: boolean;
}


export interface Job {
  id: string;
  title: string;
  postedBy: string;
  posterId: string;
  location: string;
  pay: string;
  description: string;
  skills: string[];
  maxApplicants: number;
  currentApplicants: number;
  applicants: {
    applicantId: string;
    vouchedSkills: string[]; // This remains for poster's context
  }[];
  hiredApplicantId?: string | null;
  status: 'open' | 'filled' | 'completed';
  isFairPay?: boolean;
  createdAt: string | null;
}