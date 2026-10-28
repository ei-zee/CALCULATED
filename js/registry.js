import { getLanguage } from "./i18n/i18n.js";
import { APP_CONFIG } from "./config.js";


const manifestUrl = new URL(
  "./calculators/manifest.json",
  import.meta.url
);

let manifest = null;
let pending = null;


function validateManifest(value) {
  if (
    !value ||
    !Array.isArray(value.categories) ||
    !value.calculators ||
    typeof value.calculators !== "object"
  ) {
    throw new Error("Invalid calculator manifest");
  }

  const categoryIds = new Set();

  for (const category of value.categories) {
    if (
      !category.id ||
      categoryIds.has(category.id) ||
      !Array.isArray(category.calculators)
    ) {
      throw new Error("Invalid manifest category");
    }

    categoryIds.add(category.id);

    for (const id of category.calculators) {
      if (!value.calculators[id]) {
        throw new Error(`Unknown manifest calculator: ${id}`);
      }
    }
  }

  for (const [id, calculator] of Object.entries(value.calculators)) {
    if (!calculator.module || !categoryIds.has(calculator.category)) {
      throw new Error(`Invalid manifest calculator: ${id}`);
    }

    if (
      calculator.styles !== undefined &&
      !Array.isArray(calculator.styles)
    ) {
      throw new Error(`Invalid calculator styles: ${id}`);
    }
  }

  return value;
}


export async function ensureRegistry() {
  if (manifest) {
    return manifest;
  }

  if (!pending) {
    pending = fetch(manifestUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(
            `Manifest request failed: ${response.status}`
          );
        }

        return response.json();
      })
      .then(validateManifest)
      .then(value => {
        manifest = value;
        return value;
      })
      .finally(() => {
        pending = null;
      });
  }

  return pending;
}


function titleOf(title, fallback) {
  return (
    title?.[getLanguage()] ??
    title?.[APP_CONFIG.defaultLanguage] ??
    fallback
  );
}


export function getCategories() {
  return manifest?.categories ?? [];
}


export function getCalculators(categoryId) {
  return getCategories()
    .find(category => category.id === categoryId)
    ?.calculators ?? [];
}


export function getCalculator(calculatorId) {
  return manifest?.calculators?.[calculatorId] ?? null;
}


export function getCategoryTitle(categoryId) {
  const category = getCategories()
    .find(item => item.id === categoryId);

  return titleOf(category?.title, categoryId);
}


export function getCalculatorTitle(calculatorId) {
  return titleOf(
    getCalculator(calculatorId)?.title,
    calculatorId
  );
}


export function getCalculatorModuleUrl(calculatorId) {
  const entry = getCalculator(calculatorId);

  return entry?.module
    ? new URL(entry.module, manifestUrl)
    : null;
}


export function getCalculatorMetaUrl(calculatorId) {
  const entry = getCalculator(calculatorId);

  return entry?.meta
    ? new URL(entry.meta, manifestUrl)
    : null;
}


export function getCalculatorStyleUrls(calculatorId) {
  return (getCalculator(calculatorId)?.styles ?? [])
    .map(style => new URL(style, manifestUrl));
}