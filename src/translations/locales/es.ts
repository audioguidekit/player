/**
 * Spanish translations
 * TODO: Translate all strings to Spanish
 */

import { Translations } from '../types';

export const es: Translations = {
  loading: {
    tourData: 'Cargando datos del tour...',
    preparing: 'Preparando tu tour...',
    audio: 'Cargando audio e imágenes',
  },
  errors: {
    loadFailed: 'Error al cargar datos',
    tourLoadFailed: 'No se pudieron cargar los datos del tour',
    downloadFailed: 'Descarga fallida',
    retry: 'Reintentar',
    httpsTooltip: '💡 Consejo: Use HTTPS o acceda a través de localhost para descargas sin conexión',
  },
  startCard: {
    preparing: 'Preparando...',
    loadingTour: 'Cargando tour...',
    replayTour: 'Repetir tour',
    resumeTour: 'Reanudar tour',
    downloadTour: 'Descargar tour',
    startTour: 'Iniciar tour',
    offlineInfo: 'Descarga este tour ahora para disfrutarlo sin conexión en áreas con conectividad limitada.',
    downloadForOffline: 'Descargar sin conexión',
    availableOffline: 'Disponible sin conexión',
    downloading: 'Descargando...',
  },
  rating: {
    title: '¿Cómo te gustó este tour?',
    subtitle: '¡Tus comentarios son valiosos para nosotros!',
    tapToRate: 'Toca para calificar',
    shareDetails: '¿Te gustaría compartir más detalles?',
    feedbackPlaceholder: 'Describe lo que te gustó o no te gustó...',
    next: 'Siguiente',
    stayInLoop: '¿Mantenerse informado?',
    emailInfo: 'Ingresa tu correo para recibir actualizaciones sobre nuevos tours y ofertas exclusivas.',
    emailPlaceholder: 'tu@email.com',
    subscribe: 'Suscribirse',
    skip: 'Omitir',
    thankYou: '¡Gracias!',
    appreciateFeedback: 'Apreciamos tus comentarios.',
    close: 'Cerrar',
    subscribed: '¡Estás suscrito!',
    checkInbox: 'Revisa tu bandeja de entrada.',
  },
  tourComplete: {
    title: '¡Tour completado!',
    message: 'Has escuchado todas las paradas de audio. Esperamos que hayas disfrutado el tour.',
    rateTour: 'Calificar este tour',
    skipRating: 'Omitir calificación',
    done: 'Listo',
  },
  tourHeader: {
    minLeft: 'min restantes',
    offline: 'Sin conexión',
  },
  map: {
    locationError: 'Ubicación no disponible',
  },
} as const;
