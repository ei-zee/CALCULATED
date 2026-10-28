// currency/currency-format.js
import { getLanguage } from "../../../i18n/i18n.js";
import { CURRENCY_CATALOG } from "./currency-catalog.js";


function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


export function getCurrencyInfo(code, fallbackName = "") {
  const catalogItem = CURRENCY_CATALOG[code];


  return {
    code,


    name:
      catalogItem?.name ||
      fallbackName ||
      code,


    symbol:
      catalogItem?.symbol || "",


    flag:
      catalogItem?.flag || ""
  };
}


export function formatCurrencyOption(code, fallbackName = "") {
  const info = getCurrencyInfo(code, fallbackName);


  const parts = [];


  if (info.flag) {
    parts.push(info.flag);
  }


  parts.push(escapeHtml(info.code));


  if (info.name && info.name !== info.code) {
    parts.push(`— ${escapeHtml(info.name)}`);
  }


  return parts.join(" ");
}


export function formatCurrencyAmount(value, code) {
  const info = getCurrencyInfo(code);


  const formattedValue = Number(value).toLocaleString(getLanguage(), {
    maximumFractionDigits: 8
  });


  return info.symbol
    ? `${formattedValue} ${info.symbol}`
    : `${formattedValue} ${info.code}`;
}
