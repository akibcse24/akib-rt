"use client";

import React, { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, CloudRain, Wind, Coffee, Music } from "lucide-react";
import { cn } from "@/components/ui/Button";

// Using online placeholders for demonstration. 
// Ideally these would be local assets or a reliable CDN.
const SOUNDS = [
    { id: "rain", label: "Rain", icon: CloudRain, src: "https://assets.mixkit.co/active_storage/sfx/2498/2498-preview.mp3" }, // Soft rain
    { id: "forest", label: "Forest", icon: Wind, src: "https://assets.mixkit.co/active_storage/sfx/2485/2485-preview.mp3" }, // Birds/Forest
    { id: "coffee", label: "Cafe", icon: Coffee, src: "https://assets.mixkit.co/active_storage/sfx/2475/2475-preview.mp3" }, // Ambience
    { id: "lofi", label: "Lo-Fi", icon: Music, src: "https://assets.mixkit.co/active_storage/sfx/274/274-preview.mp3" }, // Placeholder beat
];

export function AmbientPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSound, setCurrentSound] = useState(SOUNDS[0]);
    const [volume, setVolume] = useState(0.5);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        }
        setIsPlaying(!isPlaying);
    };

    const changeSound = (sound: typeof SOUNDS[0]) => {
        const wasPlaying = isPlaying;
        setCurrentSound(sound);
        setIsPlaying(false); // Reset state temporarily

        // Allow React to update ref src then play
        setTimeout(() => {
            if (wasPlaying && audioRef.current) {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }, 0);
    };

    return (
        <div className="w-full max-w-sm rounded-[2rem] bg-white/[0.03] border border-white/10 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Music className="w-4 h-4 text-purple-400" />
                    Ambient Sound
                </h3>
                <button
                    onClick={togglePlay}
                    className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center transition-all",
                        isPlaying ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25 animate-pulse" : "bg-white/10 text-muted-foreground hover:bg-white/20"
                    )}
                >
                    {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
                {SOUNDS.map((sound) => {
                    const Icon = sound.icon;
                    const isActive = currentSound.id === sound.id;
                    return (
                        <button
                            key={sound.id}
                            onClick={() => changeSound(sound)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all border",
                                isActive
                                    ? "bg-purple-500/20 border-purple-500/50 text-purple-200"
                                    : "bg-white/5 border-transparent text-muted-foreground hover:bg-white/10"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive && "text-purple-400")} />
                            <span className="text-[10px] font-medium">{sound.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center gap-3 bg-black/20 rounded-xl p-2 px-3">
                <Volume2 className="w-4 h-4 text-muted-foreground/50" />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
                />
            </div>

            <audio
                ref={audioRef}
                src={currentSound.src}
                loop
                className="hidden"
            />
        </div>
    );
}
