"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Users, Globe, User, Wifi, WifiOff } from "lucide-react";
import { useOSStore } from "@/lib/store";
import { useChat } from "@/hooks/useChat";

export default function ChatWindow() {
    const { patientId, patientName } = useOSStore();
    const userId = patientId || `patient-${Date.now()}`;
    const userName = patientName || "Patient";

    const {
        isConnected, globalMessages, privateMessages, onlineUsers,
        typingUsers, sendGlobalMessage, sendPrivateMessage, emitTypingGlobal, emitTypingPrivate,
    } = useChat(userId, userName);

    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeChatUser = onlineUsers.find(u => u.usn === activeChat);
    const currentMessages = activeChat ? (privateMessages[activeChat] || []) : globalMessages;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [currentMessages]);

    const handleSend = () => {
        if (!message.trim()) return;
        if (activeChat) {
            sendPrivateMessage(activeChat, message.trim());
        } else {
            sendGlobalMessage(message.trim());
        }
        setMessage("");
    };

    const handleTyping = () => {
        if (activeChat) {
            emitTypingPrivate(activeChat);
        } else {
            emitTypingGlobal();
        }
    };

    return (
        <div className="flex h-full bg-[#020408] text-white overflow-hidden rounded-xl">
            {/* Users Sidebar */}
            <div className="w-56 border-r border-white/5 flex flex-col bg-[#040810]">
                {/* Connection Status */}
                <div className="p-4 border-b border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        {isConnected ? <Wifi className="w-3 h-3 text-green-400" /> : <WifiOff className="w-3 h-3 text-red-400" />}
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                            {isConnected ? "Online" : "Connecting..."}
                        </span>
                    </div>
                    <p className="text-[10px] text-white/40 font-medium">Logged in as {userName}</p>
                </div>

                {/* Global Chat */}
                <button onClick={() => setActiveChat(null)}
                    className={`flex items-center gap-3 px-4 py-3 text-left transition-all ${!activeChat ? "bg-blue-500/10 border-l-2 border-blue-500" : "hover:bg-white/3 border-l-2 border-transparent"}`}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-white">Global Chat</p>
                        <p className="text-[9px] text-white/30">{globalMessages.length} messages</p>
                    </div>
                </button>

                {/* Online Users */}
                <div className="flex-1 overflow-y-auto">
                    <div className="flex items-center gap-2 px-4 py-2">
                        <Users className="w-3 h-3 text-white/20" />
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20">
                            Online ({onlineUsers.length})
                        </p>
                    </div>
                    {onlineUsers.map(user => (
                        <button key={user.usn} onClick={() => setActiveChat(user.usn)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${activeChat === user.usn
                                ? "bg-purple-500/10 border-l-2 border-purple-500"
                                : "hover:bg-white/3 border-l-2 border-transparent"}`}>
                            <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-[10px] font-bold text-purple-400">
                                {user.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-white truncate">{user.name}</p>
                                {typingUsers.has(user.usn) && (
                                    <p className="text-[8px] text-blue-400 animate-pulse">typing...</p>
                                )}
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 ml-auto shrink-0" />
                        </button>
                    ))}
                    {onlineUsers.length === 0 && (
                        <div className="text-center py-8 px-4">
                            <User className="w-6 h-6 text-white/10 mx-auto mb-2" />
                            <p className="text-[10px] text-white/15">No one else online</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3 bg-[#060a12]/50 backdrop-blur-md">
                    {activeChat ? (
                        <>
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-[11px] font-bold text-purple-400">
                                {activeChatUser?.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div>
                                <p className="text-xs font-black">{activeChatUser?.name || activeChat}</p>
                                <p className="text-[9px] text-white/30">Private message</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <Globe className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-black">Global Chat</p>
                                <p className="text-[9px] text-white/30">Talk with doctors and patients</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {currentMessages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <MessageCircle className="w-12 h-12 text-white/5 mb-3" />
                            <p className="text-xs text-white/20 font-semibold">No messages yet</p>
                            <p className="text-[10px] text-white/10 mt-1">
                                {activeChat ? "Start a private conversation" : "Say hello to the community!"}
                            </p>
                        </div>
                    )}
                    {currentMessages.map((msg, i) => {
                        const isMine = msg.senderUsn === userId;
                        return (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${isMine
                                    ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/20"
                                    : "bg-white/5 border border-white/5"}`}>
                                    {!isMine && (
                                        <p className="text-[9px] font-bold text-purple-400 mb-1">{msg.senderName}</p>
                                    )}
                                    <p className="text-xs text-white/80 leading-relaxed">{msg.message}</p>
                                    <p className="text-[8px] text-white/20 mt-1 text-right">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/5 bg-[#060a12]/30">
                    <div className="flex items-center gap-3">
                        <input
                            value={message}
                            onChange={e => { setMessage(e.target.value); handleTyping(); }}
                            onKeyDown={e => e.key === "Enter" && handleSend()}
                            placeholder={activeChat ? `Message ${activeChatUser?.name || "user"}...` : "Type a message..."}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 outline-none focus:border-blue-500/40 transition-colors"
                            disabled={!isConnected}
                        />
                        <button onClick={handleSend} disabled={!message.trim() || !isConnected}
                            className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white hover:from-blue-400 hover:to-cyan-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
