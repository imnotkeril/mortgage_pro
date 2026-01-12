import React, { useState, useRef, useEffect, useContext } from 'react';
import { aiChat } from '../../api';
import { AppContext } from '../../contexts/AppContext';
import Loader from '../common/Loader';

const AIChatbot = () => {
  const { darkMode } = useContext(AppContext);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your AI mortgage advisor. Ask me any questions about calculations, loan terms, or financial planning.',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // Get calculator data from context if available
      const calculatorData = {}; // Can be extended to get from context
      
      const response = await aiChat(inputMessage, calculatorData);
      
      if (response.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: response.response,
          },
        ]);
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, an error occurred: ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-[#0D1015]' : 'bg-gray-50'}`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? darkMode
                    ? 'bg-[#BF9FFB] text-[#0D1015]'
                    : 'bg-purple-600 text-white'
                  : darkMode
                  ? 'bg-[#2A2E39] text-[#D1D4DC]'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                darkMode ? 'bg-[#2A2E39]' : 'bg-white border border-gray-200'
              }`}
            >
              <Loader />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div
        className={`border-t p-4 ${
          darkMode ? 'border-[#2A2E39]' : 'border-gray-200'
        }`}
      >
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about mortgages..."
            rows={2}
            className={`flex-1 p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none ${
              darkMode
                ? 'bg-[#0D1015] border border-[#2A2E39] text-white placeholder-gray-500'
                : 'bg-white border border-gray-300 text-gray-800 placeholder-gray-400'
            }`}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || loading}
            className={`px-6 py-2 rounded font-medium transition-colors ${
              !inputMessage.trim() || loading
                ? darkMode
                  ? 'bg-[#2A2E39] text-gray-500 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : darkMode
                ? 'bg-[#BF9FFB] text-[#0D1015] hover:bg-[#A88FE8]'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
