import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Job, Applicant } from './types';
import Header from './components/Header';
import JobList from './components/JobList';
import JobDetailModal from './components/JobDetailModal';
import ProfilePage from './components/ProfilePage';
import PostGigPage from './components/PostGigPage';
import MyGigsPage from './components/MyGigsPage';
import ApplicantProfilePage from './components/ApplicantProfilePage';
import FeedbackModal from './components/FeedbackModal';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';
import VouchPage from './components/VouchPage';
import PolicyModal from './components/PolicyModal';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, doc, updateDoc, arrayUnion, increment, addDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { queryToPlain } from './services/firestore-plain';

type View = 'jobList' | 'profile' | 'postGig' | 'myGigs' | 'applicantProfile';
type AuthView = 'landing' | 'auth' | 'vouch';

const App: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [currentUser, setCurrentUser] = useState<Applicant | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicantToView, setApplicantToView] = useState<{ applicant: Applicant; vouchedSkills: string[]; jobId: string } | null>(null);
  const [jobToRate, setJobToRate] = useState<Job | null>(null);
  const [view, setView] = useState<View>('jobList');
  const [authView, setAuthView] = useState<AuthView>('landing');
  const [vouchPageData, setVouchPageData] = useState<{ requesterName: string; skills: string[]; applicantId: string } | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyModalContent, setPolicyModalContent] = useState<{title: string, content: React.ReactNode} | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setIsAuthenticated(!!user);
        if (!user) {
            setCurrentUser(null);
        }
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const jobsQuery = query(collection(db, 'jobs'));
    const unsubscribeJobs = onSnapshot(
      jobsQuery,
      (snap) => {
        const rows = queryToPlain<Job>(snap);
        setJobs(rows);
        console.log("✅ Jobs fetched:", rows.length);
      },
      (err: any) => {
        console.error("❌ Jobs query error:", err.code, err.message);
        setGlobalError("Could not connect to the job database. Please check your internet connection.");
      }
    );

    const applicantsQuery = query(collection(db, 'applicants'));
    const unsubscribeApplicants = onSnapshot(
      applicantsQuery,
      (snap) => {
        const rows = queryToPlain<Applicant>(snap);
        setApplicants(rows);
        console.log("✅ Applicants fetched:", rows.length);
      },
      (err: any) => {
        console.error("❌ Applicants query error:", err.code, err.message);
      }
    );

    return () => {
        unsubscribeJobs();
        unsubscribeApplicants();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && auth.currentUser) {
        const userProfile = applicants.find(app => app.id === auth.currentUser!.uid);
        setCurrentUser(userProfile || null);
    } else {
        setCurrentUser(null);
    }
  }, [isAuthenticated, applicants]);
  
  const endorsedSkills = useMemo(() => {
    if (!currentUser) return [];
    const skillsToEndorse = currentUser.endorsedSkills || {};
    return Object.keys(skillsToEndorse)
      .filter(skill => skillsToEndorse[skill] >= 2);
  }, [currentUser]);

  const handleVerifyCurrentUser = useCallback(async () => {
    if (!currentUser) return;
    try {
        const userRef = doc(db, "applicants", currentUser.id);
        await updateDoc(userRef, { isVerifiedSAId: true });
        console.log("✅ Verified user:", currentUser.id);
    } catch (err: any) {
        console.error("❌ Firestore update error (handleVerifyCurrentUser):", err.code, err.message);
    }
  }, [currentUser]);
  
  const handleConfirmVouch = useCallback(async (applicantId: string, skills: string[]) => {
    try {
        const applicantRef = doc(db, 'applicants', applicantId);
        const applicantToUpdate = applicants.find(a => a.id === applicantId);
        if (applicantToUpdate) {
            const newEndorsedSkills = { ...applicantToUpdate.endorsedSkills };
            skills.forEach(skill => {
                const currentVouches = newEndorsedSkills[skill] || 0;
                if (currentVouches < 2) {
                    newEndorsedSkills[skill] = currentVouches + 1;
                }
            });
            await updateDoc(applicantRef, { endorsedSkills: newEndorsedSkills });
            console.log("✅ Confirmed vouch for applicant:", applicantId);
        }
        setVouchPageData(null);
        setAuthView('landing');
    } catch(err: any) {
        console.error("❌ Firestore update error (handleConfirmVouch):", err.code, err.message);
    }
  }, [applicants]);

  const handleShareVouchRequest = useCallback((data: { requesterName: string; skills: string[]; applicantId: string }) => {
    setVouchPageData(data);
    if (isAuthenticated) {
        alert(`Vouch link shared! For demo, you'll now see the vouch page. Link: https://vouchwork.sa/vouch/demo123`);
    }
    setAuthView('vouch');
  }, [isAuthenticated]);

  const handleAddSkill = useCallback(async (skill: string) => {
    if (!currentUser) return;
    try {
        const userRef = doc(db, "applicants", currentUser.id);
        const newSkills = currentUser.skills ? [...currentUser.skills] : [];
        if (!newSkills.includes(skill)) {
            newSkills.push(skill);
            const newEndorsedSkills = { ...currentUser.endorsedSkills };
            if (!newEndorsedSkills.hasOwnProperty(skill)) {
                newEndorsedSkills[skill] = 0;
            }
            await updateDoc(userRef, { skills: newSkills, endorsedSkills: newEndorsedSkills });
            console.log("✅ Added skill for user:", currentUser.id);
        }
    } catch(err: any) {
        console.error("❌ Firestore update error (handleAddSkill):", err.code, err.message);
    }
  }, [currentUser]);

  const handleUpdateProfile = useCallback(async (updatedData: Partial<Applicant>) => {
    if (!currentUser) return;
    try {
        const userRef = doc(db, "applicants", currentUser.id);
        await updateDoc(userRef, updatedData);
        console.log("✅ Updated profile for user:", currentUser.id);
    } catch(err: any) {
        console.error("❌ Firestore update error (handleUpdateProfile):", err.code, err.message);
    }
  }, [currentUser]);

  const sortedJobs = useMemo(() => {
    const openJobs = jobs.filter(job => job.status === 'open');
    return openJobs.sort((a, b) => {
      const aRequired = (a.skills || []).slice(0, 2);
      const bRequired = (b.skills || []).slice(0, 2);
      const aIsPriority = aRequired.length > 0 && aRequired.every(skill => endorsedSkills.includes(skill));
      const bIsPriority = bRequired.length > 0 && bRequired.every(skill => endorsedSkills.includes(skill));
      if (aIsPriority && !bIsPriority) return -1;
      if (!aIsPriority && bIsPriority) return 1;
      // Sort by creation date, newest first
      // Ensure createdAt is not null before creating a Date object
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [jobs, endorsedSkills]);
  
  const handleSelectJob = (job: Job) => setSelectedJob(job);
  const handleCloseJobDetailModal = () => setSelectedJob(null);

  const handleApplyToJob = async (jobId: string) => {
    if (!currentUser) return;
    const job = jobs.find(j => j.id === jobId);
    if (!job || job.applicants.some(a => a.applicantId === currentUser.id)) return;
    
    try {
        const jobRef = doc(db, 'jobs', jobId);
        const vouchedSkillsForApplication = (job.skills || []).slice(0, 2);
        
        await updateDoc(jobRef, {
          currentApplicants: increment(1),
          applicants: arrayUnion({ applicantId: currentUser.id, vouchedSkills: vouchedSkillsForApplication })
        });
        console.log("✅ Applied to job:", jobId, "by user:", currentUser.id);
    } catch(err: any) {
        console.error("❌ Firestore update error (handleApplyToJob):", err.code, err.message);
    }
  };

  const handleGoToProfile = () => {
    setSelectedJob(null);
    setView('profile');
  };

  type NewJobData = Omit<Job, 'id' | 'postedBy' | 'posterId' | 'currentApplicants' | 'applicants' | 'hiredApplicantId' | 'status' | 'createdAt'>;

  const handlePostJob = async (newJobData: NewJobData) => {
    if (!currentUser) return;
    setGlobalError(null);
    try {
        await addDoc(collection(db, 'jobs'), {
            ...newJobData,
            postedBy: currentUser.name,
            posterId: currentUser.id,
            currentApplicants: 0,
            applicants: [],
            status: 'open',
            createdAt: serverTimestamp(),
        });
        console.log("✅ Posted new job by user:", currentUser.id);
        setView('myGigs');
    } catch(err: any) {
        console.error("❌ Firestore add error (handlePostJob):", err.code, err.message);
        setGlobalError("Failed to post the gig. Please check your internet connection and try again.");
    }
  };

  const handleViewApplicant = (data: { applicant: Applicant; vouchedSkills: string[], jobId: string }) => {
    setApplicantToView(data);
    setView('applicantProfile');
  };

  const handleHireApplicant = async (applicantId: string) => {
    if (!applicantToView) return;
    try {
        const { jobId } = applicantToView;
        const jobRef = doc(db, 'jobs', jobId);
        await updateDoc(jobRef, { hiredApplicantId: applicantId, status: 'filled' });
        console.log("✅ Hired applicant:", applicantId, "for job:", jobId);
        setApplicantToView(null);
        setView('myGigs');
    } catch(err: any) {
        console.error("❌ Firestore update error (handleHireApplicant):", err.code, err.message);
    }
  };

  const handleRateJob = (job: Job) => setJobToRate(job);
  const handleCloseFeedbackModal = () => setJobToRate(null);

  const handleSubmitFeedback = async (jobId: string, applicantId: string, attributes: string[], feedback: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    try {
        const batch = writeBatch(db);
        const jobRef = doc(db, 'jobs', jobId);
        batch.update(jobRef, { status: 'completed' });

        const applicantRef = doc(db, 'applicants', applicantId);
        batch.update(applicantRef, { 
          jobHistory: arrayUnion({ jobTitle: job.title, attributes, feedback })
        });

        await batch.commit();
        console.log("✅ Submitted feedback for job:", jobId);
        setJobToRate(null);
    } catch(err: any) {
        console.error("❌ Firestore batch write error (handleSubmitFeedback):", err.code, err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setAuthView('landing');
    setView('jobList');
  };

  const handleOpenPolicyModal = (type: 'tos' | 'privacy' | 'conduct') => {
      const policies = {
          tos: { title: 'Our Shared Commitment (TOS)', content: <p>Placeholder for Terms of Service content. This document will outline the mutual responsibilities between VouchWork SA and its users, ensuring a fair and respectful platform for everyone.</p> },
          privacy: { title: 'Privacy Policy', content: <p>Placeholder for Privacy Policy content. This document will detail our commitment to user privacy, explaining what data we collect, why we collect it, and our promise to never sell user data.</p> },
          conduct: { title: 'Community Code of Conduct', content: <p>Placeholder for Code of Conduct content. This document will define VouchWork SA as a safe and inclusive space, with a zero-tolerance policy for harassment, discrimination, and exploitation.</p> },
      };
      setPolicyModalContent(policies[type]);
      setIsPolicyModalOpen(true);
  };

  const handleClosePolicyModal = () => {
      setIsPolicyModalOpen(false);
      setPolicyModalContent(null);
  };

  const appliedJobIds = useMemo(() => {
    if (!currentUser) return [];
    return jobs.filter(j => j.applicants.some(a => a.applicantId === currentUser.id)).map(j => j.id);
  }, [jobs, currentUser]);

  const hiredApplicantForFeedback = useMemo(() => {
    if (!jobToRate || !jobToRate.hiredApplicantId) return undefined;
    return applicants.find(a => a.id === jobToRate!.hiredApplicantId);
  }, [jobToRate, applicants]);

  if (isLoading) {
    return <div className="bg-gray-50 min-h-screen flex items-center justify-center"><div className="text-xl font-semibold text-gray-700">Loading VouchWork SA...</div></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header isAuthenticated={isAuthenticated} currentView={view} setView={setView} onLogout={handleLogout} setAuthView={setAuthView} />
      {globalError && (
          <div className="bg-red-100 border-b-2 border-red-500 text-red-800 p-4 text-center font-semibold" role="alert">
              {globalError}
          </div>
      )}

      <main className="container mx-auto px-4 md:px-8 pt-24 pb-12">
        {!isAuthenticated ? (
          (() => {
            switch (authView) {
              case 'auth':
                return <AuthPage onSwitchToLanding={() => setAuthView('landing')} onOpenPolicyModal={handleOpenPolicyModal} />;
              case 'vouch':
                if (vouchPageData) {
                  return <VouchPage data={vouchPageData} onConfirmVouch={() => handleConfirmVouch(vouchPageData.applicantId, vouchPageData.skills)} />;
                }
                // Fallback to landing if vouch data is missing
                return <LandingPage jobs={sortedJobs.slice(0, 4)} onGoToAuth={() => setAuthView('auth')} onOpenPolicyModal={handleOpenPolicyModal} />;
              case 'landing':
              default:
                return <LandingPage jobs={sortedJobs.slice(0, 4)} onGoToAuth={() => setAuthView('auth')} onOpenPolicyModal={handleOpenPolicyModal} />;
            }
          })()
        ) : (
          (() => {
            // These pages require the user's profile data to be loaded.
            const pagesRequiringProfile: View[] = ['profile', 'myGigs', 'postGig'];
            if (pagesRequiringProfile.includes(view) && !currentUser) {
              return (
                <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 animate-fade-in h-96">
                    <div className="text-2xl font-bold text-gray-700">Loading Your Data...</div>
                    <p className="text-gray-500 mt-2">Just a moment while we fetch your details.</p>
                </div>
              );
            }
        
            switch (view) {
              case 'profile':
                return (
                  <ProfilePage 
                    user={currentUser!} 
                    onBack={() => setView('jobList')} 
                    onVerify={handleVerifyCurrentUser}
                    onUpdateProfile={handleUpdateProfile}
                    onShareVouchRequest={(skills) => handleShareVouchRequest({
                        requesterName: currentUser!.name,
                        skills,
                        applicantId: currentUser!.id
                    })}
                    onAddSkill={handleAddSkill}
                  />
                );
              case 'postGig':
                return <PostGigPage onPostJob={handlePostJob} onBack={() => setView('jobList')} />;
              case 'myGigs':
                return (
                  <MyGigsPage 
                      allJobs={jobs}
                      allApplicants={applicants}
                      currentUserId={currentUser!.id}
                      onBack={() => setView('jobList')}
                      onViewApplicant={handleViewApplicant}
                      onRateJob={handleRateJob}
                  />
                );
              case 'applicantProfile':
                if (applicantToView) {
                  return (
                    <ApplicantProfilePage 
                        applicant={applicantToView.applicant}
                        vouchedSkills={applicantToView.vouchedSkills}
                        onBack={() => setView('myGigs')}
                        onHire={handleHireApplicant}
                    />
                  );
                }
                // Fallback if no applicant is selected, go back to My Gigs
                setView('myGigs');
                return null;
              case 'jobList':
              default:
                return (
                  <JobList 
                    jobs={sortedJobs} 
                    onSelectJob={handleSelectJob} 
                    endorsedSkills={endorsedSkills}
                    appliedJobIds={appliedJobIds}
                  />
                );
            }
          })()
        )}
      </main>

      {selectedJob && currentUser && (
        <JobDetailModal 
          job={selectedJob} 
          currentUser={currentUser}
          onClose={handleCloseJobDetailModal} 
          onApply={() => handleApplyToJob(selectedJob.id)}
          isApplied={appliedJobIds.includes(selectedJob.id)}
          onGoToProfile={handleGoToProfile}
        />
      )}
      {jobToRate && (
        <FeedbackModal
            job={jobToRate}
            applicant={hiredApplicantForFeedback}
            onClose={handleCloseFeedbackModal}
            onSubmit={handleSubmitFeedback}
        />
      )}
      {isPolicyModalOpen && policyModalContent && (
          <PolicyModal 
            title={policyModalContent.title}
            content={policyModalContent.content}
            onClose={handleClosePolicyModal}
          />
      )}
    </div>
  );
};

export default App;