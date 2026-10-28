// currency/sources/rates-source.js

export function createRatesSource({ id, label, kind, fetchRates }) {
  return {
    id,
    label,
    kind,
    fetchRates
  };
}