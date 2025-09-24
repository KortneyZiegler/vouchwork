import React from 'react';

interface FooterProps {
  onOpenPolicyModal: (type: 'tos' | 'privacy' | 'conduct') => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenPolicyModal }) => (
  <footer className="w-full mt-8 text-center text-sm text-gray-500">
    <div className="flex justify-center flex-wrap gap-x-6 gap-y-2">
      <button onClick={() => onOpenPolicyModal('tos')} className="hover:underline">Our Shared Commitment (TOS)</button>
      <button onClick={() => onOpenPolicyModal('privacy')} className="hover:underline">Privacy Policy</button>
      <button onClick={() => onOpenPolicyModal('conduct')} className="hover:underline">Community Code of Conduct</button>
    </div>
    <p className="mt-4">&copy; {new Date().getFullYear()} VouchWork SA. All Rights Reserved.</p>
  </footer>
);

export default Footer;
