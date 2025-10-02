import React from 'react';

interface UserAvatarProps {
  name: string;
  isBlocked?: boolean;
}

const COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
  'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 
  'bg-rose-500'
];

// Simple hash function to get a consistent color for a name
const nameToColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % COLORS.length);
  return COLORS[index];
};


const UserAvatar: React.FC<UserAvatarProps> = ({ name, isBlocked }) => {
  const initial = name.charAt(0).toUpperCase();
  const colorClass = nameToColor(name);

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 ${colorClass} ${isBlocked ? 'filter grayscale' : ''}`}>
      {initial}
    </div>
  );
};

export default UserAvatar;
