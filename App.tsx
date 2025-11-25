import React, { useState } from 'react';
import { AnimatePresence, useMotionValue } from 'framer-motion';
import { MOCK_TOUR, LANGUAGES } from './constants';
import { SheetType, Language } from './types';
import { RatingSheet } from './components/sheets/RatingSheet';
import { LanguageSheet } from './components/sheets/LanguageSheet';
import { StartScreen } from './screens/StartScreen';
import { DetailScreen } from './screens/DetailScreen';
import { ActivePlayerScreen } from './screens/ActivePlayerScreen';
import { MainSheet } from './components/MainSheet';
import { StartCard } from './components/StartCard';
import { MiniPlayer } from './components/MiniPlayer';

const App: React.FC = () => {
  // Navigation & State
  const [showActivePlayer, setShowActivePlayer] = useState(false);
  const [activeSheet, setActiveSheet] = useState<SheetType>('NONE');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[1]); // Default English
  
  // Main Sheet State (Collapsed vs Expanded)
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  
  // Shared Animation State
  const sheetY = useMotionValue(0);
  const [collapsedY, setCollapsedY] = useState(0);
  
  // Tour State
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentStopId, setCurrentStopId] = useState<string | null>(null);
  
  // Tour Progress (Percentage) - Animated in DetailScreen
  const [tourProgress, setTourProgress] = useState(0);

  // Derived State
  const currentStop = currentStopId ? MOCK_TOUR.stops.find(s => s.id === currentStopId) : undefined;
  
  // Logic to hide mini player on start screen (collapsed sheet) to avoid redundancy with "Resume Tour" button
  // Show only when sheet is expanded (Detail View) or when Active Player is open.
  const shouldShowMiniPlayer = !!currentStop && (isSheetExpanded || showActivePlayer);

  // --- Handlers ---

  const handleStartTour = () => {
    setHasStarted(true);
    // Start first stop automatically
    const firstStopId = MOCK_TOUR.stops[0].id;
    setCurrentStopId(firstStopId);
    setIsPlaying(true);
    
    // Expand the sheet to show details
    setIsSheetExpanded(true);
  };

  const handleViewDetails = () => {
    setIsSheetExpanded(true);
  };

  const handleStopClick = (stopId: string) => {
    setCurrentStopId(stopId);
    setIsPlaying(true);
    setShowActivePlayer(true);
  };

  const handleStopPlayPause = (stopId: string) => {
    if (currentStopId === stopId) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentStopId(stopId);
      setIsPlaying(true);
      // We explicitly do NOT set showActivePlayer(true) here
    }
  };

  const handleNextStop = () => {
    if (!currentStopId) return;
    const currentIndex = MOCK_TOUR.stops.findIndex(s => s.id === currentStopId);
    if (currentIndex !== -1 && currentIndex < MOCK_TOUR.stops.length - 1) {
      setCurrentStopId(MOCK_TOUR.stops[currentIndex + 1].id);
      setIsPlaying(true); // Auto-play next track
    }
  };

  const handlePrevStop = () => {
    if (!currentStopId) return;
    const currentIndex = MOCK_TOUR.stops.findIndex(s => s.id === currentStopId);
    if (currentIndex > 0) {
      setCurrentStopId(MOCK_TOUR.stops[currentIndex - 1].id);
      setIsPlaying(true);
    }
  };

  const handleMiniPlayerExpand = () => {
    setShowActivePlayer(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleAudioComplete = () => {
    // When audio completes for the first time, animate the progress bar
    if (tourProgress === 0) {
      setTourProgress(55); // Update to mock 55%
    }
  };

  const closeSheet = () => setActiveSheet('NONE');

  return (
    <div className="min-h-screen bg-zinc-800 flex items-center justify-center p-0 md:p-8 font-sans">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-[400px] h-[100dvh] md:h-[844px] bg-white md:rounded-[2.5rem] relative overflow-hidden shadow-2xl flex flex-col">
        
        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden">
           {/* Background Layer (Start Screen Image) */}
           <StartScreen 
             tour={MOCK_TOUR}
             onOpenRating={() => setActiveSheet('RATING')}
             onOpenLanguage={() => setActiveSheet('LANGUAGE')}
             sheetY={sheetY}
             collapsedY={collapsedY}
           />
          
          {/* Main Interactive Sheet */}
          <MainSheet
            isExpanded={isSheetExpanded}
            onExpand={() => setIsSheetExpanded(true)}
            onCollapse={() => setIsSheetExpanded(false)}
            sheetY={sheetY}
            onLayoutChange={setCollapsedY}
            startContent={
              <StartCard 
                tour={MOCK_TOUR} 
                hasStarted={hasStarted} 
                onAction={hasStarted ? handleViewDetails : handleStartTour} 
              />
            }
            detailContent={
              <DetailScreen 
                tour={MOCK_TOUR}
                currentStopId={currentStopId}
                isPlaying={isPlaying}
                onStopClick={handleStopClick}
                onTogglePlay={handlePlayPause}
                onStopPlayPause={handleStopPlayPause}
                tourProgress={tourProgress}
              />
            }
          />
          
          {/* Active Player - Full Screen Overlay */}
          <AnimatePresence>
            {showActivePlayer && (
              <ActivePlayerScreen 
                tour={MOCK_TOUR}
                currentStopId={currentStopId}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onMinimize={() => setShowActivePlayer(false)}
                onNext={handleNextStop}
                onPrev={handlePrevStop}
              />
            )}
          </AnimatePresence>

          {/* Global Floating Mini Player */}
          <AnimatePresence>
            {shouldShowMiniPlayer && currentStop && (
              <MiniPlayer 
                currentStop={currentStop}
                isPlaying={isPlaying}
                onTogglePlay={handlePlayPause}
                onRewind={() => console.log('Rewind')}
                onForward={() => console.log('Forward')}
                onClick={handleMiniPlayerExpand}
                onEnd={handleAudioComplete}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Global Sheets */}
        <RatingSheet 
          isOpen={activeSheet === 'RATING'} 
          onClose={closeSheet} 
        />

        <LanguageSheet 
          isOpen={activeSheet === 'LANGUAGE'} 
          onClose={closeSheet}
          selectedLanguage={selectedLanguage}
          onSelect={setSelectedLanguage}
        />
      </div>
    </div>
  );
};

export default App;