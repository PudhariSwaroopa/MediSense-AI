import { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { FiCopy, FiCheck, FiThumbsUp, FiThumbsDown, FiMoreVertical, FiEdit, FiTrash2 } from 'react-icons/fi';
import { FaGem } from 'react-icons/fa';
import ReactMarkdown, { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { ReactNode } from 'react';

type CodeProps = {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: ReactNode;
  [key: string]: any;
};

type MarkdownComponents = Components;

interface ChatMessageProps {
  message: Message;
  onEdit: (id: string, newContent: string) => void;
  onDelete: (id: string) => void;
  onFeedback?: (messageId: string, feedback: 'like' | 'dislike') => void;
  isDeletable?: boolean;
}

export default function ChatMessage({ message, onEdit, onDelete, onFeedback, isDeletable }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const menuRef = useRef<HTMLDivElement>(null);
  const isUser = message.sender === 'user';
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    const newFeedback = type === feedback ? null : type;
    setFeedback(newFeedback);
    if (onFeedback && newFeedback) {
      onFeedback(message.id, newFeedback);
    }
    // Here you would typically send this feedback to your backend
    console.log(`Feedback: ${newFeedback || 'removed'} for message ${message.id}`);
  };

  const handleEdit = () => {
    if (onEdit && editedContent.trim() !== message.content) {
      onEdit(message.id, editedContent);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id);
    }
    setIsMenuOpen(false);
  };

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  // Custom renderer for markdown code blocks
  const components: MarkdownComponents = {
    code({ node, inline, className, children, ...props }: CodeProps) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <div className="relative">
          <div className="flex items-center justify-between bg-gray-800 text-gray-300 text-xs px-4 py-1 rounded-t-lg">
            <span>{match[1]}</span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center space-x-1 text-xs hover:text-white"
            >
              {copied ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            className="rounded-b-lg rounded-tr-lg overflow-hidden text-sm"
            showLineNumbers
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-sm font-mono">
          {children}
        </code>
      );
    },
    a: ({ node, ...props }: { node?: any; href?: string; children?: ReactNode }) => (
      <a 
        {...props} 
        className="text-blue-600 dark:text-blue-400 hover:underline" 
        target="_blank" 
        rel="noopener noreferrer"
      />
    ),
    p: ({ node, ...props }: { node?: any; children?: ReactNode }) => <p className="my-3 leading-relaxed" {...props} />,
    ul: ({ node, ...props }: { node?: any; children?: ReactNode }) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
    ol: ({ node, ...props }: { node?: any; children?: ReactNode }) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
    blockquote: ({ node, ...props }: { node?: any; children?: ReactNode }) => (
      <blockquote 
        className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-3 text-gray-600 dark:text-gray-300 italic" 
        {...props} 
      />
    ),
  };

  if (isUser) {
    return (
      <div 
        className="group flex justify-end mb-4 px-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative max-w-[85%] lg:max-w-3xl">
          {isEditing ? (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 shadow-sm">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full bg-gray-800 text-white border-0 focus:ring-0 resize-none min-h-[100px] p-2 rounded-lg"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleEdit();
                  } else if (e.key === 'Escape') {
                    setIsEditing(false);
                    setEditedContent(message.content);
                  }
                }}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(message.content);
                  }}
                  className="px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="bg-blue-600 text-white rounded-2xl px-4 py-3 rounded-br-none">
                <div className="whitespace-pre-wrap break-words">
                  <ReactMarkdown components={components}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
              
              {/* Message actions */}
              <div className={`absolute -left-10 top-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ${isHovered ? 'opacity-100' : ''}`}>
                <button 
                  onClick={() => {
                    setEditedContent(message.content);
                    setIsEditing(true);
                  }}
                  className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Edit message"
                >
                  <FiEdit className="w-3.5 h-3.5" />
                </button>
                {isDeletable && (
                  <button 
                    onClick={handleDelete}
                    className="p-1.5 rounded-full text-gray-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    title="Delete message"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-end mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{formatTimestamp(message.timestamp)}</span>
            <button 
              onClick={handleCopy}
              className="ml-2 p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={copied ? 'Copied!' : 'Copy'}
            >
              {copied ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Bot message
  return (
    <div 
      className="group flex mb-6 px-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center mr-3 mt-1">
        <FaGem className="w-5 h-5 text-blue-400" />
      </div>
      
      <div className="flex-1 max-w-3xl">
        <div className="flex items-center mb-1">
          <span className="font-medium text-gray-100">MediChat</span>
          <span className="mx-2 text-gray-500">·</span>
          <span className="text-xs text-gray-400">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        
        {isEditing ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 shadow-sm">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full bg-gray-800 text-white border-0 focus:ring-0 resize-none min-h-[100px] p-2 rounded-lg"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleEdit();
                } else if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditedContent(message.content);
                }
              }}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(message.content);
                }}
                className="px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="whitespace-pre-wrap break-words text-gray-100">
              <ReactMarkdown components={components}>
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        )}
        
        {/* Message actions */}
        <div className={`mt-3 flex items-center justify-between ${isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleFeedback('like')}
              className={`p-1.5 rounded-full ${feedback === 'like' ? 'text-blue-400 bg-blue-900/30' : 'text-gray-400 hover:bg-gray-700'} transition-colors`}
              aria-label="Like"
            >
              <FiThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleFeedback('dislike')}
              className={`p-1.5 rounded-full ${feedback === 'dislike' ? 'text-red-400 bg-red-900/30' : 'text-gray-400 hover:bg-gray-700'} transition-colors`}
              aria-label="Dislike"
            >
              <FiThumbsDown className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 text-gray-400 hover:bg-gray-700 rounded-full transition-colors"
              aria-label="More options"
            >
              <FiMoreVertical className="w-4 h-4" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10 overflow-hidden">
                <button
                  onClick={() => {
                    setEditedContent(message.content);
                    setIsEditing(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                >
                  <FiEdit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-400 hover:bg-red-900/30 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
