export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  messages: Message[];
} 