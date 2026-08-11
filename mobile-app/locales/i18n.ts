import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './es.json';
import en from './en.json';
import * as Localization from 'expo-localization';

const resources = {
  es,
  en,
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    // Detectar el idioma del dispositivo o usar 'es' por defecto
    lng: Localization.getLocales()[0]?.languageCode || 'es',
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false, // React ya previene XSS
    },
  });

export default i18n;
