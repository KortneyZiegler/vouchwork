import React, { useState } from 'react';
import { CommunityIcon } from './icons/CommunityIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface VouchPageProps {
  data: {
    requesterName: string;
    skills: string[];
  };
  onConfirmVouch: () => void;
}

const VouchPage: React.FC<VouchPageProps> = ({ data, onConfirmVouch }) => {
  const [step, setStep] = useState<'initial' | 'verification' | 'thankyou'>('initial');
  const [voucherName, setVoucherName] = useState('');
  const [voucherEmail, setVoucherEmail] = useState('');

  const skillsText = data.skills.length > 1
    ? data.skills.slice(0, -1).join(', ') + ' & ' + data.skills.slice(-1)
    : data.skills[0];

  const handleConfirmClick = () => {
    setStep('verification');
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (voucherName.trim() && voucherEmail.trim()) {
      onConfirmVouch();
      setStep('thankyou');
    }
  };
  
  const renderInitial = () => (
    <>
      <h2 className="text-3xl font-bold text-center text-gray-800">Vouch Request</h2>
      <p className="text-center text-gray-600 mt-4 text-lg max-w-lg mx-auto">
        <span className="font-bold text-primary-700">{data.requesterName}</span> is asking you to vouch for their skills in{' '}
        <span className="font-bold text-primary-700">{skillsText}</span> for their VouchWork SA profile.
      </p>
      <p className="text-center text-gray-500 mt-2 text-sm">
        By vouching, you confirm you have seen them demonstrate these skills professionally or personally.
      </p>
      <div className="mt-8 flex flex-col items-center gap-4">
        <button
          onClick={handleConfirmClick}
          className="w-full max-w-xs flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-primary-700 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          Yes, I Can Vouch for These Skills
        </button>
        <button className="font-medium text-gray-500 hover:text-gray-700 text-sm">
          I can't vouch at this time
        </button>
      </div>
    </>
  );

  const renderVerification = () => (
    <>
      <h2 className="text-3xl font-bold text-center text-gray-800">One Last Step</h2>
      <p className="text-center text-gray-500 mt-2">Please provide your details for verification.</p>
      <form className="mt-8 space-y-6" onSubmit={handleVerificationSubmit}>
        <div>
          <label htmlFor="vouchername" className="block text-sm font-medium text-gray-700">Your Full Name</label>
          <div className="mt-1">
            <input id="vouchername" name="vouchername" type="text" required value={voucherName} onChange={(e) => setVoucherName(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="e.g., Jane Doe" />
          </div>
        </div>
        <div>
          <label htmlFor="voucheremail" className="block text-sm font-medium text-gray-700">Your Email Address</label>
          <div className="mt-1">
            <input id="voucheremail" name="voucheremail" type="email" required value={voucherEmail} onChange={(e) => setVoucherEmail(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="you@example.com" />
          </div>
        </div>
        <p className="text-xs text-center text-gray-500 !mt-2">
            This is for verification only to ensure the integrity of our community. <strong>This will not create a profile or subscribe you to any marketing.</strong>
        </p>
        <div>
          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-primary-700 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
            Confirm Vouch
          </button>
        </div>
      </form>
    </>
  );

  const renderThankYou = () => (
    <div className="text-center">
        <div className="bg-green-100 p-4 rounded-full mb-6 inline-block">
            <CheckCircleIcon className="h-16 w-16 text-green-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Thank You!</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
            You've successfully vouched for <span className="font-semibold">{data.requesterName}</span>. By sharing your trust, you are helping to build a stronger community.
        </p>
        <p className="text-sm text-gray-500">You can now close this window.</p>
    </div>
  );
  
  const renderStep = () => {
    switch(step) {
      case 'verification': return renderVerification();
      case 'thankyou': return renderThankYou();
      case 'initial':
      default:
        return renderInitial();
    }
  }

  return (
    <div>
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl animate-fade-in-up mx-auto">
            {renderStep()}
        </div>
    </div>
  );
};

export default VouchPage;