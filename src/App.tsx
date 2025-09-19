import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import ChatContainer from './components/ChatContainer';
import { Message } from './types';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<Array<{
    id: string;
    title: string;
    preview: string;
    timestamp: Date;
  }>>([]);
  const [chatSessions, setChatSessions] = useState<{
    [key: string]: {
      messages: Message[];
      title: string;
      preview: string;
      timestamp: Date;
    };
  }>({});
  
  // Initialize with a default chat if none exists
  useEffect(() => {
    if (Object.keys(chatSessions).length === 0) {
      startNewChat();
    }
  }, []);
  
  // Get current messages from active chat
  const messages = activeChatId ? chatSessions[activeChatId]?.messages || [] : [];
  
  // Convert chat sessions to history items
  const chatHistory = Object.entries(chatSessions).map(([id, session]) => ({
    id,
    title: session.title,
    preview: session.preview,
    timestamp: session.timestamp
  })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Handle sidebar behavior based on screen size
  useEffect(() => {
    const handleResize = () => {
      // On mobile (below 768px), sidebar is closed by default
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        // On desktop/tablet, sidebar is open by default
        setIsSidebarOpen(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat = {
      messages: [],
      title: 'New Chat',
      preview: 'Start a new conversation',
      timestamp: new Date()
    };
    
    setChatSessions(prev => ({
      ...prev,
      [newChatId]: newChat
    }));
    
    setActiveChatId(newChatId);
    return newChatId;
  };

  const handleNewMessage = (content: string) => {
    if (!activeChatId) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    
    // Check if this is the first message in the chat
    const isFirstMessage = chatSessions[activeChatId]?.messages.length === 0;
    
    // Update active chat with new message
    setChatSessions(prev => ({
      ...prev,
      [activeChatId]: {
        ...prev[activeChatId],
        messages: [...prev[activeChatId].messages, newMessage],
        // If it's the first message, use it as the chat title
        title: isFirstMessage 
          ? content.length > 20 
            ? content.substring(0, 20) + '...' 
            : content
          : prev[activeChatId].title,
        preview: content.length > 30 ? content.substring(0, 30) + '...' : content,
        timestamp: new Date()
      }
    }));
    
    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(content),
        sender: 'bot',
        timestamp: new Date(),
      };
      
      // Update chat with bot's response
      setChatSessions(prev => ({
        ...prev,
        [activeChatId]: {
          ...prev[activeChatId],
          messages: [...prev[activeChatId].messages, botMessage],
          timestamp: new Date()
        }
      }));
    }, 1000);
  };

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! How can I assist you today?";
    } else if (message.includes('help')) {
      return "I'm here to help! What do you need assistance with?";
    } else if (message.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    } else if (message.includes('bye') || message.includes('goodbye')) {
      return "Goodbye! Feel free to come back if you have more questions.";
    } else {
      return "I'm your AI assistant. How can I help you with that?";
    }
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChatId(chatId);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };
  
  const handleGlobalSearch = (query: string) => {
    setGlobalSearchQuery(query);
    
    if (query.trim() === '') {
      setGlobalSearchResults([]);
      return;
    }
    
    const results = chatHistory.filter(chat => 
      chat.title.toLowerCase().includes(query.toLowerCase()) ||
      chat.preview.toLowerCase().includes(query.toLowerCase())
    );
    
    setGlobalSearchResults(results);
  };
  
  const handleDeleteChat = (chatId: string) => {
    setChatSessions(prev => {
      const newSessions = { ...prev };
      delete newSessions[chatId];
      
      // If we're deleting the active chat, switch to another one or create a new one
      if (activeChatId === chatId) {
        const remainingChats = Object.keys(newSessions);
        if (remainingChats.length > 0) {
          setActiveChatId(remainingChats[0]);
        } else {
          const newChatId = startNewChat();
          setActiveChatId(newChatId);
        }
      }
      
      return newSessions;
    });
  };
  
  const handleDeleteMessage = (messageId: string) => {
    if (!activeChatId) return;
    
    setChatSessions(prev => {
      const updatedMessages = prev[activeChatId].messages.filter(msg => msg.id !== messageId);
      
      // If we're deleting the last message that was used as the title, update the title
      let title = prev[activeChatId].title;
      if (updatedMessages.length > 0 && title !== 'New Chat') {
        const firstUserMessage = updatedMessages.find(msg => msg.sender === 'user');
        if (!firstUserMessage) {
          title = 'New Chat';
        }
      } else if (updatedMessages.length === 0) {
        title = 'New Chat';
      }
      
      return {
        ...prev,
        [activeChatId]: {
          ...prev[activeChatId],
          messages: updatedMessages,
          title: title,
          preview: updatedMessages.length > 0 
            ? updatedMessages[updatedMessages.length - 1].content.substring(0, 30) + 
              (updatedMessages[updatedMessages.length - 1].content.length > 30 ? '...' : '')
            : 'Start a new conversation',
          timestamp: new Date()
        }
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

// Wrap the App with ThemeProvider
export default function ThemedApp() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}
