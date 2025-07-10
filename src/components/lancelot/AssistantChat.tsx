"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@mui/material";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm Lancelot. How can I help you with your Web3 freelancing journey today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate AI response (replace with real API call)
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        {
          role: "assistant",
          content:
            "I'm here to help! (This is a demo. Integrate with your AI backend for real responses.)"
        }
      ]);
      setLoading(false);
    }, 1200);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      sendMessage();
    }
  };

  return (
    <Card className="w-full bg-muted/40 border-none shadow-none">
      <CardContent className="p-0">
        <div
          style={{
            maxHeight: 320,
            overflowY: "auto",
            padding: "1rem 0",
            marginBottom: "1rem",
            background: "transparent"
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-2 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-lg px-3 py-2 max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="flex gap-2">
          <Input
            fullWidth
            placeholder="Type your question…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            disabled={loading}
            sx={{
              flex: 1,
              background: "#fff",
              borderRadius: 2,
              fontSize: 16,
              px: 2,
              py: 1,
            }}
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            variant="default"
          >
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
