import {
  ensureRegistry,
  getCalculator,
  getCalculatorModuleUrl,
  getCalculatorMetaUrl,
  getCalculatorStyleUrls
} from "../registry.js";

import {
  createTranslator,
  getLanguage,
  getLocale
} from "../i18n/i18n.js";

import { createUiKit } from "../ui/kit.js";
import { createGameKit } from "../ui/gameKit.js";
import { createNumberInput } from "../ui/numberInput.js";
import { createLifecycle } from "../ui/lifecycle.js";


const styles = new Map();


async function acquireStyle(url) {
  const href = String(url);

  let record = styles.get(href);

  if (!record) {
    const link = document.createElement("link");

    link.rel = "stylesheet";
    link.href = href;

    record = {
      link,
      users: 0,
      promise: null
    };

    record.promise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        finish(new Error(`Stylesheet timeout: ${href}`));
      }, 15000);

      function finish(error = null) {
        clearTimeout(timer);

        link.onload = null;
        link.onerror = null;

        if (error) {
          reject(error);
        } else {
          resolve();
        }
      }

      link.onload = () => finish();
      link.onerror = () => finish(
        new Error(`Stylesheet failed: ${href}`)
      );

      document.head.append(link);
    });

    styles.set(href, record);
  }

  record.users++;

  let released = false;

  function release() {
    if (released) {
      return;
    }

    released = true;
    record.users--;

    if (record.users === 0) {
      record.link.remove();

      if (styles.get(href) === record) {
        styles.delete(href);
      }
    }
  }

  try {
    await record.promise;
    return release;
  } catch (error) {
    release();
    throw error;
  }
}


export function createCalculatorLoader() {
  async function load(slotId, calculatorId, context) {
    await ensureRegistry();

    const entry = getCalculator(calculatorId);
    const moduleUrl = getCalculatorModuleUrl(calculatorId);

    if (!entry || !moduleUrl) {
      throw new Error(`Unknown calculator: ${calculatorId}`);
    }

    const scope = createLifecycle();

    // Контейнер не привязан к живому слоту до успешной загрузки.
    const element = document.createElement("div");
    element.className = "module-host";
    element.dataset.calculator = calculatorId;

    let instance = null;

    try {
      for (const url of getCalculatorStyleUrls(calculatorId)) {
        scope.add(await acquireStyle(url));
      }

      const metaUrl = getCalculatorMetaUrl(calculatorId);

      const [module, metadata] = await Promise.all([
        import(moduleUrl),
        metaUrl ? import(metaUrl) : Promise.resolve({})
      ]);

      if (typeof module.default !== "function") {
        throw new TypeError(
          `Calculator factory is missing: ${calculatorId}`
        );
      }

      const meta = metadata.meta ?? {};
      const translator = createTranslator(meta.strings ?? {});
    

      const ui = createUiKit({ t: translator });
      const game = createGameKit({ ui, t: translator });

      scope.own(ui);
      scope.own(game);

      const calculatorContext = {
        ...context,
        slotId,
        meta,
        t: translator,
        ui,
        game,
        lifecycle: scope,
        getLanguage,
        getLocale,

        createNumberInput(options) {
          return scope.own(createNumberInput(options));
        }
      };

      Object.defineProperty(calculatorContext, "language", {
        enumerable: true,
        get: getLanguage
      });

      instance = await module.default(
        element,
        calculatorContext
      );

      if (
        !instance ||
        typeof instance !== "object" ||
        typeof instance.destroy !== "function"
      ) {
        throw new TypeError(
          `Calculator must return an instance with destroy(): ${calculatorId}`
        );
      }

      const originalDestroy = instance.destroy.bind(instance);

      let destroyed = false;

      function destroy() {
        if (destroyed) {
          return;
        }

        destroyed = true;

        try {
          originalDestroy();
        } catch (error) {
          console.error("Calculator destroy failed:", error);
        } finally {
          scope.destroy();
          element.remove();
        }
      }

      return {
        calculatorId,
        meta,
        element,
        instance,
        destroy
      };
    } catch (error) {
      try {
        instance?.destroy?.();
      } catch (cleanupError) {
        console.error(cleanupError);
      }

      scope.destroy();
      element.remove();

      throw error;
    }
  }

  function unload(loaded) {
    loaded?.destroy?.();
  }

  return {
    load,
    unload
  };
}