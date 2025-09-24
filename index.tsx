import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global safety net: prevent circular/Firebase objects from crashing JSON.stringify
(() => {
  const FB = new Set([
    'Query','QueryImpl','DocumentReference','CollectionReference',
    'QuerySnapshot','DocumentSnapshot','User','Y','Ka' // Firebase internal names seen in errors
  ]);
  const orig = JSON.stringify;

  JSON.stringify = function (value: any, replacer?: any, space?: any) {
    const seen = new WeakSet();
    function safeReplacer(this: any, key: string, val: any) {
      // Respect user replacer first
      if (typeof replacer === 'function') val = replacer.call(this, key, val);

      if (val && typeof val === 'object') {
        // Tag Firebase SDK objects so they serialize safely
        const ctor = (val as any)?.constructor?.name;
        if (ctor && FB.has(ctor)) return `[${ctor}]`;

        // Break cycles cleanly
        if (seen.has(val)) return '[Circular]';
        seen.add(val);
      }
      return val;
    }
    return orig.call(this, value, safeReplacer, space);
  };
})();


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);