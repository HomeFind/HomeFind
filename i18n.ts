import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['uz', 'ru', 'en'] as const;
export const defaultLocale = 'uz' as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // Get locale from the request
  let locale = await requestLocale;

  // Handle undefined locale case
  if (!locale) {
    locale = defaultLocale;
  }

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = (await import(`./messages/${locale}.json`)).default;

  return {
    locale,
    messages
  };
});