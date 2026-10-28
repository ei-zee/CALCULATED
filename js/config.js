export const APP_CONFIG = {
  version: "2.1",

  defaultTheme: "light",
  defaultLanguage: "ru",

  mobileBreakpoint: 760,
  historyLimit: 50,

  themes: [
    {
      id: "light",
      icon: "☀️",
      title: {
        ru: "Светлая",
        en: "Light"
      },
      href: new URL("../css/themes/light.css", import.meta.url).href
    },
    {
      id: "dark",
      icon: "🌙",
      title: {
        ru: "Тёмная",
        en: "Dark"
      },
      href: new URL("../css/themes/dark.css", import.meta.url).href
    }
  ],

  languages: [
    {
      id: "ru",
      locale: "ru-RU",
      icon: "🇷🇺",
      title: "Русский",
      helpLanguage: "ru"
    },
    {
      id: "en",
      locale: "en-US",
      icon: "🇬🇧",
      title: "English",
      helpLanguage: "en"
    }
  ]
};


export function getThemeConfig(id) {
  return APP_CONFIG.themes.find(theme => theme.id === id) ?? null;
}


export function getLanguageConfig(id) {
  return APP_CONFIG.languages.find(language => language.id === id) ?? null;
}


export function getLocalizedTitle(entry, language) {
  if (typeof entry === "string") {
    return entry;
  }

  return (
    entry?.[language] ??
    entry?.[APP_CONFIG.defaultLanguage] ??
    ""
  );
}