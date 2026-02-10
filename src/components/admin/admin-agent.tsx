
"use client";

import { useState } from "react";
import { submitAdminAgentQuery } from "@/lib/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export function AdminAgent() {
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        setResponse("");

        try {
            const result = await submitAdminAgentQuery(query);
            if (result.success && result.response) {
                setResponse(result.response);
            } else {
                setError(result.error || "Sorry, I encountered an error. Please try again.");
            }
        } catch (err) {
            console.error("Admin agent error:", err);
            setError("Sorry, I encountered an error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Admin Assistant
                </CardTitle>
                <CardDescription>
                    Have questions about the admin panel? Ask the AI assistant.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., How do I edit a user's balance?"
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span className="sr-only">Ask</span>
                    </Button>
                </form>

                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {response && (
                     <Alert>
                        <Bot className="h-4 w-4" />
                        <AlertTitle>Response</AlertTitle>
                        <AlertDescription>
                            {response}
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
