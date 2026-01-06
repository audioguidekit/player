import React from 'react';
import styled from 'styled-components';
import { MobileFrame } from '../../../components/shared/MobileFrame';
import { useTranslation } from '../../translations';

interface ErrorScreenProps {
  error?: Error | null;
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const ContentWrapper = styled.div`
  text-align: center;
  padding: 2rem;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.sheets.titleFontSize};
  margin-bottom: 0.5rem;
  font-weight: ${({ theme }) => theme.sheets.titleFontWeight};
  color: ${({ theme }) => theme.status.error};
`;

const Message = styled.p`
  margin-bottom: 1rem;
  font-size: ${({ theme }) => theme.loading.messageFontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const RetryButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.buttons.primary.backgroundColor};
  color: ${({ theme }) => theme.buttons.primary.textColor};
  font-size: ${({ theme }) => theme.buttons.secondary.fontSize};
  font-weight: ${({ theme }) => theme.buttons.secondary.fontWeight};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.buttons.primary.hoverBackground || theme.buttons.primary.backgroundColor};
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ error }) => {
  const { t } = useTranslation();

  return (
    <MobileFrame>
      <Container>
        <ContentWrapper>
          <Title>{t.errors.loadFailed}</Title>
          <Message>
            {error?.message || t.errors.tourLoadFailed}
          </Message>
          <RetryButton onClick={() => window.location.reload()}>
            {t.errors.retry}
          </RetryButton>
        </ContentWrapper>
      </Container>
    </MobileFrame>
  );
};
