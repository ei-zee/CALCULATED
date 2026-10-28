const BRIDGE_URL =
  "https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js";

let initialization = null;
let scriptLoading = null;


function isVKHost(hostname) {
  return (
    hostname === "vk.com" ||
    hostname.endsWith(".vk.com") ||
    hostname === "vk.ru" ||
    hostname.endsWith(".vk.ru")
  );
}


function isVKEnvironment() {
  if (new URLSearchParams(location.search).has("vk_app_id")) {
    return true;
  }

  if (!document.referrer) {
    return false;
  }

  try {
    return isVKHost(new URL(document.referrer).hostname);
  } catch {
    return false;
  }
}


function loadBridge() {
  if (typeof window.vkBridge?.send === "function") {
    return Promise.resolve(window.vkBridge);
  }

  if (scriptLoading) {
    return scriptLoading;
  }

  scriptLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = BRIDGE_URL;
    script.async = true;
    script.dataset.calchubVkBridge = "";

    const timer = setTimeout(() => {
      finish(new Error("VK Bridge loading timeout"));
    }, 15000);

    function finish(error = null) {
      clearTimeout(timer);

      script.onload = null;
      script.onerror = null;

      if (error) {
        script.remove();
        reject(error);
        return;
      }

      if (typeof window.vkBridge?.send !== "function") {
        script.remove();
        reject(new Error("VK Bridge API is missing"));
        return;
      }

      resolve(window.vkBridge);
    }

    script.onload = () => finish();

    script.onerror = () => {
      finish(new Error("VK Bridge script could not be loaded"));
    };

    document.head.append(script);
  }).catch(error => {
    scriptLoading = null;
    throw error;
  });

  return scriptLoading;
}


async function initializeBridge() {
  let timer = null;

  try {
    const bridge = await loadBridge();

    await Promise.race([
      bridge.send("VKWebAppInit"),

      new Promise((resolve, reject) => {
        timer = setTimeout(() => {
          reject(new Error("VK Bridge initialization timeout"));
        }, 15000);
      })
    ]);

    console.info("VK Bridge инициализирован");

    return {
      available: true,
      bridge
    };
  } catch (error) {
    console.warn("VK Bridge недоступен:", error);

    return {
      available: false,
      bridge: null
    };
  } finally {
    clearTimeout(timer);
  }
}


export function initVK() {
  if (!isVKEnvironment()) {
    return Promise.resolve({
      available: false,
      bridge: null
    });
  }

  if (!initialization) {
    initialization = initializeBridge().then(result => {
      if (!result.available) {
        initialization = null;
      }

      return result;
    });
  }

  return initialization;
}