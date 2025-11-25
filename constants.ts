import { TourData, Language } from './types';

export const MOCK_TOUR: TourData = {
  id: 'rome-01',
  title: 'Ancient Rome',
  description: 'Explore rich history of the one of the greatest Europe\'s nations',
  totalDuration: '53 mins',
  totalStops: 20,
  image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1000&auto=format&fit=crop', // Rome Vertical
  stops: [
    { 
      id: '1', 
      title: 'The Colosseum', 
      duration: '5 min audio', 
      isCompleted: true,
      image: 'https://images.unsplash.com/photo-1552483775-6b2a57134303?q=80&w=800&auto=format&fit=crop'
    },
    { 
      id: '2', 
      title: 'Roman Forum', 
      duration: '8 min audio', 
      isCompleted: true,
      image: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=800&auto=format&fit=crop'
    },
    { 
      id: '3', 
      title: 'Palatine Hill', 
      duration: '12 min audio', 
      isCompleted: false,
      image: 'https://images.unsplash.com/photo-1569420235783-37593da1a851?q=80&w=800&auto=format&fit=crop'
    },
    { 
      id: '4', 
      title: 'Arch of Constantine', 
      duration: '3 min audio', 
      isCompleted: false,
      image: 'https://images.unsplash.com/photo-1596708681534-73894db8d8d3?q=80&w=800&auto=format&fit=crop'
    },
    { 
      id: '5', 
      title: 'Trajan\'s Market', 
      duration: '6 min audio', 
      isCompleted: false,
      image: 'https://images.unsplash.com/photo-1555992828-ca4dbe41d294?q=80&w=800&auto=format&fit=crop'
    },
    { 
      id: '6', 
      title: 'Pantheon', 
      duration: '10 min audio', 
      isCompleted: false,
      image: 'https://images.unsplash.com/photo-1554232682-b9ef9c92f8de?q=80&w=800&auto=format&fit=crop'
    },
  ]
};

export const LANGUAGES: Language[] = [
  { code: 'cs', name: 'Česky', flag: '🇨🇿' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];