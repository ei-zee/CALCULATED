const TTL_BY_KIND = {
  official: 3 * 60 * 60 * 1000, // 3 часа
  market: 60 * 1000             // 1 минута
};


const DEFAULT_TTL = 5 * 60 * 1000;


const cache = new Map();
const pending = new Map();


function getTtl(kind) {
  return TTL_BY_KIND[kind] ?? DEFAULT_TTL;
}


export async function getRates(source) {
  const cached = cache.get(source.id);


  if (
    cached &&
    Date.now() - cached.savedAt < getTtl(source.kind)
  ) {
    console.log("[rates-cache] cache hit", source.id);


    return cached.data;
  }


  if (pending.has(source.id)) {
    console.log("[rates-cache] request already pending", source.id);


    return pending.get(source.id);
  }


  console.log("[rates-cache] request start", source.id);


  const request = source
    .fetchRates()
    .then(data => {
      console.log("[rates-cache] fetched", source.id, data);


      cache.set(source.id, {
        data,
        savedAt: Date.now()
      });


      return data;
    })
    .catch(error => {
      console.error("[rates-cache] error", source.id, error);


      throw error;
    })
    .finally(() => {
      pending.delete(source.id);
    });


  pending.set(source.id, request);


  return request;
}