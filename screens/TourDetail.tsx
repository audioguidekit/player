import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { TourData } from '../types';
import { TourListItem } from '../components/TourListItem';
import { FeedItemRenderer } from '../components/feed/FeedItemRenderer';
import { TourHeader } from '../components/TourHeader';

interface TourDetailProps {
  tour: TourData;
  currentStopId: string | null;
  isPlaying: boolean;
  onStopClick: (stopId: string) => void;
  onTogglePlay: () => void;
  onStopPlayPause: (stopId: string) => void;
  onBack: () => void;
  tourProgress: number;
  consumedMinutes: number;
  totalMinutes: number;
  completedStopsCount: number;
  isStopCompleted: (stopId: string) => boolean;
}

export const TourDetail: React.FC<TourDetailProps> = ({
  tour,
  currentStopId,
  isPlaying,
  onStopClick,
  onTogglePlay,
  onStopPlayPause,
  onBack,
  tourProgress,
  consumedMinutes,
  totalMinutes,
  completedStopsCount,
  isStopCompleted
}) => {
  // Slower spring: reduced stiffness from 75 to 35 to match counter
  const progressSpring = useSpring(0, { mass: 0.8, stiffness: 35, damping: 15 });

  useEffect(() => {
    // Animate to the passed progress value whenever it changes
    progressSpring.set(tourProgress);
  }, [progressSpring, tourProgress]);

  const width = useTransform(progressSpring, (value) => `${value}%`);

  return (
    <div className="flex flex-col h-full relative w-full bg-white" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>

      <TourHeader
        onBack={onBack}
        progressWidth={width}
        consumedMinutes={consumedMinutes}
        totalMinutes={totalMinutes}
      />

      {/* Scrollable List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.2, duration: 0.25, type: "spring" }}
        className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-32 no-scrollbar"
      >
        {tour.stops.map((stop, index) => {
          // Render audio stops with TourListItem
          if (stop.type === 'audio') {
            return (
              <TourListItem
                key={stop.id}
                stop={stop}
                index={index}
                isLast={index === tour.stops.length - 1}
                isActive={stop.id === currentStopId}
                isPlaying={isPlaying}
                isCompleted={isStopCompleted(stop.id)}
                onClick={() => onStopClick(stop.id)}
                onPlayPause={() => onStopPlayPause(stop.id)}
              />
            );
          }

          // Render other content types with FeedItemRenderer
          return <FeedItemRenderer key={stop.id} item={stop} />;
        })}
      </motion.div>
    </div>
  );
};