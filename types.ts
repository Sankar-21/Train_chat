export interface User {
  id: string;
  name: string;
  isCurrentUser: boolean;
  isBlocked?: boolean;
}

export interface Message {
  id: string;
  text: string;
  timestamp: number;
  user: User;
  reactions?: Record<string, string[]>; // emoji -> user.id[]
  isRead?: boolean;
}

export interface JourneyDetails {
  pnr: string;
  trainName: string;
  trainNumber: string;
  coach: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
}

export interface PrivateChatSession {
  with: User;
  messages: Message[];
}