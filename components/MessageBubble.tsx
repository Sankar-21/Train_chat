import React, { useState, useRef, useEffect } from "react";
import type { Message, User } from "../types";
import UserAvatar from "./UserAvatar";

interface MessageBubbleProps {
  message: Message;
  currentUser: User;
  onToggleReaction: (messageId: string, emoji: string) => void;
  isRead?: boolean;
}

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const EmojiIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="#5224fbff" // Use a visible yellow color
  >
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path>
  </svg>
);

const ReadReceiptIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
  </svg>
);

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUser,
  onToggleReaction,
  isRead,
}) => {
  const { user, text, timestamp, reactions } = message;
  const isCurrentUser = user.id === currentUser.id;
  const isSystem = user.id === "system";

  const [pickerVisible, setPickerVisible] = useState(false);
  // Handler for deleting a message
  const handleDelete = () => {
    if (window.confirm("Delete this message?")) {
      // Custom event for parent to handle
      const event = new CustomEvent("deleteMessage", {
        detail: { messageId: message.id },
      });
      window.dispatchEvent(event);
    }
  };

  // Handler for reporting a message
  const handleReport = () => {
    if (window.confirm("Report this message for unusual activity?")) {
      const event = new CustomEvent("reportMessage", {
        detail: { messageId: message.id, userId: user.id },
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div
      className={`flex w-full mb-2 h-auto ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Side options: Delete/Report */}
      {isCurrentUser ? (
        <div className="flex flex-col justify-center mr-2">
          <button
            className="bg-red-100 text-red-600 rounded-full px-2 py-1 text-xs hover:bg-red-200 mb-1"
            onClick={handleDelete}
            title="Delete message"
          >
            Delete
          </button>
        </div>
      ) : (
        <div className="flex flex-col justify-center ml-2">
          <button
            className="bg-yellow-100 text-yellow-700 rounded-full px-2 py-1 text-xs hover:bg-yellow-200 mb-1"
            onClick={handleReport}
            title="Report unusual activity"
          >
            Report
          </button>
        </div>
      )}
      {/* Message bubble and emoji picker */}
      <div className="relative w-auto max-w-2xl block pr-10">
        {/* Emoji Picker Button */}
        <button
          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-yellow-100 z-10"
          onClick={() => setPickerVisible((v) => !v)}
          title="Add emoji reaction"
        >
          <EmojiIcon className="h-6 w-6" />
        </button>
        {pickerVisible && (
          <div
            className={`absolute top-8 right-2 bg-white border rounded-xl shadow-lg p-2 flex gap-2 z-20`}
          >
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setPickerVisible(false);
                  onToggleReaction(message.id, emoji);
                }}
                className="text-2xl hover:scale-125 transition-transform"
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        <div
          className={`px-4 py-3 rounded-2xl shadow-md inline-block w-auto min-w-0 max-w-[90vw] ${
            isCurrentUser
              ? "bg-indigo-600 text-white rounded-br-none"
              : "bg-white text-slate-800 rounded-bl-none"
          }`}
        >
          <p
            className="text-sm break-words whitespace-pre-line break-all w-auto"
            style={{
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            {text}
          </p>
        </div>
        <div className="h-6">
          {/* Reserve space for reactions and timestamp to prevent layout shift */}
          <div className="flex items-center justify-between">
            {/* Reactions Display */}
            {reactions && (
              <div
                className={`flex gap-1 mt-1 ${
                  isCurrentUser ? "justify-end" : ""
                }`}
              >
                {Object.keys(reactions).map((emoji) => {
                  const userIds = reactions[emoji];
                  return userIds.length > 0 ? (
                    <button
                      key={emoji}
                      onClick={() => onToggleReaction(message.id, emoji)}
                      className={`flex items-center text-xs px-2 py-0.5 rounded-full border transition-colors ${
                        userIds.includes(currentUser.id)
                          ? "bg-indigo-100 border-indigo-400 text-indigo-700"
                          : "bg-slate-200 border-slate-300 text-slate-600 hover:bg-slate-300"
                      }`}
                      title={`Reacted by ${userIds.length} people`}
                    >
                      <span>{emoji}</span>
                      <span className="font-semibold ml-1">
                        {userIds.length}
                      </span>
                    </button>
                  ) : null;
                })}
              </div>
            )}
            <div
              className={`flex items-center gap-1 text-xs mt-1 ${
                isCurrentUser
                  ? "ml-auto mr-2 text-slate-400"
                  : "text-slate-400 ml-2"
              }`}
            >
              <span>
                {new Date(timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {isCurrentUser && isRead && (
                <ReadReceiptIcon className="h-4 w-4 text-blue-500" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
