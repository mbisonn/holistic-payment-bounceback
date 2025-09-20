
import { useEffect, useState } from 'react';

const QUOTES = [
  "Success is not the key to happiness. Happiness is the key to success.",
  "Great things never come from comfort zones.",
  "Dream big. Work hard. Stay focused.",
  "Opportunities don't happen. You create them.",
  "Don't watch the clock; do what it does. Keep going.",
  "Your limitation—it's only your imagination.",
  "Push yourself, because no one else is going to do it for you.",
  "Sometimes later becomes never. Do it now.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Dream it. Wish it. Do it."
];

export const MotivationalQuote = () => {
  const [quote, setQuote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [showQuote, setShowQuote] = useState(false);

  useEffect(() => {
    setShowQuote(true);
    const interval = setInterval(() => {
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
      setShowQuote(false);
      setTimeout(() => setShowQuote(true), 300);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`transition-opacity duration-700 ${showQuote ? 'opacity-100' : 'opacity-0'}`}> 
      <div className="flex items-center justify-center py-2">
        <span className="text-lg italic text-purple-700 animate-fade-in-up">{quote}</span>
      </div>
    </div>
  );
};
