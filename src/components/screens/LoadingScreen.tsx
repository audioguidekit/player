import React from 'react';
import { MobileFrame } from '../../../components/shared/MobileFrame';
import { useTranslation } from '../../translations';

export const LoadingScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <MobileFrame>
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto mb-4"></div>
          <p className="text-zinc-600">{t.loading.tourData}</p>
        </div>
      </div>
    </MobileFrame>
  );
};
