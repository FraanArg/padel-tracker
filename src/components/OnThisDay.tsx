'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';

export default function OnThisDay() {
    const [event, setEvent] = useState<{ year: number, text: string } | null>(null);

    useEffect(() => {
        // Mock data for now - in real app would query DB/Archive
        const events = [
            { year: 2023, text: "Coello/Tapia won their 5th consecutive title in Brussels" },
            { year: 2022, text: "Lebron/Galan defeated Di Nenno/Navarro in a 3-hour epic" },
            { year: 2021, text: "Bela/Sanyo claimed the Madrid Master title" }
        ];
        setEvent(events[Math.floor(Math.random() * events.length)]);
    }, []);

    if (!event) return null;

    return (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Calendar className="w-24 h-24 transform rotate-12" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-2 opacity-80">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">On This Day &bull; {event.year}</span>
                </div>

                <h3 className="text-lg font-bold leading-snug mb-4 pr-8">
                    {event.text}
                </h3>

                <div className="flex items-center text-sm font-medium opacity-90 group-hover:translate-x-1 transition-transform">
                    View Match <ChevronRight className="w-4 h-4 ml-1" />
                </div>
            </div>
        </div>
    );
}
