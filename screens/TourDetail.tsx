import React, { useEffect } from 'react';
import { Home, Grid, Search } from 'lucide-react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { TourData } from '../types';
import { TourListItem } from '../components/TourListItem';
import { FeedItemRenderer } from '../components/feed/FeedItemRenderer';

interface TourDetailProps {
  tour: TourData;
  currentStopId: string | null;
  isPlaying: boolean;
  onStopClick: (stopId: string) => void;
  onTogglePlay: () => void;
  onStopPlayPause: (stopId: string) => void;
  tourProgress: number;
  consumedMinutes: number;
  totalMinutes: number;
  completedStopsCount: number;
  isStopCompleted: (stopId: string) => boolean;
}

// Helper component for animating numbers smoothly
const AnimatedCounter = ({ value }: { value: number }) => {
  // Slower spring: reduced stiffness from 75 to 35
  const spring = useSpring(0, { mass: 0.8, stiffness: 35, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
};

export const TourDetail: React.FC<TourDetailProps> = ({
  tour,
  currentStopId,
  isPlaying,
  onStopClick,
  onTogglePlay,
  onStopPlayPause,
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
    <div className="flex flex-col h-full relative w-full bg-white">
      {/* Floating Action Buttons - Clear of Dynamic Island */}
      <div className="absolute top-0 left-0 right-0 z-30 px-6 pt-4 pb-2">
        <div className="flex items-center justify-between">
          {/* Left: Home Button */}
          <button className="w-11 h-11 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 transition-colors shadow-lg">
            <Home size={20} />
          </button>

          {/* Right: Grid and Search Buttons */}
          <div className="flex items-center gap-2">
            <button className="w-11 h-11 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 transition-colors shadow-lg">
              <Grid size={20} />
            </button>
            <button className="w-11 h-11 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 transition-colors shadow-lg">
              <Search size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Header with Progress Indicator */}
      <div className="px-6 pt-20 pb-4 bg-white sticky top-0 z-20">
        {/* Progress Indicator Row */}
        <div className="flex items-center gap-3">
          {/* Progress Bar (70% width) */}
          <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <motion.div
              style={{ width }}
              className="bg-black h-full rounded-full"
            />
          </div>

          {/* Time Remaining Text */}
          <div className="text-sm font-medium text-gray-500 whitespace-nowrap">
            <AnimatedCounter value={totalMinutes - consumedMinutes} /> minutes left
          </div>
        </div>
      </div>

      {/* Scrollable List */}
      <div
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
      </div>
    </div>
  );
};