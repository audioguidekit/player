import React from 'react';
import tw from 'twin.macro';
import styled from 'styled-components';

interface SkipButtonProps {
    direction: 'forward' | 'backward';
    seconds?: number;
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
}

const Button = styled.button<{ $disabled: boolean }>(({ $disabled, theme }) => [
  tw`w-12 h-12 p-0 border-0 rounded-full flex items-center justify-center shrink-0`,
  {
    backgroundColor: theme.miniPlayer.controls.otherButtonsBackground,
    color: theme.miniPlayer.controls.otherButtonsIcon,
    transformOrigin: 'center center',
    transition: 'background-color 100ms ease-in-out, transform 100ms ease-out',
    '&:hover': {
      backgroundColor: theme.miniPlayer.controls.otherButtonsHoverBackground || theme.miniPlayer.controls.otherButtonsBackground,
    },
  },
  $disabled && tw`opacity-40`,
]);

export const SkipButton = React.memo<SkipButtonProps>(({
    direction,
    seconds = 15,
    onClick,
    disabled = false,
    children
}) => {
    return (
        <Button
            onClick={(e) => {
                e.stopPropagation();
                if (!disabled) onClick();
            }}
            onPointerDownCapture={(e) => {
                e.stopPropagation();
                (e.currentTarget as HTMLElement).style.transform = 'scale(0.9)';
            }}
            onPointerUp={(e) => {
                (e.currentTarget as HTMLElement).style.transform = '';
            }}
            onPointerLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = '';
            }}
            disabled={disabled}
            $disabled={disabled}
        >
            {children}
        </Button>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.direction === nextProps.direction &&
        prevProps.seconds === nextProps.seconds &&
        prevProps.disabled === nextProps.disabled &&
        prevProps.children === nextProps.children
    );
});
