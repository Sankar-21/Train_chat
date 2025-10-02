import React from 'react';
import type { User } from '../types';

interface PrivateChatRequestToastProps {
  requester: User;
  onAccept: () => void;
  onDecline: () => void;
}

const PrivateChatRequestToast: React.FC<PrivateChatRequestToastProps> = ({ requester, onAccept, onDecline }) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md z-50">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-4 flex items-center justify-between animate-slide-in-up">
            <p className="text-sm text-slate-700">
                <span className="font-bold text-indigo-600">{requester.name}</span> wants to chat privately.
            </p>
            <div className="flex items-center gap-2">
                <button 
                    onClick={onDecline}
                    className="px-3 py-1 text-sm font-semibold text-slate-600 bg-slate-200 rounded-md hover:bg-slate-300 transition-colors"
                >
                    Decline
                </button>
                <button 
                    onClick={onAccept}
                    className="px-3 py-1 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                >
                    Accept
                </button>
            </div>
        </div>
    </div>
  );
};

export default PrivateChatRequestToast;
