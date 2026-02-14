import React, { memo, useState, lazy, Suspense } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components';
import { ImageGalleryStop } from '../../types';
import { RichText } from '../RichText';

const ImageLightbox = lazy(() => import('../ImageLightbox').then(m => ({ default: m.ImageLightbox })));

interface ImageGalleryCardProps {
  item: ImageGalleryStop;
}

const Container = styled.div`
  ${tw`overflow-hidden mb-4`}
  background-color: ${({ theme }) => theme.cards.backgroundColor};
  border-radius: ${({ theme }) => theme.cards.borderRadius};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  border: 1px solid ${({ theme }) => theme.cards.borderColor};
`;

const SingleImage = styled.img`
  ${tw`w-full h-64 object-cover cursor-pointer`}
`;

const ScrollStrip = styled.div`
  ${tw`flex gap-2 overflow-x-auto pt-4 px-4`}
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const Thumbnail = styled.img`
  ${tw`h-40 rounded object-cover cursor-pointer flex-shrink-0`}
  min-width: 140px;
  max-width: 200px;
`;

const CaptionArea = styled.div`
  ${tw`px-6 py-3`}
`;

const Caption = styled.p`
  ${tw`text-sm leading-relaxed`}
  color: ${({ theme }) => theme.imageCaption.textColor};
`;

export const ImageGalleryCard = memo<ImageGalleryCardProps>(({ item }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [sourceRect, setSourceRect] = useState<{ top: number; left: number; width: number; height: number } | undefined>();

  const isSingle = item.images.length === 1;

  const galleryItems = item.images.map((img) => ({
    src: img.url,
    alt: img.alt,
    caption: img.caption,
    credit: img.credit,
  }));

  const openAt = (index: number, e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSourceRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <Container>
      {isSingle ? (
        <SingleImage
          src={item.images[0].url}
          alt={item.images[0].alt || ''}
          onClick={(e) => openAt(0, e)}
        />
      ) : (
        <ScrollStrip>
          {item.images.map((img, i) => (
            <Thumbnail
              key={i}
              src={img.url}
              alt={img.alt || ''}
              onClick={(e) => openAt(i, e)}
            />
          ))}
        </ScrollStrip>
      )}

      {item.caption && (
        <CaptionArea>
          <Caption><RichText content={item.caption} /></Caption>
        </CaptionArea>
      )}

      {lightboxOpen && (
        <Suspense fallback={null}>
          <ImageLightbox
            isOpen={lightboxOpen}
            images={galleryItems}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
            sourceRect={sourceRect}
          />
        </Suspense>
      )}
    </Container>
  );
});
