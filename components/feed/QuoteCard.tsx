import React from 'react';
import { QuoteFeedItem } from '../../types';

interface QuoteCardProps {
  item: QuoteFeedItem;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ item }) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-8 mb-4 border border-gray-200">
      {/* Quote mark */}
      <div className="text-6xl text-gray-300 leading-none mb-4 font-serif">"</div>

      {/* Quote text */}
      <p className="text-gray-900 text-lg leading-relaxed mb-6">
        {item.quote}
      </p>

      {/* Author and year */}
      <div className="text-gray-600 text-sm font-medium">
        {item.author}{item.year && `, ${item.year}`}
      </div>
    </div>
  );
};
