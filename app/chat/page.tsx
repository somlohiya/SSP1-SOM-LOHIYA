'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MessageCircle, Send, Plus, Search, 
  MoreVertical, Trash2, Edit2, Pin, Download, 
  Copy, RefreshCw, Sparkles, Brain, Bot, User, X
} from 'lucide-react';
import { chatAPI } from '@/lib/api';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface Conversation {
  _id?: string;
  conversationId: string;
  title: string;
  messages: Message[];
  pinned?: boolean;
  updatedAt?: string;
}

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const stagger: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

export default function ChatPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(0);
  const activeChatId = useRef<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const currentId = activeConversation?.conversationId || null;
    const currentLength = activeConversation?.messages?.length || 0;
    
    // If we switched conversations or loaded for the first time, do not auto-scroll
    if (activeChatId.current !== currentId) {
      activeChatId.current = currentId;
      prevMessagesLength.current = currentLength;
      return;
    }

    // Only scroll if we are sending or received a new message
    if (sending || currentLength > prevMessagesLength.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLength.current = currentLength;
  }, [activeConversation?.messages, activeConversation?.conversationId, sending]);

  const loadConversations = async () => {
    try {
      const data: Conversation[] = await chatAPI.getConversations();
      const normalized = data.map((c) => ({ ...c, messages: c.messages || [], pinned: false }));
      setConversations(normalized);
      if (normalized.length > 0) {
        setActiveConversation(normalized[0]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      const raw = await chatAPI.createConversation(undefined, 'New Chat');
      const data = raw.chatHistory || raw;
      const newConversation: Conversation = { ...data, messages: data.messages || [], pinned: false };
      
      setConversations((prev) => [newConversation, ...prev]);
      setActiveConversation(newConversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await chatAPI.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.conversationId !== id));
      if (activeConversation?.conversationId === id) {
        setActiveConversation(conversations.length > 1 ? conversations.find(c => c.conversationId !== id) || null : null);
      }
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const togglePin = (id: string) => {
    setConversations(prev => prev.map(c => c.conversationId === id ? { ...c, pinned: !c.pinned } : c));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation || sending) return;

    const userMessage = messageInput;
    setMessageInput('');
    setSending(true);

    try {
      const raw = await chatAPI.sendMessage(activeConversation.conversationId, 'user', userMessage);
      const data = raw.conversation || raw;
      const updated: Conversation = { ...data, messages: data.messages || [] };
      
      setActiveConversation(updated);
      setConversations((prev) => prev.map((c) => (c.conversationId === updated.conversationId ? updated : c)));
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.messages?.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinnedConversations = filteredConversations.filter(c => c.pinned);
  const unpinnedConversations = filteredConversations.filter(c => !c.pinned);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-slate-200 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-200 flex flex-col relative overflow-hidden selection:bg-indigo-500/30">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000 pointer-events-none" />

      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-xl z-50">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition text-sm font-bold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-400 px-3 py-1 rounded-full bg-white/5 border border-white/10">Premium AI</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden max-w-screen-2xl w-full mx-auto p-4 gap-4 z-10">
        
        {/* Sidebar */}
        <div className="w-80 flex flex-col bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl overflow-hidden shrink-0 hidden md:flex">
          <div className="p-5 border-b border-white/10 space-y-4">
            <button
              onClick={handleCreateConversation}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] flex items-center justify-center gap-2 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> New Chat
            </button>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
            
            {pinnedConversations.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Pinned</p>
                <div className="space-y-1">
                  {pinnedConversations.map(conv => (
                    <ConversationItem 
                      key={conv.conversationId} 
                      conv={conv} 
                      activeId={activeConversation?.conversationId} 
                      onClick={() => setActiveConversation(conv)}
                      onPin={() => togglePin(conv.conversationId)}
                      onDelete={() => setDeleteConfirmId(conv.conversationId)}
                    />
                  ))}
                </div>
              </div>
            )}

            {unpinnedConversations.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Recent</p>
                <div className="space-y-1">
                  {unpinnedConversations.map(conv => (
                    <ConversationItem 
                      key={conv.conversationId} 
                      conv={conv} 
                      activeId={activeConversation?.conversationId} 
                      onClick={() => setActiveConversation(conv)}
                      onPin={() => togglePin(conv.conversationId)}
                      onDelete={() => setDeleteConfirmId(conv.conversationId)}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredConversations.length === 0 && (
              <div className="text-center p-4 text-slate-500 text-sm">
                No conversations found.
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl flex flex-col relative overflow-hidden">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/20 shrink-0 z-10">
                <div className="flex items-center gap-3">
                  <h2 className="font-bold text-white truncate max-w-sm">{activeConversation.title}</h2>
                  {activeConversation.pinned && <Pin className="w-3 h-3 text-indigo-400" />}
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition" title="Export PDF">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteConfirmId(activeConversation.conversationId)} className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition" title="Clear Chat">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-0">
                {(activeConversation.messages?.length || 0) === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                      <Sparkles className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">How can I help you study?</h3>
                    <p className="text-slate-400 mb-8">Ask a question, request a summary, or let's start a quiz.</p>
                    
                    <div className="grid gap-3 w-full">
                      {["Explain Newton's Laws simply", "Create a 5-question quiz", "Summarize my syllabus"].map((suggestion) => (
                        <button 
                          key={suggestion}
                          onClick={() => setMessageInput(suggestion)}
                          className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 text-slate-300 text-sm text-left transition"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {(activeConversation.messages || []).map((message, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={message.id || i}
                        className={`flex gap-4 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${message.sender === 'user' ? 'bg-indigo-600' : 'bg-fuchsia-600'}`}>
                          {message.sender === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                        </div>
                        
                        {/* Bubble */}
                        <div className={`max-w-[75%] group ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`p-4 rounded-2xl ${message.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white/10 border border-white/10 text-slate-200 rounded-tl-sm'}`}>
                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          </div>
                          
                          <div className={`flex items-center gap-3 mt-2 px-1 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-xs text-slate-500">{new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            {message.sender !== 'user' && (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button className="text-slate-500 hover:text-slate-300"><Copy className="w-3.5 h-3.5" /></button>
                                <button className="text-slate-500 hover:text-slate-300"><RefreshCw className="w-3.5 h-3.5" /></button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {sending && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 flex-row">
                        <div className="w-10 h-10 rounded-full bg-fuchsia-600 flex items-center justify-center shrink-0">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-white/10 border border-white/10 rounded-2xl rounded-tl-sm p-4 flex gap-1.5 items-center">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-black/20 border-t border-white/10 shrink-0">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-end gap-2 bg-white/5 border border-white/10 p-2 rounded-2xl focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
                  <textarea
                    rows={1}
                    placeholder="Message AI Tutor..."
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    className="flex-1 bg-transparent border-none text-white px-3 py-2.5 focus:ring-0 resize-none max-h-[150px] custom-scrollbar placeholder:text-slate-500 text-sm md:text-base"
                    style={{ minHeight: '44px' }}
                  />
                  <button 
                    type="submit" 
                    disabled={sending || !messageInput.trim()} 
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 disabled:hover:bg-indigo-600 transition shrink-0 mb-0.5"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
                <div className="text-center mt-2">
                  <span className="text-[10px] text-slate-500">AI Tutor can make mistakes. Consider verifying important information.</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <Brain className="w-16 h-16 text-slate-700 mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">No Active Chat</h2>
              <p className="text-slate-400 mb-8 max-w-sm">Select a conversation from the sidebar or start a new one to begin learning.</p>
              <button onClick={handleCreateConversation} className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center gap-2">
                <Plus className="w-5 h-5" /> Start New Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#131825] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Chat?</h3>
              <p className="text-slate-400 text-sm mb-6">This action cannot be undone. The conversation history will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white font-medium transition">
                  Cancel
                </button>
                <button onClick={() => handleDeleteConversation(deleteConfirmId)} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// Subcomponent for Conversation Sidebar Item
function ConversationItem({ conv, activeId, onClick, onPin, onDelete }: { conv: Conversation, activeId?: string, onClick: () => void, onPin: () => void, onDelete: () => void }) {
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        className={`w-full flex flex-col items-start p-3 rounded-xl transition-all ${
          activeId === conv.conversationId
            ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-100'
            : 'bg-transparent border border-transparent hover:bg-white/5 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-2 w-full mb-1">
          <MessageCircle className={`w-4 h-4 shrink-0 ${activeId === conv.conversationId ? 'text-indigo-400' : 'text-slate-500'}`} />
          <span className="font-semibold text-sm truncate flex-1 text-left">{conv.title}</span>
        </div>
        <span className={`text-[10px] pl-6 ${activeId === conv.conversationId ? 'text-indigo-300' : 'text-slate-500'}`}>
          {conv.messages?.length || 0} messages
        </span>
      </button>

      {/* Hover Actions */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#131825]/90 rounded-lg p-1 backdrop-blur-sm">
        <button onClick={(e) => { e.stopPropagation(); onPin(); }} className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white" title={conv.pinned ? "Unpin" : "Pin"}>
          <Pin className={`w-3.5 h-3.5 ${conv.pinned ? 'fill-indigo-400 text-indigo-400' : ''}`} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400" title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
