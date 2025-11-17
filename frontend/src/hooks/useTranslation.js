import { es } from '../locales/es';

/**
 * Hook simple de traducción
 * Usa español por defecto
 */
export const useTranslation = () => {
  const t = (key) => {
    const keys = key.split('.');
    let value = es;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return value || key;
  };

  return { t };
};

export default useTranslation;
