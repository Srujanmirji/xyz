import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; avatar?: string };
}

interface Conversation {
  otherUser: User;
  latestMessage: {
    id: string;
    content: string;
    createdAt: string;
  } | null;
}

interface ChatInterfaceProps {
  defaultChatUserId?: string | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ defaultChatUserId }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch all conversations
  const fetchConversations = async (selectDefault = false) => {
    try {
      const res = await axios.get('/messages');
      if (res.data.success) {
        setConversations(res.data.data);
        
        // Handle selecting default chat user if provided
        if (selectDefault && defaultChatUserId) {
          const existing = res.data.data.find(
            (c: Conversation) => c.otherUser.id === defaultChatUserId
          );
          if (existing) {
            setSelectedUser(existing.otherUser);
          } else {
            // Fetch the user details to start a new chat
            try {
              // We don't have a direct get user by ID endpoint, but we can search in properties to find agent details or just start it from the frontend context
              // If not found in conversations, we can fetch details from the agent of a property.
              // Let's fallback: if they selected it, we can create a temporary User object.
              // We'll see how we can fetch details. We can pass user info from parent or find it.
            } catch (err) {
              console.error(err);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching conversations', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (otherUserId: string) => {
    try {
      const res = await axios.get(`/messages/chat/${otherUserId}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching messages', error);
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const text = newMessage;
    setNewMessage('');

    try {
      const res = await axios.post('/messages', {
        receiverId: selectedUser.id,
        content: text,
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        // Refresh conversations list to update latest message
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  // Poll for messages in active chat
  useEffect(() => {
    fetchConversations(true);
  }, [defaultChatUserId]);

  useEffect(() => {
    if (!selectedUser) return;

    setLoadingMessages(true);
    fetchMessages(selectedUser.id).finally(() => setLoadingMessages(false));

    const interval = setInterval(() => {
      fetchMessages(selectedUser.id);
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedUser]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize custom user if chat initiated with a user not in current conversations
  useEffect(() => {
    if (defaultChatUserId && conversations.length > 0) {
      const exists = conversations.some((c) => c.otherUser.id === defaultChatUserId);
      if (!exists) {
        // We will fetch properties to find the agent details if we need to.
        // But for simplicity, we can also check if we can fetch user profile or if it's passed down.
        // Let's fetch property agents if needed, or we can just try to query standard user details if there is an endpoint.
        // Let's write a quick endpoint or get agent info from active property detail page.
      }
    }
  }, [defaultChatUserId, conversations]);

  // Assist with starting new conversation if defaultChatUserId is set
  const startNewConversation = (otherUser: User) => {
    setSelectedUser(otherUser);
    const exists = conversations.some((c) => c.otherUser.id === otherUser.id);
    if (!exists) {
      setConversations((prev) => [
        { otherUser, latestMessage: null },
        ...prev,
      ]);
    }
  };

  // Public imperative handler or window-based hook for starting conversations
  useEffect(() => {
    (window as any).startChatWithUser = (otherUser: User) => {
      startNewConversation(otherUser);
    };
    return () => {
      delete (window as any).startChatWithUser;
    };
  }, [conversations]);

  return (
    <div className="flex bg-surface border border-outline-variant/30 rounded-2xl h-[600px] overflow-hidden shadow-lg max-w-5xl w-full">
      {/* Conversations List */}
      <div className="w-80 border-r border-outline-variant/30 flex flex-col bg-surface-container-lowest">
        <div className="p-4 border-b border-outline-variant/20">
          <h3 className="font-bold text-lg text-on-background">Messages</h3>
          <p className="text-xs text-on-surface-variant">Chat with buyers, sellers & agents</p>
        </div>
        <div className="flex-grow overflow-y-auto divide-y divide-outline-variant/10">
          {loadingConversations ? (
            <div className="p-4 text-center text-xs text-on-surface-variant animate-pulse">Loading conversations...</div>
          ) : conversations.length > 0 ? (
            conversations.map((conv) => {
              const isActive = selectedUser?.id === conv.otherUser.id;
              return (
                <button
                  key={conv.otherUser.id}
                  onClick={() => setSelectedUser(conv.otherUser)}
                  className={`w-full text-left p-4 flex gap-3 transition-colors hover:bg-surface-container-low ${
                    isActive ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface'
                  }`}
                >
                  <img
                    src={conv.otherUser.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBlkv4g9X0XcOaOHPU9JD0I2vM7RHcaJt8rF3dK0yjBzIZ6YqZG6asDvzylsnUQUm2sjRVEb3hsx4_VBY9dsPFGZhEHF_3PIneysiJawGWGl1Twpi-w1qvFcULBccrteK0TRggRGaLOZV5w3DbxXgil4JFc_AbXVm6O0VEGBCGJ2NcylZbkTGkJCgbf5gBArmXoxywMsp82i4fJRYTslvowfYYA_vIgnHubKr24d4oSff_2Ir5t53JYbnug-els730lpGBt97ajJM'}
                    alt={conv.otherUser.name}
                    className="w-10 h-10 rounded-full border border-outline-variant/20 object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="font-bold text-sm truncate">{conv.otherUser.name}</h4>
                      {conv.latestMessage && (
                        <span className="text-[10px] text-outline shrink-0">
                          {new Date(conv.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${isActive ? 'text-on-secondary-container/80' : 'text-on-surface-variant'}`}>
                      {conv.latestMessage ? conv.latestMessage.content : 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-on-surface-variant italic">No conversations started yet.</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-grow flex flex-col bg-surface">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-outline-variant/20 flex items-center gap-3 bg-surface-container-low">
              <img
                src={selectedUser.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBlkv4g9X0XcOaOHPU9JD0I2vM7RHcaJt8rF3dK0yjBzIZ6YqZG6asDvzylsnUQUm2sjRVEb3hsx4_VBY9dsPFGZhEHF_3PIneysiJawGWGl1Twpi-w1qvFcULBccrteK0TRggRGaLOZV5w3DbxXgil4JFc_AbXVm6O0VEGBCGJ2NcylZbkTGkJCgbf5gBArmXoxywMsp82i4fJRYTslvowfYYA_vIgnHubKr24d4oSff_2Ir5t53JYbnug-els730lpGBt97ajJM'}
                alt={selectedUser.name}
                className="w-10 h-10 rounded-full border border-outline-variant/20 object-cover"
              />
              <div>
                <h4 className="font-bold text-sm text-on-background">{selectedUser.name}</h4>
                <p className="text-[10px] text-outline capitalize">{selectedUser.role.toLowerCase()}</p>
              </div>
            </div>

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
              {loadingMessages ? (
                <div className="text-center text-xs text-on-surface-variant animate-pulse pt-10">Loading messages...</div>
              ) : messages.length > 0 ? (
                messages.map((msg) => {
                  const isOwn = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                          isOwn
                            ? 'bg-primary text-on-primary rounded-tr-none'
                            : 'bg-surface border border-outline-variant/20 text-on-background rounded-tl-none'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <span
                          className={`text-[9px] block text-right mt-1 ${
                            isOwn ? 'text-on-primary/70' : 'text-outline'
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-xs text-on-surface-variant italic pt-10">Send a message to start the conversation!</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-outline-variant/20 bg-surface flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message here..."
                className="flex-grow bg-background border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
              <button
                type="submit"
                className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-label-md hover:bg-primary-container hover:shadow-md transition-all active:scale-95 flex items-center justify-center shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <span className="material-symbols-outlined text-[64px] text-outline/40 mb-3">chat</span>
            <h4 className="font-bold text-on-background">Your Inbox</h4>
            <p className="text-sm text-on-surface-variant max-w-xs mt-1">Select a conversation from the sidebar to start talking with buyers or sellers.</p>
          </div>
        )}
      </div>
    </div>
  );
};
