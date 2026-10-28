import { emit, on } from "../core/eventBus.js";
import {
  APP_CONFIG,
  getLanguageConfig
} from "../config.js";
import { catalog } from "./catalog.js";


let language = APP_CONFIG.defaultLanguage;


function normalizeLanguage(value) {
  return getLanguageConfig(value)
    ? value
    : APP_CONFIG.defaultLanguage;
}


function interpolate(template, variables = {}) {
  return String(template).replace(
    /\{(\w+)\}/g,
    (match, name) => {
      const value = variables?.[name];

      return value === null || value === undefined
        ? match
        : String(value);
    }
  );
}


function getTemplate(key, localStrings) {
  const fallback = APP_CONFIG.defaultLanguage;
  const local = localStrings?.[key];
  const global = catalog[key];

  return (
    local?.[language] ??
    global?.[language] ??
    local?.[fallback] ??
    global?.[fallback] ??
    key
  );
}


function translate(key, variables, localStrings) {
  return interpolate(
    getTemplate(key, localStrings),
    variables
  );
}


export function initLanguage(initialLanguage) {
  language = normalizeLanguage(initialLanguage);
  document.documentElement.lang = language;

  return language;
}


export function getLanguage() {
  return language;
}


export function getLocale() {
  return (
    getLanguageConfig(language)?.locale ??
    getLanguageConfig(APP_CONFIG.defaultLanguage).locale
  );
}


export function setLanguage(nextLanguage) {
  if (!getLanguageConfig(nextLanguage)) {
    return false;
  }

   
  if (nextLanguage === language) {
    return false;
  }

  const previousLanguage = language;

  language = nextLanguage;
  document.documentElement.lang = language;

  emit("language:changed", {
    language,
    previousLanguage,
    locale: getLocale()
  });

  return true;
}


export function t(key, variables = {}) {
  return translate(key, variables, null);
}


export function subscribe(handler) {
  if (typeof handler !== "function") {
    throw new TypeError("Language subscriber must be a function");
  }

  return on("language:changed", handler);
}


export function createTranslator(localStrings = {}) {
  const translator = (key, variables = {}) =>
    translate(key, variables, localStrings);

  translator.getLanguage = getLanguage;
  translator.getLocale = getLocale;
  translator.subscribe = subscribe;

  translator.number = (value, options = {}) =>
    new Intl.NumberFormat(getLocale(), options).format(value);

  return translator;
}


function findElements(root, selector) {
  const elements = [];

  if (root instanceof Element && root.matches(selector)) {
    elements.push(root);
  }

  if (typeof root?.querySelectorAll === "function") {
    elements.push(...root.querySelectorAll(selector));
  }

  return elements;
}


export function apply(root = document) {
  const attributes = [
    ["data-i18n", null],
    ["data-i18n-title", "title"],
    ["data-i18n-placeholder", "placeholder"],
    ["data-i18n-aria-label", "aria-label"]
  ];

  for (const [source, target] of attributes) {
    for (const element of findElements(root, `[${source}]`)) {
      const key = element.getAttribute(source);

      let variables = {};

      const rawVariables = element.getAttribute("data-i18n-vars");

      if (rawVariables) {
        try {
          variables = JSON.parse(rawVariables);
        } catch {
          variables = {};
        }
      }

      const text = t(key, variables);

      if (target) {
        element.setAttribute(target, text);
      } else {
        element.textContent = text;
      }
    }
  }
}