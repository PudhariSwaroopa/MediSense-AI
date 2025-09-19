export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
}
