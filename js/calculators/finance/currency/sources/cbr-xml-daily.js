// currency/sources/cbr-xml-daily.js
import { createRatesSource } from "./rates-source.js";


const API_URL =
  "https://www.cbr-xml-daily.ru/daily_json.js";


function parseRates(data, fallbackSourceId) {
  const rates = {
    RUB: 1
  };


  for (const currency of Object.values(data.Valute)) {
    rates[currency.CharCode] =
      currency.Value / currency.Nominal;
  }


  const effectiveDate = Date.parse(data.Date);


  return {
    sourceId: fallbackSourceId,
    kind: "official",
    updatedAt: Number.isFinite(effectiveDate)
      ? effectiveDate
      : Date.now(),
    base: "RUB",
    rates
  };
}


function getMoscowDateKey(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}


function isFutureEffectiveDate(effectiveDateString) {
  const effectiveDate = new Date(effectiveDateString);

  if (!Number.isFinite(effectiveDate.getTime())) {
    return false;
  }

  const effectiveDay = getMoscowDateKey(effectiveDate);
  const todayDay = getMoscowDateKey(new Date());

  return effectiveDay > todayDay;
}


export const cbrXmlDailySource = createRatesSource({
  id: "cbr-xml-daily",
  label: "Официальные курсы Банка России",
  kind: "official",


  async fetchRates() {
    const response = await fetch(API_URL);


    if (!response.ok) {
      throw new Error("Не удалось загрузить курсы Банка России");
    }


    const data = await response.json();


    if (!data?.Valute) {
      throw new Error("Банк России вернул некорректные данные");
    }


    if (isFutureEffectiveDate(data.Date) && data.PreviousURL) {
      const previousUrl = data.PreviousURL.startsWith("http")
        ? data.PreviousURL
        : `https:${data.PreviousURL}`;


      const previousResponse = await fetch(previousUrl);


      if (!previousResponse.ok) {
        throw new Error("Не удалось загрузить действующий курс Банка России");
      }


      const previousData = await previousResponse.json();


      if (!previousData?.Valute) {
        throw new Error("Банк России вернул некорректные данные");
      }


      return parseRates(previousData, "cbr-xml-daily");
    }


    return parseRates(data, "cbr-xml-daily");
  }
});