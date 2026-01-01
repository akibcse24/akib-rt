"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Sparkles } from "lucide-react";
import { Button } from "./ui/Button";
import { useAuth } from "@/context/AuthContext";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const PWAInstallPrompt: React.FC = () => {
    const { user } = useAuth();
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Only show for logged in users
        if (!user) return;

        // Check if already installed
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsInstalled(true);
            return;
        }

        // Check if user dismissed recently
        const dismissedAt = localStorage.getItem("pwa-install-dismissed");
        if (dismissedAt) {
            const daysSinceDismiss = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
            if (daysSinceDismiss < 7) return; // Don't show for 7 days after dismiss
        }

        // Listen for the install prompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show prompt after a delay (let user explore first)
            setTimeout(() => setShowPrompt(true), 5000);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Detect successful installation
        window.addEventListener("appinstalled", () => {
            setShowPrompt(false);
            setIsInstalled(true);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, [user]);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setShowPrompt(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    };

    if (isInstalled || !showPrompt || !deferredPrompt) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50 animate-in slide-in-from-bottom-4 duration-500">
            <div className="relative rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 p-[1px] shadow-2xl shadow-purple-500/30">
                <div className="rounded-2xl bg-background/95 backdrop-blur-xl p-4">
                    {/* Close button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>

                        <div className="flex-1 pr-6">
                            <h4 className="font-bold text-foreground mb-1">Install Routine Tracker</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                                Install for faster access, offline support, and notification reminders!
                            </p>

                            <Button
                                onClick={handleInstall}
                                className="w-full h-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm rounded-xl border-0 hover:scale-[1.02] transition-transform"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Install App
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
