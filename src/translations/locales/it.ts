/**
 * Italian translations
 * TODO: Translate all strings to Italian
 */

import { Translations } from '../types';

export const it: Translations = {
  loading: {
    tourData: 'Caricamento dati del tour...',
    preparing: 'Preparazione del tuo tour...',
    audio: 'Caricamento audio e immagini',
  },
  errors: {
    loadFailed: 'Errore di caricamento dati',
    tourLoadFailed: 'Impossibile caricare i dati del tour',
    downloadFailed: 'Download fallito',
    retry: 'Riprova',
    httpsTooltip: '💡 Suggerimento: Usa HTTPS o accedi tramite localhost per i download offline',
  },
  startCard: {
    preparing: 'Preparazione...',
    loadingTour: 'Caricamento del tour...',
    replayTour: 'Riproduci tour',
    resumeTour: 'Riprendi tour',
    downloadTour: 'Scarica tour',
    startTour: 'Inizia tour',
    offlineInfo: 'Scarica questo tour ora per godertelo offline in aree con connettività limitata.',
    downloadForOffline: 'Scarica per offline',
    availableOffline: 'Disponibile offline',
    downloading: 'Scaricamento...',
  },
  rating: {
    title: 'Come ti è piaciuto questo tour?',
    subtitle: 'Il tuo feedback è prezioso per noi!',
    tapToRate: 'Tocca per valutare',
    shareDetails: 'Vuoi condividere più dettagli?',
    feedbackPlaceholder: 'Descrivi cosa ti è piaciuto o non ti è piaciuto...',
    next: 'Avanti',
    stayInLoop: 'Rimanere aggiornato?',
    emailInfo: 'Inserisci la tua email per ricevere aggiornamenti su nuovi tour e offerte esclusive.',
    emailPlaceholder: 'tuo@email.it',
    subscribe: 'Iscriviti',
    skip: 'Salta',
    thankYou: 'Grazie!',
    appreciateFeedback: 'Apprezziamo il tuo feedback.',
    close: 'Chiudi',
    subscribed: 'Sei iscritto!',
    checkInbox: 'Controlla la tua casella di posta.',
  },
  tourComplete: {
    title: 'Tour completato!',
    message: 'Hai ascoltato tutte le fermate audio. Speriamo che tu abbia apprezzato il tour.',
    rateTour: 'Valuta questo tour',
    skipRating: 'Salta valutazione',
    done: 'Fatto',
  },
  tourHeader: {
    minLeft: 'min rimanenti',
    offline: 'Offline',
  },
  map: {
    locationError: 'Posizione non disponibile',
  },
} as const;
