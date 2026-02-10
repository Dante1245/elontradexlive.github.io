
"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Loader2, Send, Sparkles, User, X } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { submitSupportMessage } from "@/lib/actions";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "bot";
  text: string;
}

export function SupportBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
        setMessages([
            { role: "bot", text: "Hello! I'm Xavier, your AI assistant for ElonTradeX. How can I help you today?" }
        ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
        const result = await submitSupportMessage({ message: input });
        if (result.success && result.response) {
            const botMessage: Message = { role: "bot", text: result.response };
            setMessages((prev) => [...prev, botMessage]);
        } else {
            const errorMessage: Message = { role: "bot", text: result.error || "Sorry, I'm having trouble connecting. Please try again later." };
            setMessages((prev) => [...prev, errorMessage]);
        }
    } catch (error) {
        console.error("Support bot error:", error);
        const errorMessage: Message = { role: "bot", text: "Sorry, I'm having trouble connecting. Please try again later." };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50 bg-primary/80 backdrop-blur-sm hover:bg-primary"
        onClick={() => setIsOpen(true)}
        aria-label="Open support chat"
      >
        <Sparkles className="h-6 w-6 absolute animate-ping opacity-75" />
        <Bot className="h-7 w-7" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md p-0 flex flex-col h-[70vh]">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                <span>ElonTradeX Support</span>
            </DialogTitle>
             <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 h-6 w-6"
                onClick={() => setIsOpen(false)}
             >
                <X className="h-4 w-4" />
             </Button>
          </DialogHeader>

          <ScrollArea className="flex-1" viewportRef={scrollAreaRef}>
            <div className="space-y-6 p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "bot" && (
                    <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-primary/20"><Bot className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                  )}
                   <div className={cn(
                       "max-w-[80%] rounded-xl px-4 py-2 text-sm",
                       message.role === 'user' 
                       ? 'bg-primary text-primary-foreground'
                       : 'bg-muted'
                   )}>
                       <p>{message.text}</p>
                   </div>
                  {message.role === "user" && (
                     <Avatar className="h-8 w-8">
                       <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3 justify-start">
                     <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-primary/20"><Bot className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-xl px-4 py-3">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                 </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1"
                disabled={isLoading}
                autoComplete="off"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
