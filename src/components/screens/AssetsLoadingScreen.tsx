import React from 'react';
import { MobileFrame } from '../../../components/shared/MobileFrame';
import { useTranslation } from '../../translations';

export const AssetsLoadingScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <MobileFrame>
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center p-8">
          <div className="mb-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-zinc-200 border-t-zinc-900"></div>
          </div>
          <p className="text-zinc-900 text-lg font-medium">{t.loading.preparing}</p>
          <p className="text-zinc-600 text-sm mt-2">{t.loading.audio}</p>
        </div>
      </div>
    </MobileFrame>
  );
};
