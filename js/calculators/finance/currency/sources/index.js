// currency/sources/index.js
import { cbrXmlDailySource } from "./cbr-xml-daily.js";
import { coingeckoSource } from "./coingecko.js";

export const RATE_SOURCES = [
  cbrXmlDailySource,
  coingeckoSource
];

export function getSourceById(sourceId) {
  return (
    RATE_SOURCES.find(source => source.id === sourceId) ??
    RATE_SOURCES[0]
  );
}