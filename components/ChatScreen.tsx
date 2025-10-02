import React, { useState, useEffect, useRef } from "react";
import { socket } from "../services/socket";
import type {
  JourneyDetails,
  User,
  Message,
  PrivateChatSession,
} from "../types";
import MessageBubble from "./MessageBubble";
import UserAvatar from "./UserAvatar";
import PrivateChatModal from "./PrivateChatModal";
import PrivateChatRequestToast from "./PrivateChatRequestToast";
import ReportUserModal from "./ReportUserModal";

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
  </svg>
);

const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);

const ChatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"></path>
  </svg>
);

const ReportIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"></path>
  </svg>
);

// ...existing code...

interface ChatScreenProps {
  journeyDetails: JourneyDetails;
  currentUser: User;
}

type RequestStatus = "idle" | "pending" | "accepted" | "declined";

const ChatScreen: React.FC<ChatScreenProps> = ({
  journeyDetails,
  currentUser,
}) => {
  // (Removed duplicate state declarations)

  // Listen for delete and report events from MessageBubble
  useEffect(() => {
    const handleDelete = (e: any) => {
      const { messageId } = e.detail;
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    };
    const handleReport = (e: any) => {
      const { messageId, userId } = e.detail;
      // Show a simple confirmation (could be enhanced)
      alert("Message reported for unusual activity. Thank you!");
    };
    window.addEventListener("deleteMessage", handleDelete);
    window.addEventListener("reportMessage", handleReport);
    return () => {
      window.removeEventListener("deleteMessage", handleDelete);
      window.removeEventListener("reportMessage", handleReport);
    };
  }, []);
  const [messages, setMessages] = useState<Message[]>([]);
  // Only add currentUser to onlineUsers if not already present (by id)
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Private Chat State
  const [privateChatRequests, setPrivateChatRequests] = useState<
    Record<string, RequestStatus>
  >({});
  const [activePrivateChat, setActivePrivateChat] =
    useState<PrivateChatSession | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<{ from: User } | null>(
    null
  );
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});
  const [cooldownTime, setCooldownTime] = useState(0);
  const cooldownIntervalRef = useRef<number | null>(null);
  // Reporting State
  const [reportCounts, setReportCounts] = useState<Record<string, number>>({});
  const [reportedUsers, setReportedUsers] = useState<Record<string, boolean>>(
    {}
  );
  const [userToReport, setUserToReport] = useState<User | null>(null);
  const [showReportSuccess, setShowReportSuccess] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // On mount, join chat and set up listeners
    // Normalize coach value before sending to backend
    const normalizedCoach = journeyDetails.coach.trim().toLowerCase();
    const normalizedJourneyDetails = {
      ...journeyDetails,
      coach: normalizedCoach,
    };

    // Assign unique anonymous name based on PNR
    function getAnonymousName(pnr: string) {
      // Example: "Passenger" + last 4 digits of PNR
      if (!pnr) return "Passenger";
      return `Passenger${pnr.slice(-4)}`;
    }
    const anonymousUser = {
      ...currentUser,
      name: getAnonymousName(journeyDetails.pnr),
    };

    console.log(
      "[DEBUG] Joining coach:",
      normalizedCoach,
      "User:",
      anonymousUser
    );
    socket.emit("join", {
      user: anonymousUser,
      journeyDetails: normalizedJourneyDetails,
    });
    socket.on("user list", (users) => {
      // Filter out duplicate users by id
      const uniqueUsers = users.reduce((acc, user) => {
        if (!acc.some((u) => u.id === user.id)) acc.push(user);
        return acc;
      }, []);
      setOnlineUsers(uniqueUsers);
    });
    return () => {
      socket.off("user list");
    };
  }, [currentUser, journeyDetails]);

  // Mock an incoming private chat request to the current user
  // Remove mock private chat request effect

  React.useLayoutEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownTime > 0) {
      cooldownIntervalRef.current = window.setInterval(() => {
        setCooldownTime((prevTime) => Math.max(0, prevTime - 1));
      }, 1000);
    } else if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
      cooldownIntervalRef.current = null;
    }

    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, [cooldownTime]);

  // --- Reporting Handlers ---
  const handleOpenReportModal = (user: User) => {
    setUserToReport(user);
  };

  const handleCloseReportModal = () => {
    setUserToReport(null);
  };

  const handleConfirmReport = () => {
    if (!userToReport) return;

    const targetUserId = userToReport.id;

    setReportedUsers((prev) => ({ ...prev, [targetUserId]: true }));

    const newCount = (reportCounts[targetUserId] || 0) + 1;
    setReportCounts((prev) => ({ ...prev, [targetUserId]: newCount }));

    if (newCount >= 3) {
      setOnlineUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, isBlocked: true } : u))
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `sys_${Date.now()}_${Math.random()}`,
          text: `${userToReport.name} has been removed from the chat due to multiple reports.`,
          timestamp: Date.now(),
          user: { id: "system", name: "System", isCurrentUser: false },
        },
      ]);
    }

    handleCloseReportModal();

    setShowReportSuccess(true);
    setTimeout(() => setShowReportSuccess(false), 3000);
  };

  // --- Private Chat Handlers ---

  const handleRequestPrivateChat = (targetUser: User) => {
    if (
      cooldownTime > 0 ||
      privateChatRequests[targetUser.id] === "pending" ||
      sentRequests[targetUser.id] ||
      (activePrivateChat && activePrivateChat.with.id === targetUser.id)
    )
      return;

    setPrivateChatRequests((prev) => ({ ...prev, [targetUser.id]: "pending" }));

    // Simulate API call and response
    setTimeout(() => {
      // For demo, we'll assume the user accepts
      setPrivateChatRequests((prev) => ({
        ...prev,
        [targetUser.id]: "accepted",
      }));
      setSentRequests((prev) => ({ ...prev, [targetUser.id]: true })); // Mark that a request has been sent to this user
      setCooldownTime(10 * 60); // Start 10 minute cooldown

      const initialMessage: Message = {
        id: `priv_msg_${Date.now()}`,
        text: `You are now chatting with ${targetUser.name}. Say hi!`,
        timestamp: Date.now(),
        user: { id: "system", name: "System", isCurrentUser: false },
      };
      setActivePrivateChat({ with: targetUser, messages: [initialMessage] });
    }, 2500);
  };

  const handleAcceptRequest = () => {
    if (!incomingRequest) return;
    const requester = incomingRequest.from;
    const initialMessage: Message = {
      id: `priv_msg_${Date.now()}`,
      text: `You accepted the chat request from ${requester.name}.`,
      timestamp: Date.now(),
      user: { id: "system", name: "System", isCurrentUser: false },
    };
    setActivePrivateChat({ with: requester, messages: [initialMessage] });
    setPrivateChatRequests((prev) => ({ ...prev, [requester.id]: "accepted" }));
    setIncomingRequest(null);
  };

  const handleDeclineRequest = () => {
    if (!incomingRequest) return;
    const requester = incomingRequest.from;
    // In a real app, you'd notify the requester. Here, we just dismiss it.
    setMessages((prev) => [
      ...prev,
      {
        id: `sys_${Date.now()}_${Math.random()}`,
        text: `You declined a private chat request from ${requester.name}.`,
        timestamp: Date.now(),
        user: { id: "system", name: "System", isCurrentUser: false },
      },
    ]);
    setPrivateChatRequests((prev) => ({ ...prev, [requester.id]: "declined" }));
    setIncomingRequest(null);
  };

  const handleSendPrivateMessage = (text: string) => {
    if (!activePrivateChat) return;

    const newMessage: Message = {
      id: `priv_msg_${Date.now()}_${Math.random()}`,
      text,
      timestamp: Date.now(),
      user: currentUser,
      isRead: false, // Sent messages start as not read
    };

    const partner = activePrivateChat.with;

    setActivePrivateChat((prev) =>
      prev ? { ...prev, messages: [...prev.messages, newMessage] } : null
    );

    // Simulate a reply with read receipt logic
    setTimeout(() => {
      const reply: Message = {
        id: `priv_msg_${Date.now()}_reply_${Math.random()}`,
        text: `This is a simulated reply to "${text.substring(0, 20)}..."`,
        timestamp: Date.now(),
        user: partner,
      };

      setActivePrivateChat((prev) => {
        if (!prev) return null;
        // Mark all of the current user's messages as read upon receiving a reply
        const updatedMessages = prev.messages.map((m) =>
          m.user.isCurrentUser ? { ...m, isRead: true } : m
        );
        return { ...prev, messages: [...updatedMessages, reply] };
      });
    }, 2000 + Math.random() * 1500); // Randomize reply time
  };

  const handleClosePrivateChat = () => {
    if (activePrivateChat) {
      setPrivateChatRequests((prev) => ({
        ...prev,
        [activePrivateChat.with.id]: "idle",
      }));
      setActivePrivateChat(null);
    }
  };

  // --- Group Chat Handlers ---

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socket.emit("chat message", {
        id: `msg_${Date.now()}_${Math.random()}`,
        text: newMessage.trim(),
        timestamp: Date.now(),
        user: currentUser,
      });
      setNewMessage("");
    }
  };

  const handleToggleReaction = (messageId: string, emoji: string) => {
    // Emit reaction event to server
    socket.emit("toggle reaction", {
      messageId,
      emoji,
      userId: currentUser.id,
    });
  };

  useEffect(() => {
    // Listen for initial message history from server
    socket.on("message history", (history) => {
      setMessages(history);
    });
    // Listen for new messages
    socket.on("chat message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    // Listen for updated messages (reactions)
    socket.on("message updated", (updatedMsg) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.id === updatedMsg.id ? updatedMsg : msg))
      );
    });
    return () => {
      socket.off("message history");
      socket.off("chat message");
      socket.off("message updated");
    };
  }, []);

  const getChatButtonTitle = (user: User) => {
    if (user.isBlocked) return "User is blocked";
    if (activePrivateChat?.with.id === user.id)
      return `In chat with ${user.name}`;
    if (sentRequests[user.id]) return "Request already sent to this user";
    if (cooldownTime > 0)
      return `Cannot send request for ${Math.floor(cooldownTime / 60)}:${(
        cooldownTime % 60
      )
        .toString()
        .padStart(2, "0")}`;
    if (privateChatRequests[user.id] === "pending") return "Request pending...";
    return `Chat privately with ${user.name}`;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans antialiased overflow-hidden">
      {/* Sidebar / Drawer */}
      <aside
        className={`fixed top-0 left-0 z-40 w-4/5 max-w-sm h-full bg-white/95 backdrop-blur-sm shadow-xl transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-20 flex items-center px-6 border-b border-slate-300">
          <h2 className="text-xl font-bold text-indigo-700">
            {journeyDetails.trainName}
          </h2>
        </div>
        <div className="px-4 py-2 border-b border-slate-200">
          <p className="font-semibold text-slate-700">
            Coach: {journeyDetails.coach}
          </p>
          <p className="text-sm text-slate-500">
            {journeyDetails.departure} to {journeyDetails.arrival}
          </p>
          <p className="text-xs text-slate-400">PNR: {journeyDetails.pnr}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Passengers Online
            </h3>
            {cooldownTime > 0 && (
              <span className="text-xs font-mono text-indigo-500 bg-indigo-100 px-2 py-1 rounded">
                Next request in: {Math.floor(cooldownTime / 60)}:
                {(cooldownTime % 60).toString().padStart(2, "0")}
              </span>
            )}
          </div>
          <ul>
            {onlineUsers.map((user) => {
              const requestStatus = privateChatRequests[user.id];
              const isInPrivateChat = activePrivateChat?.with.id === user.id;

              return (
                <li
                  key={user.id}
                  className={`flex items-center justify-between p-2 rounded-lg mb-2 transition-colors ${
                    user.isBlocked
                      ? "bg-slate-200 opacity-60"
                      : "hover:bg-slate-200"
                  }`}
                >
                  <div className="flex items-center overflow-hidden">
                    <UserAvatar name={user.name} isBlocked={user.isBlocked} />
                    <div className="ml-3">
                      <span
                        className={`font-medium truncate ${
                          user.isCurrentUser
                            ? "text-indigo-600"
                            : "text-slate-700"
                        }`}
                      >
                        {user.name} {user.isCurrentUser && "(You)"}
                      </span>
                      {user.isBlocked && (
                        <span className="block text-xs font-bold text-red-600">
                          BLOCKED
                        </span>
                      )}
                    </div>
                  </div>
                  {!user.isCurrentUser && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleRequestPrivateChat(user)}
                        disabled={
                          requestStatus === "pending" ||
                          isInPrivateChat ||
                          user.isBlocked ||
                          sentRequests[user.id] ||
                          cooldownTime > 0
                        }
                        className="p-2 text-slate-500 rounded-full hover:bg-slate-300 hover:text-indigo-600 disabled:text-slate-300 disabled:cursor-not-allowed"
                        title={getChatButtonTitle(user)}
                      >
                        {requestStatus === "pending" ? (
                          <span className="text-xs animate-pulse">...</span>
                        ) : (
                          <ChatIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenReportModal(user)}
                        disabled={reportedUsers[user.id] || user.isBlocked}
                        className="p-2 text-slate-500 rounded-full hover:bg-red-200 hover:text-red-600 disabled:text-slate-300 disabled:cursor-not-allowed"
                        title={
                          user.isBlocked
                            ? "User is blocked"
                            : reportedUsers[user.id]
                            ? "You already reported this user"
                            : `Report ${user.name}`
                        }
                      >
                        <ReportIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 transition-opacity duration-300 ease-in-out"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full">
        <header className="flex-shrink-0 bg-white/90 backdrop-blur-sm flex items-center justify-between px-4 h-20 border-b border-slate-300 z-10">
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              Coach {journeyDetails.coach} Chat
            </h1>
            <p className="text-xs text-slate-500">
              {journeyDetails.departureTime} &rarr; {journeyDetails.arrivalTime}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessages([])}
              className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200 text-xs font-semibold"
              title="Delete entire conversation"
            >
              Delete Conversation
            </button>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-600 hover:text-indigo-600"
            >
              <UsersIcon className="h-6 w-6" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              currentUser={currentUser}
              onToggleReaction={handleToggleReaction}
            />
          ))}
          <div ref={messagesEndRef} />
        </main>

        <footer className="flex-shrink-0 p-2 bg-white/90 backdrop-blur-sm border-t border-slate-300">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center space-x-2 sm:space-x-4"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 max-w-xl px-4 py-3 bg-slate-100 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:bg-indigo-400"
              disabled={!newMessage.trim()}
            >
              <SendIcon className="h-6 w-6" />
            </button>
          </form>
        </footer>
      </div>

      {/* Modals and Toasts */}
      {incomingRequest && (
        <PrivateChatRequestToast
          requester={incomingRequest.from}
          onAccept={handleAcceptRequest}
          onDecline={handleDeclineRequest}
        />
      )}
      {activePrivateChat && (
        <PrivateChatModal
          session={activePrivateChat}
          currentUser={currentUser}
          onSendMessage={handleSendPrivateMessage}
          onClose={handleClosePrivateChat}
        />
      )}
      {userToReport && (
        <ReportUserModal
          user={userToReport}
          onConfirm={handleConfirmReport}
          onClose={handleCloseReportModal}
        />
      )}
      {showReportSuccess && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-down">
          User reported successfully.
        </div>
      )}
    </div>
  );
};

export default ChatScreen;
