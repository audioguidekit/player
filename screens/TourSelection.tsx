import React, { useMemo, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { GB, CZ, DE, FR, IT, ES } from 'country-flag-icons/react/3x2';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import tw from 'twin.macro';
import styled from 'styled-components';
import { Language } from '../types';
import { MobileFrame } from '../components/shared/MobileFrame';
import { TourSelectionCard } from '../components/TourSelectionCard';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { GlobalStyles } from '../src/theme/GlobalStyles';
import { TranslationProvider, useTranslation } from '../src/translations';
import { LoadingScreen } from '../src/components/screens/LoadingScreen';
import { useLanguages } from '../hooks/useDataLoader';
import { useLanguageSelection } from '../hooks/useLanguageSelection';
import { getAllTours, getAvailableTourIds, getTourWithFallback } from '../src/services/tourDiscovery';
import { defaultLanguage } from '../src/config/languages';
import { storageService } from '../src/services/storageService';
import { useHaptics } from '../src/hooks/useHaptics';

const LanguageSheet = lazy(() =>
  import('../components/sheets/LanguageSheet').then(m => ({ default: m.LanguageSheet }))
);

const flagComponents: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  GB, CZ, DE, FR, IT, ES,
};

const Screen = styled.div`
  ${tw`relative w-full h-full flex flex-col overflow-hidden`}
  background-color: ${({ theme }) => theme.mainContent.backgroundColor};
`;

const Header = styled.div`
  ${tw`flex items-start justify-between gap-3 px-5 pb-4`}
  padding-top: calc(env(safe-area-inset-top, 0px) + 1.25rem);
`;

const TitleBlock = styled.div`
  ${tw`flex-1 min-w-0`}
`;

const Title = styled.h1`
  ${tw`tracking-tight`}
  font-family: ${({ theme }) =>
    theme?.typography?.fontFamily?.heading?.join(', ') ||
    theme?.typography?.fontFamily?.sans?.join(', ')};
  font-size: ${({ theme }) => theme.startCard.titleFontSize};
  font-weight: ${({ theme }) => theme.startCard.titleFontWeight};
  line-height: ${({ theme }) => theme.startCard.titleLineHeight};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Subtitle = styled.p`
  ${tw`mt-1`}
  font-family: ${({ theme }) => theme?.typography?.fontFamily?.sans?.join(', ')};
  font-size: ${({ theme }) => theme.startCard.descriptionFontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LanguageButton = styled.button`
  ${tw`shrink-0 rounded-full flex items-center gap-2 transition-all active:scale-95`}
  height: 44px;
  padding: 0 12px;
  background-color: ${({ theme }) => theme.cards.backgroundColor};
  border: 1px solid ${({ theme }) => theme.cards.borderColor};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const LanguageFlag = styled.div`
  ${tw`flex items-center justify-center`}
  width: 28px;
  height: 19px;
  border-radius: 6px;
  overflow: hidden;

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

const ScrollArea = styled.div`
  ${tw`flex-1 overflow-y-auto px-5 pt-1`}
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 2rem);
`;

const List = styled.div`
  ${tw`flex flex-col gap-4`}
`;

interface TourSelectionContentProps {
  languages: Language[];
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  frameless?: boolean;
}

const TourSelectionContent: React.FC<TourSelectionContentProps> = ({
  languages,
  selectedLanguage,
  onSelectLanguage,
  frameless = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const triggerHaptic = useHaptics();
  const [isLanguageSheetOpen, setIsLanguageSheetOpen] = useState(false);

  const tours = useMemo(() => getAllTours(selectedLanguage.code), [selectedLanguage.code]);

  const FlagIcon = flagComponents[selectedLanguage.countryCode] || GB;

  const handleSelectTour = (tourId: string) => {
    navigate(`/tour/${tourId}?lang=${selectedLanguage.code}`);
  };

  // Inside the push/pop stack the device frame is shared (owned by RootNavigator).
  const Frame = frameless ? React.Fragment : MobileFrame;

  return (
    <Frame>
      <Screen>
        <Header>
          <TitleBlock>
            <Title>{t.tourSelection.title}</Title>
            <Subtitle>{t.tourSelection.subtitle}</Subtitle>
          </TitleBlock>
          {languages.length > 1 && (
            <LanguageButton
              onClick={() => {
                triggerHaptic();
                setIsLanguageSheetOpen(true);
              }}
            >
              <LanguageFlag>
                <FlagIcon />
              </LanguageFlag>
              <CaretDownIcon size={14} weight="bold" />
            </LanguageButton>
          )}
        </Header>

        <ScrollArea>
          <List>
            {tours.map(tour => (
              <TourSelectionCard
                key={tour.id}
                tour={tour}
                onClick={() => handleSelectTour(tour.id)}
              />
            ))}
          </List>
        </ScrollArea>
      </Screen>

      <Suspense fallback={null}>
        <LanguageSheet
          isOpen={isLanguageSheetOpen}
          onClose={() => setIsLanguageSheetOpen(false)}
          selectedLanguage={selectedLanguage}
          languages={languages}
          onSelect={lang => {
            onSelectLanguage(lang);
            setIsLanguageSheetOpen(false);
          }}
        />
      </Suspense>
    </Frame>
  );
};

/**
 * Tour selection landing screen.
 *
 * Lists every tour discovered in src/data/tour/ as a card. Selecting a card
 * routes to /tour/:tourId (the existing single-tour experience). When only one
 * tour exists the screen is skipped entirely and we redirect straight into it,
 * preserving the original single-tour behavior.
 */
export const TourSelection: React.FC<{ frameless?: boolean }> = ({ frameless = false }) => {
  const navigate = useNavigate();
  const { data: languages, loading } = useLanguages();
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  useLanguageSelection({ languages, selectedLanguage, setSelectedLanguage });

  const tourIds = getAvailableTourIds();
  const lang = selectedLanguage?.code || defaultLanguage;
  const firstTourId = tourIds[0];
  // Theme the picker after the first tour (only that tour is needed, not all of them).
  const themeId = useMemo(
    () => getTourWithFallback(firstTourId, lang)?.themeId || 'default-light',
    [firstTourId, lang]
  );

  const handleSelectLanguage = (language: Language) => {
    storageService.setPreferences({ selectedLanguage: language.code });
    setSelectedLanguage(language);
  };

  // Single-tour deployments skip the picker and open the tour directly.
  if (tourIds.length <= 1) {
    return <RedirectToTour tourId={tourIds[0]} navigate={navigate} />;
  }

  if (loading || !languages || !selectedLanguage) {
    return (
      <ThemeProvider themeId={themeId}>
        <GlobalStyles />
        <TranslationProvider language={lang}>
          <LoadingScreen />
        </TranslationProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider themeId={themeId}>
      <GlobalStyles />
      <TranslationProvider language={selectedLanguage.code}>
        <TourSelectionContent
          languages={languages}
          selectedLanguage={selectedLanguage}
          frameless={frameless}
          onSelectLanguage={handleSelectLanguage}
        />
      </TranslationProvider>
    </ThemeProvider>
  );
};

// Tiny helper so the redirect runs as an effect (avoids navigating during render).
const RedirectToTour: React.FC<{ tourId?: string; navigate: ReturnType<typeof useNavigate> }> = ({
  tourId,
  navigate,
}) => {
  React.useEffect(() => {
    navigate(`/tour/${tourId ?? ''}`, { replace: true });
  }, [tourId, navigate]);
  return null;
};
