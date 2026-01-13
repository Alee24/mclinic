'use client';

import { FiMessageSquare, FiSearch } from 'react-icons/fi';

export default function MessagesPage() {
    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold dark:text-white">Messages</h1>
                <button className="bg-primary text-black font-bold px-4 py-2 rounded-lg hover:opacity-90 transition text-sm">
                    New Message
                </button>
            </div>

            <div className="flex-1 bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex">
                {/* Sidebar List */}
                <div className="w-80 border-r border-gray-100 dark:border-gray-800 flex flex-col">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="relative">
                            {/* @ts-ignore */}
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                placeholder="Search chats..."
                                className="w-full bg-gray-50 dark:bg-gray-900 rounded-lg pl-10 pr-4 py-2 text-sm outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {/* Placeholder Chat Items */}
                        <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="font-bold text-sm dark:text-white truncate">Dr. Smith</span>
                                        <span className="text-[10px] text-gray-400">12:30 PM</span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">Your appointment is confirmed for tomorrow.</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 bg-primary/5 rounded-lg cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">SA</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="font-bold text-sm dark:text-white truncate">Support Agent</span>
                                        <span className="text-[10px] text-gray-400">Now</span>
                                    </div>
                                    <p className="text-xs text-gray-900 dark:text-gray-300 font-medium truncate">How can we help you today?</p>
                                </div>
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-gray-50/50 dark:bg-[#0a0a0a]/50">
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <FiMessageSquare size={32} />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Select a Conversation</h3>
                        <p className="text-sm max-w-xs">Choose a chat from the left to view messages or start a new conversation.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
