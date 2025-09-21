import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import ChatContainer from './components/ChatContainer';
import { Message } from './types';
import axios from 'axios';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<
    Array<{ id: string; title: string; preview: string; timestamp: Date }>
  >([]);
  const [chatSessions, setChatSessions] = useState<{
    [key: string]: { messages: Message[]; title: string; preview: string; timestamp: Date };
  }>({});

  // Initialize default chat
  useEffect(() => {
    if (Object.keys(chatSessions).length === 0) startNewChat();
  }, []);

  const messages = activeChatId ? chatSessions[activeChatId]?.messages || [] : [];

  const chatHistory = Object.entries(chatSessions)
    .map(([id, session]) => ({
      id,
      title: session.title,
      preview: session.preview,
      timestamp: session.timestamp,
    }))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat = {
      messages: [],
      title: 'New Chat',
      preview: 'Start a new conversation',
      timestamp: new Date(),
    };
    setChatSessions(prev => ({ ...prev, [newChatId]: newChat }));
    setActiveChatId(newChatId);
    return newChatId;
  };

  // ✅ Send message to backend server
  const handleNewMessage = async (content: string) => {
    if (!activeChatId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    const isFirstMessage = chatSessions[activeChatId]?.messages.length === 0;

    setChatSessions(prev => ({
      ...prev,
      [activeChatId]: {
        ...prev[activeChatId],
        messages: [...prev[activeChatId].messages, newMessage],
        title: isFirstMessage
          ? content.length > 20
            ? content.substring(0, 20) + '...'
            : content
          : prev[activeChatId].title,
        preview: content.length > 30 ? content.substring(0, 30) + '...' : content,
        timestamp: new Date(),
      },
    }));

    try {
      const response = await axios.post('http://localhost:5000/chat', { message: content });
      const botReply = response.data.reply || "Sorry, I couldn't understand that.";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botReply,
        sender: 'bot',
        timestamp: new Date(),
      };

      setChatSessions(prev => ({
        ...prev,
        [activeChatId]: {
          ...prev[activeChatId],
          messages: [...prev[activeChatId].messages, botMessage],
          timestamp: new Date(),
        },
      }));
    } catch (error) {
      console.error('Error getting bot response:', error);
    }
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChatId(chatId);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleGlobalSearch = (query: string) => {
    setGlobalSearchQuery(query);
    if (query.trim() === '') {
      setGlobalSearchResults([]);
      return;
    }
    const results = chatHistory.filter(
      chat =>
        chat.title.toLowerCase().includes(query.toLowerCase()) ||
        chat.preview.toLowerCase().includes(query.toLowerCase())
    );
    setGlobalSearchResults(results);
  };

  const handleDeleteChat = (chatId: string) => {
    setChatSessions(prev => {
      const newSessions = { ...prev };
      delete newSessions[chatId];
      if (activeChatId === chatId) {
        const remaining = Object.keys(newSessions);
        setActiveChatId(remaining.length > 0 ? remaining[0] : startNewChat());
      }
      return newSessions;
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!activeChatId) return;
    setChatSessions(prev => {
      const updatedMessages = prev[activeChatId].messages.filter(msg => msg.id !== messageId);
      let title = updatedMessages.length === 0 ? 'New Chat' : prev[activeChatId].title;
      return {
        ...prev,
        [activeChatId]: {
          ...prev[activeChatId],
          messages: updatedMessages,
          title,
          preview:
            updatedMessages.length > 0
              ? updatedMessages[updatedMessages.length - 1].content.substring(0, 30) +
                (updatedMessages[updatedMessages.length - 1].content.length > 30 ? '...' : '')
              : 'Start a new conversation',
          timestamp: new Date(),
        },
      };
    });
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chatHistory={chatHistory}
        activeChatId={activeChatId}
        onSelectChat={handleChatSelect}
        onNewChat={startNewChat}
        onDeleteChat={handleDeleteChat}
        onSearch={handleGlobalSearch}
        searchResults={globalSearchQuery ? globalSearchResults : null}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <ChatContainer
          messages={messages}
          onNewMessage={handleNewMessage}
          onDeleteMessage={handleDeleteMessage}
          onNewChat={startNewChat}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
    </div>
  );
}

export default function ThemedApp() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}
