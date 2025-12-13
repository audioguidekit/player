import React from 'react';
import { MobileFrame } from '../../../components/shared/MobileFrame';
import { useTranslation } from '../../translations';

interface ErrorScreenProps {
  error?: Error | null;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ error }) => {
  const { t } = useTranslation();

  return (
    <MobileFrame>
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <h2 className="text-xl font-bold text-red-600 mb-2">{t.errors.loadFailed}</h2>
          <p className="text-zinc-600 mb-4">
            {error?.message || t.errors.tourLoadFailed}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg"
          >
            {t.errors.retry}
          </button>
        </div>
      </div>
    </MobileFrame>
  );
};
