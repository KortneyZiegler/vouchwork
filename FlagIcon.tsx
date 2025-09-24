
import React from 'react';

export const FlagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" {...props}>
    <path fill="#E03C31" d="M0 0h900v300H0z"/>
    <path fill="#002395" d="M0 300h900v300H0z"/>
    <path fill="#fff" d="M0 200h900v200H0z"/>
    <path d="M0 0v600l300-300L0 0z"/>
    <path fill="#007A4D" d="M0 600V0l450 300L0 600z"/>
    <path fill="#FFB612" d="M525 300L0 600h115.47L562.5 300 115.47 0H0l525 300z"/>
  </svg>
);
