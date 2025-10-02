import React, { useState } from "react";

interface LoginScreenProps {
  onLogin: (pnr: string) => void;
  isLoading: boolean;
  error: string | null;
}

const TrainIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
    <path d="M13 6h-2v6h2V6zm0 8h-2v2h2v-2z"></path>
    <path d="m18.2 12.55-4.51-2.61c-.55-.32-1.22.11-1.22.76v5.22c0 .65.67 1.08 1.22.76l4.51-2.61c.55-.32.55-1.22 0-1.54z"></path>
    <path d="M12 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zM9.5 16H8V8h1.5a2.5 2.5 0 0 1 0 5A2.5 2.5 0 0 1 9.5 16zm4-1.5h-2v-5h2v5zm4.5 0h-2.5v-5H18v1.5h-1v2h1V16zM4.22 6.72l1.41-1.41L4.22 3.9 2.81 5.31l1.41 1.41zm15.56 0 1.41 1.41 1.41-1.41-1.41-1.41-1.41 1.41z"></path>
  </svg>
);

const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  isLoading,
  error,
}) => {
  const [pnr, setPnr] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pnr.trim()) {
      onLogin(pnr.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-500">
          <div className="text-center mb-6">
            <TrainIcon className="mx-auto h-16 w-16 text-indigo-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-4">
              Train Track Chat
            </h1>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              Connect with fellow passengers.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="pnr"
                className="block text-sm font-medium text-slate-600 mb-2"
              >
                Enter Your PNR Number
              </label>
              <input
                type="text"
                id="pnr"
                value={pnr}
                onChange={(e) => setPnr(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="10-digit PNR"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-lg mb-4 text-sm"
                role="alert"
              >
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !pnr}
              className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                "Board the Chat"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
