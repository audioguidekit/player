import React, { memo } from 'react';
import { TextStop } from '../../types';

interface TextCardProps {
  item: TextStop;
}

export const TextCard = memo<TextCardProps>(({ item }) => {
  return (
    <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100">
      <p className="text-gray-700 leading-relaxed">{item.content}</p>
    </div>
  );
});
