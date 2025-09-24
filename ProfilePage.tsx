import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Applicant } from '../types';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { CameraIcon } from './icons/CameraIcon';
import { ShareIcon } from './icons/ShareIcon';
import { PencilIcon } from './icons/PencilIcon';
import { PRE_DEFINED_SKILLS } from '../constants';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { generateVouchRequestMessage } from '../services/geminiService';


interface ProfilePageProps {
  user: Applicant;
  onBack: () => void;
  onVerify: () => void;
  onUpdateProfile: (updatedData: Partial<Applicant>) => void;
  onShareVouchRequest: (skills: string[]) => void;
  onAddSkill: (skill: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onBack, onVerify, onUpdateProfile, onShareVouchRequest, onAddSkill }) => {
  const [idNumber, setIdNumber] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    profilePictureUrl: user.profilePictureUrl,
    bio: user.bio || '',
  });
  
  const allUserSkills = user.skills || [];
  const availableSkillsToAdd = PRE_DEFINED_SKILLS.filter(s => !allUserSkills.includes(s)).sort();
  
  const [skillToAdd, setSkillToAdd] = useState(availableSkillsToAdd[0] || '');
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  
  const [isSharingPanelOpen, setIsSharingPanelOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [isLoadingAiMessage, setIsLoadingAiMessage] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const uniqueVouchId = useMemo(() => Math.random().toString(36).substring(2, 10), [isSharingPanelOpen]);
  const vouchLink = `https://vouchwork.sa/vouch/${uniqueVouchId}`;
  
  const communityReputation = useMemo(() => {
    const counts: Record<string, number> = {};
    (user.jobHistory || []).forEach(job => {
        job.attributes.forEach(attr => {
            counts[attr] = (counts[attr] || 0) + 1;
        });
    });
    return Object.entries(counts).sort((a,b) => b[1] - a[1]);
  }, [user.jobHistory]);
  
  useEffect(() => {
    setFormData({ name: user.name, profilePictureUrl: user.profilePictureUrl, bio: user.bio || '' });
  }, [user]);

  useEffect(() => {
    setSkillToAdd(availableSkillsToAdd[0] || '');
  }, [user.skills, availableSkillsToAdd]);

  const handleGenerateAiMessage = useCallback(async () => {
    if (selectedSkills.size === 0) return;
    setIsLoadingAiMessage(true);
    const generatedMessage = await generateVouchRequestMessage(user.name.replace(/\(.*\)/, '').trim(), Array.from(selectedSkills));
    setAiMessage(generatedMessage);
    setIsLoadingAiMessage(false);
  }, [user.name, selectedSkills]);

  useEffect(() => {
    if (isSharingPanelOpen && selectedSkills.size > 0) {
        handleGenerateAiMessage();
    } else {
        setAiMessage('');
        setIsLoadingAiMessage(false);
    }
  }, [isSharingPanelOpen, handleGenerateAiMessage, selectedSkills]);

  const handleVerify = () => {
    if (idNumber.length < 10 || !/^\d+$/.test(idNumber)) {
        setError('Please enter a valid ID number.');
        return;
    }
    setError('');
    onVerify();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePictureUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ name: user.name, profilePictureUrl: user.profilePictureUrl, bio: user.bio || '' });
    setIsEditing(false);
  };

  const handleSkillSelectionChange = (skill: string) => {
    setSelectedSkills(prev => {
        const newSet = new Set(prev);
        if (newSet.has(skill)) {
            newSet.delete(skill);
        } else {
            newSet.add(skill);
        }
        return newSet;
    });
  };

  const handleOpenSharingPanel = () => {
    if (selectedSkills.size > 0) {
        setIsSharingPanelOpen(true);
    }
  };

  const handleCloseSharingPanel = () => {
    setIsSharingPanelOpen(false);
    setSelectedSkills(new Set());
  };
  
  const handleCopyToClipboard = () => {
    const fullMessage = `${aiMessage}\n\nHere is my unique vouch link: ${vouchLink}`;
    navigator.clipboard.writeText(fullMessage);
    setIsCopied(true);
    onShareVouchRequest(Array.from(selectedSkills));
    setTimeout(() => {
        setIsCopied(false);
    }, 2000);
  };

  const handleShareToWhatsApp = () => {
    const fullMessage = `${aiMessage}\n\nHere is my unique vouch link: ${vouchLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
    window.open(whatsappUrl, '_blank');
    onShareVouchRequest(Array.from(selectedSkills));
  };


  const handleAddSkillClick = () => {
    if (skillToAdd) {
        onAddSkill(skillToAdd);
        setSkillToAdd('');
    }
  };

  // FIX: Component was truncated. Restored full JSX for the profile page, closed all tags, and added the missing default export.
  return (
    <div className="animate-fade-in">
        <button onClick={onBack} className="flex items-center gap-2 text-primary-700 font-semibold mb-6 hover:underline">
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Jobs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                 {/* Profile Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    {isEditing ? (
                        <div className="space-y-4">
                            <div className="relative group w-24 h-24 mx-auto">
                                <img src={formData.profilePictureUrl} alt="profile" className="w-24 h-24 rounded-full object-cover"/>
                                <label htmlFor="profile-pic-upload" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CameraIcon className="h-8 w-8 text-white"/>
                                </label>
                                <input id="profile-pic-upload" type="file" accept="image/*" className="hidden" onChange={handlePictureUpload} />
                            </div>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
                            </div>
                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                                <textarea name="bio" id="bio" rows={4} value={formData.bio} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleSave} className="flex-1 bg-primary-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-800">Save</button>
                                <button onClick={handleCancel} className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <img src={user.profilePictureUrl} alt={user.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-4" />
                            <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
                            <p className="text-gray-600 mt-2">{user.bio}</p>
                            <button onClick={() => setIsEditing(true)} className="mt-4 flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors">
                                <PencilIcon className="h-4 w-4"/> Edit Profile
                            </button>
                        </div>
                    )}
                </div>

                {/* Verification Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="font-bold text-lg mb-3 text-gray-800">SA ID Verification</h2>
                    {user.isVerifiedSAId ? (
                        <div className="flex items-center gap-2 p-3 rounded-md bg-blue-50 text-blue-800 font-semibold">
                            <ShieldCheckIcon className="h-6 w-6"/> Verified SA Citizen
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">Verify your ID to build trust. This is kept private and secure.</p>
                            <input 
                                type="text" 
                                value={idNumber}
                                onChange={(e) => setIdNumber(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                placeholder="Enter your ID Number"
                            />
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <button onClick={handleVerify} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Verify Now</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
                {/* Skills Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="font-bold text-lg mb-4 text-gray-800">My Skills & Vouch Requests</h2>
                    <div className="space-y-3 mb-6">
                        {allUserSkills.length > 0 ? allUserSkills.map(skill => {
                            const vouches = user.endorsedSkills[skill] || 0;
                            const needsVouch = vouches < 2;
                            return (
                                <div key={skill} className={`flex items-center justify-between p-3 rounded-md ${needsVouch ? 'bg-gray-50' : 'bg-green-50'}`}>
                                    <div className="flex items-center">
                                        {needsVouch && (
                                            <input type="checkbox" checked={selectedSkills.has(skill)} onChange={() => handleSkillSelectionChange(skill)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-3"/>
                                        )}
                                        <span className="font-semibold text-gray-800">{skill}</span>
                                    </div>
                                    <div className={`text-sm font-bold px-2 py-1 rounded-full ${vouches >= 2 ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                        {vouches >= 2 ? 'Fully Vouched' : `${2 - vouches} vouch${2 - vouches > 1 ? 'es' : ''} needed`}
                                    </div>
                                </div>
                            )
                        }) : <p className="text-gray-500 text-center py-4">You haven't added any skills yet.</p>}
                    </div>

                    <button onClick={handleOpenSharingPanel} disabled={selectedSkills.size === 0} className="w-full flex items-center justify-center gap-2 bg-secondary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        <ShareIcon className="h-5 w-5"/> Request Vouch for Selected ({selectedSkills.size})
                    </button>
                    
                    <div className="mt-6 border-t pt-6">
                         <h3 className="font-semibold text-gray-700 mb-2">Add a New Skill</h3>
                         <div className="flex gap-2">
                            <select value={skillToAdd} onChange={e => setSkillToAdd(e.target.value)} className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" disabled={availableSkillsToAdd.length === 0}>
                                {availableSkillsToAdd.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <button onClick={handleAddSkillClick} disabled={!skillToAdd} className="flex items-center gap-2 bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 disabled:bg-gray-400">
                                <UserPlusIcon className="h-5 w-5"/> Add
                            </button>
                         </div>
                    </div>
                </div>

                 {/* Job History Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="font-bold text-lg mb-4 text-gray-800">My Gig History & Reputation</h2>
                    {(user.jobHistory || []).length > 0 ? (
                        <div className="space-y-4">
                            {(user.jobHistory || []).map((job, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                                    <p className="font-bold text-gray-800">{job.jobTitle}</p>
                                    <div className="flex flex-wrap gap-2 my-2">
                                        {job.attributes.map(attr => (
                                            <span key={attr} className="text-xs font-semibold bg-primary-100 text-primary-800 px-2 py-1 rounded-full">{attr}</span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-600 italic">"{job.feedback}"</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">Your completed gigs will appear here.</p>
                    )}
                </div>
            </div>
        </div>

        {/* Sharing Panel Modal */}
        {isSharingPanelOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col">
                    <header className="p-6 border-b flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Share Vouch Request</h2>
                            <p className="text-gray-500 text-sm">Send this to a trusted contact.</p>
                        </div>
                        <button onClick={handleCloseSharingPanel} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6"/></button>
                    </header>
                    <main className="p-6 space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-2">AI Vouch Request Helper</h3>
                            {isLoadingAiMessage && <p className="text-sm text-gray-500">Generating message...</p>}
                            {!isLoadingAiMessage && aiMessage && (
                                 <textarea value={aiMessage} onChange={e => setAiMessage(e.target.value)} rows={5} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
                            )}
                        </div>
                        <div>
                            <label className="block text-md font-semibold text-gray-700 mb-2">Your One-Time Sharable Link</label>
                            <div className="bg-gray-100 border border-dashed text-gray-600 p-3 rounded-md text-sm truncate">{vouchLink}</div>
                        </div>
                    </main>
                    <footer className="p-6 bg-gray-100 border-t flex flex-col sm:flex-row gap-3 justify-end">
                        <button onClick={handleCopyToClipboard} disabled={!aiMessage} className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 font-bold py-3 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                            <ClipboardIcon className="h-5 w-5"/> {isCopied ? 'Copied!' : 'Copy Text & Link'}
                        </button>
                        <button onClick={handleShareToWhatsApp} disabled={!aiMessage} className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50">
                            <WhatsAppIcon className="h-5 w-5"/> Share on WhatsApp
                        </button>
                    </footer>
                </div>
            </div>
        )}
    </div>
  );
};

export default ProfilePage;
