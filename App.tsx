import React, { useState } from "react";
import LoginScreen from "./components/LoginScreen";
import ChatScreen from "./components/ChatScreen";
import type { JourneyDetails, User } from "./types";
import { generateAnonymousName } from "./services/geminiService";
import { verifyPnr } from "./services/mockPnrService";

const App: React.FC = () => {
  const [journeyDetails, setJourneyDetails] = useState<JourneyDetails | null>(
    null
  );
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (pnr: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const details = await verifyPnr(pnr);
      const anonymousName = await generateAnonymousName();

      const newUser: User = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `user_${Date.now()}_${Math.random()}`,
        name: anonymousName,
        isCurrentUser: true,
      };

      setUser(newUser);
      setJourneyDetails(details);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-800">
      {journeyDetails && user ? (
        <ChatScreen journeyDetails={journeyDetails} currentUser={user} />
      ) : (
        <LoginScreen
          onLogin={handleLogin}
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  );
};

export default App;
