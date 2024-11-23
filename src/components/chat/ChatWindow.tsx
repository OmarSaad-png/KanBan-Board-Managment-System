import { useState, useEffect, useRef } from 'react';
import { User } from '../../utils/auth-types';
import { Message } from '../../utils/message-types';
import { fetchChatHistory, saveMessage } from '../../utils/api';
import Loading from '../common/Loading';

interface ChatWindowProps {
  currentUser: User;
  otherUser: User;
  onClose: () => void;
  ws: WebSocket;
}

export default function ChatWindow({ currentUser, otherUser, onClose, ws }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory();
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    const handleWebSocketMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'CHAT_MESSAGE' && 
            (data.senderId === otherUser.id || data.receiverId === otherUser.id)) {
          setMessages(prev => [...prev, data.message]);
        }
      } catch (error) {
        setWsError('Failed to process incoming message');
        console.error('WebSocket message error:', error);
      }
    };

    const handleWebSocketError = () => {
      setWsError('Connection error occurred');
    };

    const handleWebSocketClose = () => {
      setWsError('Connection closed');
    };

    ws.addEventListener('message', handleWebSocketMessage);
    ws.addEventListener('error', handleWebSocketError);
    ws.addEventListener('close', handleWebSocketClose);

    return () => {
      ws.removeEventListener('message', handleWebSocketMessage);
      ws.removeEventListener('error', handleWebSocketError);
      ws.removeEventListener('close', handleWebSocketClose);
    };
  }, [ws, otherUser.id]);

  const loadChatHistory = async () => {
    try {
      const history = await fetchChatHistory(currentUser.id, otherUser.id);
      setMessages(history);
      setError(null);
    } catch (error) {
      setError('Failed to load chat history');
      console.error('Chat history error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: otherUser.id,
      content: trimmedMessage,
      timestamp: new Date().toISOString()
    };

    try {
      await saveMessage(message);
      ws.send(JSON.stringify({
        type: 'CHAT_MESSAGE',
        message
      }));
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setError(null);
    } catch (error) {
      setError('Failed to send message');
      console.error('Send message error:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-lg rounded-lg flex flex-col h-96 z-50">
      <header className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{otherUser.name}</h3>
          {wsError && (
            <span className="w-2 h-2 rounded-full bg-red-500" title={wsError} />
          )}
        </div>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <Loading size="small" />
        ) : error ? (
          <div className="text-red-500 text-sm text-center">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500 text-sm text-center">No messages yet</div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`max-w-[80%] p-2 rounded-lg ${
                message.senderId === currentUser.id
                  ? 'ml-auto bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="break-words">{message.content}</p>
              <span className="text-xs opacity-75">
                {formatTime(message.timestamp)}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 
              disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 