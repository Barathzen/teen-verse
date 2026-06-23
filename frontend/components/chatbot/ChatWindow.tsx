"use client";

import { FormEvent, useRef, useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/FormElements";
import { Error } from "@/components/common/Loading";
import { chatbotService } from "@/services/index";
import { useChatbotStore } from "@/store/chatbotStore";
import { MessageCircle, Settings } from "lucide-react";
import { Modal } from "@/components/common/FormElements";
import ReactMarkdown from "react-markdown";

export const ChatWindow: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, addMessage, isLoading, setLoading, setError, error } = useChatbotStore();
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [personalization, setPersonalization] = useState({
    name: "User",
    ageGroup: "teen",
    tone: "supportive",
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load saved personalization
    const saved = localStorage.getItem("chatbotPersonalization");
    if (saved) {
      setPersonalization(JSON.parse(saved));
    }
  }, []);

  const handleSavePersonalization = () => {
    localStorage.setItem("chatbotPersonalization", JSON.stringify(personalization));
    setShowSettings(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message
    addMessage("user", userMessage);

    // Send to chatbot
    setLoading(true);
    setError(null);

    try {
      // Build personalized prompt
      const personalizedPrompt = `[Personalization: Name: ${personalization.name}, Age Group: ${personalization.ageGroup}, Tone: ${personalization.tone}] ${userMessage}`;

      const response = await chatbotService.sendMessage(personalizedPrompt);
      addMessage("assistant", response.reply);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] space-y-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle size={32} /> Mental Health Coach
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Personalized support and guidance</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2"
        >
          <Settings size={18} /> Personalize
        </Button>
      </div>

      {/* Chat Container */}
      <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-[#1a1d2e] rounded-2xl border dark:border-gray-800 shadow-sm overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <MessageCircle size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Welcome to TeenVerse Coach!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Ask me anything about mental health, stress, or wellbeing.
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
                    }`}
                  >
                    <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 last:mb-0" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 last:mb-0" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        msg.role === "user" ? "text-blue-100" : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg rounded-bl-none">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {error && <Error message={error} />}

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t dark:border-gray-700 p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={!input.trim() || isLoading}
              className="px-6"
            >
              Send
            </Button>
          </div>
        </form>
      </div>

      {/* Personalization Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Personalize Your Coach"
        actions={
          <>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePersonalization}>Save Changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Your Name"
            value={personalization.name}
            onChange={(e) =>
              setPersonalization({ ...personalization, name: e.target.value })
            }
            placeholder="Enter your name"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Age Group
            </label>
            <select
              value={personalization.ageGroup}
              onChange={(e) =>
                setPersonalization({ ...personalization, ageGroup: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            >
              <option value="teen">13-15</option>
              <option value="teen-older">16-18</option>
              <option value="young-adult">19-25</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred Tone
            </label>
            <select
              value={personalization.tone}
              onChange={(e) =>
                setPersonalization({ ...personalization, tone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            >
              <option value="supportive">Supportive &amp; Caring</option>
              <option value="direct">Direct &amp; Practical</option>
              <option value="friendly">Friendly &amp; Casual</option>
              <option value="professional">Professional &amp; Clinical</option>
            </select>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            These settings help personalize the coach&apos;s responses to better suit your needs.
          </p>
        </div>
      </Modal>
    </div>
  );
};
