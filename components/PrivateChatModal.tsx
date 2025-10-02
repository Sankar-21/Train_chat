import React, { useState, useEffect, useRef } from 'react';
import type { PrivateChatSession, User, Message } from '../types';
import MessageBubble from './MessageBubble';
import UserAvatar from './UserAvatar';

interface PrivateChatModalProps {
  session: PrivateChatSession;
  currentUser: User;
  onSendMessage: (text: string) => void;
  onClose: () => void;
}

const SendIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
    </svg>
);

const CloseIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
    </svg>
);

const PrivateChatModal: React.FC<PrivateChatModalProps> = ({ session, currentUser, onSendMessage, onClose }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Detect when a new message arrives from the partner to stop the typing indicator
    if (session.messages.length > 0) {
      const lastMessage = session.messages[session.messages.length - 1];
      if (!lastMessage.user.isCurrentUser && lastMessage.user.id !== 'system') {
        setIsPartnerTyping(false);
      }
    }
  }, [session.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
      // Simulate that the partner starts typing shortly after we send a message
      setTimeout(() => setIsPartnerTyping(true), 400);
    }
  };
  
  // Dummy reaction handler since we don't have reactions in private chat
  const handleToggleReaction = (messageId: string, emoji: string) => {};

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/60 z-40 animate-fade-in" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="flex flex-col w-full max-w-lg h-[90vh] max-h-[700px] bg-slate-200 rounded-2xl shadow-2xl animate-zoom-in overflow-hidden">
          {/* Header */}
          <header className="flex-shrink-0 bg-white/90 backdrop-blur-sm flex items-center justify-between px-4 h-20 border-b border-slate-300">
            <div className="flex items-center">
              <UserAvatar name={session.with.name} />
              <div className="ml-3">
                <h2 className="text-lg font-bold text-slate-800">{session.with.name}</h2>
                <p className="text-xs text-slate-500">Private Chat</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-300">
              <CloseIcon className="h-6 w-6" />
            </button>
          </header>

          {/* Messages */}
          <main className="flex-1 overflow-y-auto p-4 space-y-4">
            {session.messages.map(msg => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                currentUser={currentUser}
                onToggleReaction={handleToggleReaction} // Reactions are disabled in this context
                isRead={msg.isRead}
              />
            ))}
            {isPartnerTyping && (
                <div className="flex items-end gap-2 justify-start animate-fade-in">
                    <UserAvatar name={session.with.name} />
                    <div className="px-4 py-3 rounded-2xl shadow-md bg-white text-slate-800 rounded-bl-none">
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </main>

          {/* Footer */}
          <footer className="flex-shrink-0 p-2 bg-white/90 backdrop-blur-sm border-t border-slate-300">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2 sm:space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${session.with.name}...`}
                className="flex-1 px-4 py-3 bg-slate-100 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                autoFocus
              />
              <button type="submit" className="bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:bg-indigo-400" disabled={!newMessage.trim()}>
                <SendIcon className="h-6 w-6" />
              </button>
            </form>
          </footer>
        </div>
      </div>
    </>
  );
};

export default PrivateChatModal;