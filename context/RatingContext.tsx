import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RatingContextType {
    rating: number;
    setRating: (rating: number) => void;
    feedback: string;
    setFeedback: (feedback: string) => void;
    email: string;
    setEmail: (email: string) => void;
    isSubmitted: boolean;
    submitRating: () => void;
}

const RatingContext = createContext<RatingContextType | undefined>(undefined);

export const RatingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const submitRating = () => {
        // In a real app, you would send data to API here
        console.log('Rating submitted:', { rating, feedback, email });
        setIsSubmitted(true);
    };

    return (
        <RatingContext.Provider
            value={{
                rating,
                setRating,
                feedback,
                setFeedback,
                email,
                setEmail,
                isSubmitted,
                submitRating,
            }}
        >
            {children}
        </RatingContext.Provider>
    );
};

export const useRating = () => {
    const context = useContext(RatingContext);
    if (context === undefined) {
        throw new Error('useRating must be used within a RatingProvider');
    }
    return context;
};
