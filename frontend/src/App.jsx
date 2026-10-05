import React, { useState, useEffect, useCallback } from 'react';
import { ClerkProvider, SignedIn, SignedOut, ClerkLoading } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ChatContainer from './components/chat/ChatContainer';
import ChatInput from './components/chat/ChatInput';
import ConnectDbModal from './components/modal/ConnectDbModal';
import AuthPage from './components/auth/AuthPage';
import AuthLoading from './components/auth/AuthLoading';
import MissingKeyNotice from './components/auth/MissingKeyNotice';
import { api } from './services/api';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function DataAnalystWorkspace() {
  // Navigation & Modal state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // System & Connection state
  const [backendOnline, setBackendOnline] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [dbConfig, setDbConfig] = useState(null);

  // Conversation history state
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isRefreshingConvs, setIsRefreshingConvs] = useState(false);

  // Active chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuestion, setLastQuestion] = useState(null);

  // Check backend health on mount
  const checkHealth = useCallback(async () => {
    try {
      const res = await api.checkHealth();
      if (res && res.message) {
        setBackendOnline(true);
      }
    } catch {
      setBackendOnline(false);
    }
  }, []);

  // Fetch recent conversations from MongoDB
  const fetchConversations = useCallback(async () => {
    setIsRefreshingConvs(true);
    try {
      const convList = await api.getConversations();
      if (Array.isArray(convList)) {
        setConversations(convList);
      }
    } catch {
      // Backend or MongoDB may be connecting
    } finally {
      setIsRefreshingConvs(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    fetchConversations();

    // Check health periodically every 25 seconds
    const interval = setInterval(checkHealth, 25000);
    return () => clearInterval(interval);
  }, [checkHealth, fetchConversations]);

  // Load a selected conversation
  const handleSelectConversation = async (conversationId) => {
    setError(null);
    setIsLoading(true);
    setActiveConversationId(conversationId);

    try {
      const conv = await api.getConversation(conversationId);
      if (conv && Array.isArray(conv.messages)) {
        setMessages(conv.messages);
      }
    } catch (err) {
      setError(`Failed to load conversation: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Start a fresh analysis
  const handleNewAnalysis = () => {
    setActiveConversationId(null);
    setMessages([]);
    setError(null);
    setInput('');
  };

  // Send question to backend
  const handleSend = async (questionOverride) => {
    const questionToSend = (typeof questionOverride === 'string' ? questionOverride : input).trim();
    if (!questionToSend || isLoading) return;

    setError(null);
    setLastQuestion(questionToSend);
    setInput('');

    // Append user message immediately
    const userMsg = { role: 'user', content: questionToSend };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await api.sendChat({
        question: questionToSend,
        conversation_id: activeConversationId,
      });

      if (response) {
        if (response.conversation_id && !activeConversationId) {
          setActiveConversationId(response.conversation_id);
        }

        const assistantMsg = {
          role: 'assistant',
          content: response.answer,
          intent: response.intent,
          complexity: response.complexity,
          sql_query: response.sql_query,
          sql_queries: response.sql_queries,
          query_result: response.query_result,
          query_results: response.query_results,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        // Refresh conversation history in background
        fetchConversations();
      }
    } catch (err) {
      setError(err.message || 'An error occurred while processing your request.');
    } finally {
      setIsLoading(false);
    }
  };

  // Retry last failed question
  const handleRetry = () => {
    if (lastQuestion) {
      handleSend(lastQuestion);
    }
  };

  // Callback when database is successfully connected
  const handleConnected = (config) => {
    setIsDbConnected(true);
    setDbConfig(config);
    setError(null);
  };

  // Current conversation title
  const currentTitle = conversations.find(
    (c) => c.conversation_id === activeConversationId
  )?.title;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-slate-100 font-sans">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewAnalysis={handleNewAnalysis}
        isDbConnected={isDbConnected}
        dbConfig={dbConfig}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        backendOnline={backendOnline}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background">
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          currentTitle={currentTitle}
          isDbConnected={isDbConnected}
          onOpenConnectModal={() => setIsConnectModalOpen(true)}
          onRefreshConversations={fetchConversations}
          isRefreshing={isRefreshingConvs}
        />

        {/* Chat Feed */}
        <ChatContainer
          messages={messages}
          isLoading={isLoading}
          error={error}
          onRetry={lastQuestion ? handleRetry : null}
          onSelectSuggestion={(q) => handleSend(q)}
          isDbConnected={isDbConnected}
          onOpenConnectModal={() => setIsConnectModalOpen(true)}
        />

        {/* Input Bar */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={() => handleSend()}
          isLoading={isLoading}
          disabled={false}
          placeholder={
            isDbConnected
              ? 'Ask anything about your business data...'
              : 'Ask a question or connect your database...'
          }
        />
      </main>

      {/* Database Connection Dialog */}
      <ConnectDbModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnected={handleConnected}
        initialConfig={dbConfig || {}}
      />
    </div>
  );
}

export default function App() {
  if (!CLERK_PUBLISHABLE_KEY || CLERK_PUBLISHABLE_KEY.startsWith('pk_test_your_')) {
    return <MissingKeyNotice />;
  }

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: dark,
      }}
    >
      <ClerkLoading>
        <AuthLoading />
      </ClerkLoading>

      <SignedOut>
        <AuthPage />
      </SignedOut>

      <SignedIn>
        <DataAnalystWorkspace />
      </SignedIn>
    </ClerkProvider>
  );
}
