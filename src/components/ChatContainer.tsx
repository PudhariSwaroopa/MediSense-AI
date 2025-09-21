import { useEffect, useRef, useState } from 'react';
import { Message } from '../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ThemeToggle from './ThemeToggle';
import { FiArrowDown, FiMenu, FiSearch, FiPlus, FiX, FiMic } from 'react-icons/fi';

interface ChatContainerProps {
  messages: Message[];
  onNewMessage: (content: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
}

export default function ChatContainer({ 
  messages, 
  onNewMessage, 
  onDeleteMessage,
  onNewChat,
  onToggleSidebar
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Show scroll button if scrolled up more than 100px
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    const results = messages.filter(message => 
      message.content.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
  };

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0 && !showScrollButton) {
      scrollToBottom('auto');
    }
  }, [messages, showScrollButton]);

  const handleSendMessage = (content: string) => {
    if (content.trim()) {
      onNewMessage(content);
      setIsTyping(true);
      
      // Simulate typing indicator
      setTimeout(() => {
        setIsTyping(false);
        scrollToBottom();
      }, 1000);
    }
  };

  const handleEditMessage = (id: string, newContent: string) => {
    // This would typically update the message in your state
    console.log(`Editing message ${id} with content: ${newContent}`);
  };
  
  const handleFeedback = (messageId: string, feedback: 'like' | 'dislike') => {
    // This would typically send feedback to your backend
    console.log(`Feedback for message ${messageId}: ${feedback}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full relative bg-stone-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-gray-700 p-3 flex items-center justify-between bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="flex items-center">
          <button 
            onClick={onToggleSidebar}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-gray-800 transition-colors mr-2"
            aria-label="Toggle sidebar"
          >
            <FiMenu className="w-5 h-5 text-stone-600 dark:text-gray-400" />
          </button>
          <h1 className="text-lg font-semibold text-stone-800 dark:text-gray-100">MediSenseAI</h1>
        </div>
        
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search in conversation"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-8 py-2 text-sm bg-stone-100 dark:bg-gray-800 border border-stone-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-stone-800 dark:text-gray-100 placeholder-stone-500 dark:placeholder-gray-500"
              />
              <FiSearch className="absolute left-3 top-2.5 text-stone-500 dark:text-gray-500 w-4 h-4" />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-2 text-stone-500 dark:text-gray-500 hover:text-stone-700 dark:hover:text-gray-300"
                  aria-label="Clear search"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
            {isSearching && searchQuery && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="p-2">
                    <div className="text-xs text-stone-500 dark:text-gray-400 px-2 py-1 mb-1">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                    </div>
                    {searchResults.map((message, index) => (
                      <div 
                        key={`${message.id}-${index}`}
                        className="p-2 hover:bg-gray-700 rounded-lg cursor-pointer text-sm"
                        onClick={() => {
                          // Scroll to the message
                          const element = document.getElementById(`message-${message.id}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            element.classList.add('ring-2', 'ring-blue-500');
                            setTimeout(() => {
                              element.classList.remove('ring-2', 'ring-blue-500');
                            }, 2000);
                          }
                        }}
                      >
                        <div className="font-medium text-gray-300">
                          {message.sender === 'user' ? 'You' : 'Assistant'}
                        </div>
                        <div className="text-gray-400 truncate">
                          {message.content.length > 100 
                            ? `${message.content.substring(0, 100)}...` 
                            : message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <button
            onClick={onNewChat}
            className="flex items-center space-x-1.5 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <FiPlus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto pb-24 pt-4 px-4 scrollbar-thin"
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 max-w-3xl mx-auto text-center">
            <h2 className="text-5xl font-bold text-stone-800 dark:text-gray-100 mb-6">Hello, User!</h2>
            <p className="text-2xl text-stone-600 dark:text-gray-300 mb-8">How can I help you today?</p>
            <button
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-200 ${
                isVoiceMode
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-white dark:bg-gray-800 hover:bg-stone-100 dark:hover:bg-gray-700 shadow-md'
              }`}
            >
              {isVoiceMode ? (
                <FiMic className="w-8 h-8 text-white" />
              ) : (
                <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              )}
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full space-y-1">
            {(isSearching ? searchResults : messages).map((message) => (
              <div key={message.id} id={`message-${message.id}`} className="search-result">
                <ChatMessage
                  message={message}
                  onEdit={handleEditMessage}
                  onDelete={onDeleteMessage}
                  onFeedback={handleFeedback}
                  isDeletable={message.sender === 'user'}
                />
              </div>
            ))}
            {isSearching && searchResults.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No messages match your search.
              </div>
            )}
            {isTyping && (
              <div className="flex items-start space-x-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                    G
                  </div>
                </div>
                <div className="flex space-x-1.5 items-center bg-gray-50 rounded-2xl px-4 py-2.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-6" />
          </div>
        )}
      </div>

      {showScrollButton && (
        <button
          onClick={() => scrollToBottom()}
          className="fixed right-6 bottom-24 bg-gray-800 p-2 rounded-full shadow-lg border border-gray-700 hover:bg-gray-700 transition-colors z-20"
          aria-label="Scroll to bottom"
        >
          <FiArrowDown className="w-5 h-5 text-gray-300" />
        </button>
      )}

      {/* Input Area - Handled by the fixed ChatInput component */}
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}
