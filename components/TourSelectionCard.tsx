import React from 'react';
import { ClockIcon } from '@phosphor-icons/react/dist/csr/Clock';
import { PathIcon } from '@phosphor-icons/react/dist/csr/Path';
import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight';
import tw from 'twin.macro';
import styled from 'styled-components';
import { TourData } from '../types';
import { useTranslation } from '../src/translations';
import { useHaptics } from '../src/hooks/useHaptics';

interface TourSelectionCardProps {
  tour: TourData;
  onClick: () => void;
}

const Card = styled.button`
  ${tw`w-full text-left flex flex-col overflow-hidden transition-all duration-200 active:scale-[0.98]`}
  background-color: ${({ theme }) => theme.cards.backgroundColor};
  border: 1px solid ${({ theme }) => theme.cards.borderColor};
  border-radius: ${({ theme }) => theme.cards.borderRadius};
  box-shadow: ${({ theme }) => theme.cards.shadow};
`;

const Cover = styled.div<{ $fallback?: string }>`
  ${tw`relative w-full`}
  aspect-ratio: 16 / 10;
  background-color: ${({ theme, $fallback }) => $fallback || theme.cards.image.placeholderColor};
`;

const CoverImage = styled.img`
  ${tw`absolute inset-0 w-full h-full object-cover`}
`;

const Body = styled.div`
  ${tw`flex items-center gap-3 p-4`}
`;

const TextBlock = styled.div`
  ${tw`flex-1 min-w-0`}
`;

const Title = styled.h2`
  ${tw`mb-1 tracking-tight`}
  font-family: ${({ theme }) => theme?.typography?.fontFamily?.sans?.join(', ')};
  font-size: ${({ theme }) => theme.cards.titleFontSize};
  font-weight: ${({ theme }) => theme.cards.titleFontWeight};
  color: ${({ theme }) => theme.cards.textColor};
`;

const Description = styled.p`
  ${tw`mb-3 leading-relaxed`}
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: ${({ theme }) => theme?.typography?.fontFamily?.sans?.join(', ')};
  font-size: ${({ theme }) => theme.startCard.descriptionFontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MetaContainer = styled.div`
  ${tw`flex items-center gap-5 uppercase tracking-wider`}
  font-family: ${({ theme }) =>
    theme?.typography?.fontFamily?.numbers
      ? theme.typography.fontFamily.numbers.join(', ')
      : theme?.typography?.fontFamily?.sans?.join(', ') || 'Inter, sans-serif'};
  font-size: ${({ theme }) => theme.startCard.metaFontSize};
  font-weight: ${({ theme }) => theme.startCard.metaFontWeight};
  color: ${({ theme }) => theme.startCard.metaColor};
`;

const MetaItem = styled.div`
  ${tw`flex items-center gap-2`}
`;

const Chevron = styled.div`
  ${tw`flex items-center justify-center shrink-0`}
  color: ${({ theme }) => theme.startCard.metaColor};
`;

export const TourSelectionCard = React.memo<TourSelectionCardProps>(({ tour, onClick }) => {
  const { t } = useTranslation();
  const triggerHaptic = useHaptics();

  const isVideo = tour.image?.match(/\.(mp4|webm|ogg)$/i);

  return (
    <Card
      onClick={() => {
        triggerHaptic();
        onClick();
      }}
    >
      <Cover $fallback={tour.imageColor}>
        {tour.image && !isVideo && <CoverImage src={tour.image} alt={tour.title} loading="lazy" />}
      </Cover>
      <Body>
        <TextBlock>
          <Title>{tour.title}</Title>
          <Description>{tour.description}</Description>
          <MetaContainer>
            <MetaItem>
              <ClockIcon size={16} />
              <span>{tour.totalDuration}</span>
            </MetaItem>
            <MetaItem>
              <PathIcon size={16} />
              <span>{tour.stops.length} {t.startCard.stops}</span>
            </MetaItem>
          </MetaContainer>
        </TextBlock>
        <Chevron>
          <CaretRightIcon size={20} weight="bold" />
        </Chevron>
      </Body>
    </Card>
  );
}, (prev, next) => prev.tour.id === next.tour.id && prev.tour.language === next.tour.language);
