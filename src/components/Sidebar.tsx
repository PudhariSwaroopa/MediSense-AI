import { useState, useRef, useEffect } from 'react';
import { FiPlus, FiSearch, FiX, FiTrash2, FiSettings } from 'react-icons/fi';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chatHistory: Array<{
    id: string;
    title: string;
    preview: string;
    timestamp: Date;
  }>;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onSearch: (query: string) => void;
  searchResults: Array<{
    id: string;
    title: string;
    preview: string;
    timestamp: Date;
  }> | null;
  activeChatId: string | null;
}

const Sidebar = ({
  isOpen,
  onClose,
  chatHistory,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onSearch,
  searchResults,
  activeChatId
}: SidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobile]);

  const handleStartNewChat = () => {
    onNewChat();
    if (isMobile) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:relative md:z-0">
      {/* Overlay - Only on mobile */}
      {isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transform transition-transform duration-300 ease-in-out shadow-xl md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-800 dark:text-gray-100">Chat History</h2>
            <button 
              onClick={onClose}
              className="md:hidden p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-gray-800 text-stone-500 dark:text-gray-400 hover:text-stone-700 dark:hover:text-gray-200 transition-colors"
              aria-label="Close sidebar"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          
          {/* New Chat Button */}
          <button
            onClick={handleStartNewChat}
            className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <FiPlus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
          
          {/* Search */}
          <div className="mt-3 relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-8 py-2.5 text-sm bg-stone-100 dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-stone-800 dark:text-gray-100 placeholder-stone-500 dark:placeholder-gray-500"
            />
            <FiSearch className="absolute left-3 top-3 text-stone-400 dark:text-gray-500 w-4 h-4" />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-2.5 text-stone-400 dark:text-gray-500 hover:text-stone-600 dark:hover:text-gray-300"
                aria-label="Clear search"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
          
          {(searchResults || chatHistory).length > 0 ? (
            <ul className="space-y-1">
              {(searchResults || chatHistory).map((chat) => (
                <li key={chat.id}>
                  <div
                    onClick={() => {
                      onSelectChat(chat.id);
                      if (window.innerWidth < 768) {
                        onClose();
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between group cursor-pointer transition-colors ${
                      activeChatId === chat.id 
                        ? 'bg-blue-50 dark:bg-gray-800' 
                        : 'hover:bg-stone-100 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${
                        activeChatId === chat.id 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-stone-800 dark:text-gray-200'
                      }`}>
                        {chat.title || 'New Chat'}
                      </p>
                      {chat.preview && (
                        <p className="text-xs text-stone-500 dark:text-gray-400 truncate mt-0.5">
                          {chat.preview}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-2"
                      aria-label="Delete chat"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-stone-500 dark:text-gray-400">
                {searchQuery ? 'No matching conversations found' : 'No conversations yet'}
              </p>
              {!searchQuery && (
                <button
                  onClick={onNewChat}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <FiPlus className="mr-2 h-4 w-4" />
                  Start a new chat
                </button>
              )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto border-t border-stone-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900">
          <div className="space-y-1">
            <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-stone-700 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <FiSettings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
