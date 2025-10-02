import React from 'react';
import type { User } from '../types';

interface ReportUserModalProps {
  user: User | null;
  onConfirm: () => void;
  onClose: () => void;
}

const ReportUserModal: React.FC<ReportUserModalProps> = ({ user, onConfirm, onClose }) => {
  if (!user) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/60 z-50 animate-fade-in" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl animate-zoom-in w-full max-w-sm p-6 text-center">
          <h2 className="text-xl font-bold text-slate-800">Report {user.name}?</h2>
          <p className="text-sm text-slate-500 my-4">
            Reporting a user for inappropriate behavior is a serious action. If a user receives 3 reports, they will be permanently blocked from the chat.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 font-semibold text-slate-600 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Confirm Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportUserModal;
