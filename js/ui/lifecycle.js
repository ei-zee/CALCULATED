export function createLifecycle() {
  const controller = new AbortController();
  const cleanups = new Set();

  let destroyed = false;

  function add(cleanup) {
    if (typeof cleanup !== "function") {
      throw new TypeError("Cleanup must be a function");
    }

    if (destroyed) {
      cleanup();
      return () => {};
    }

    cleanups.add(cleanup);

    return () => cleanups.delete(cleanup);
  }

  function own(resource) {
    if (typeof resource === "function") {
      add(resource);
    } else if (typeof resource?.destroy === "function") {
      add(() => resource.destroy());
    }

    return resource;
  }

  function listen(target, type, handler, options = {}) {
    if (destroyed) {
      return () => {};
    }

    target.addEventListener(type, handler, {
      ...options,
      signal: controller.signal
    });

    return () => {
      target.removeEventListener(
        type,
        handler,
        Boolean(options.capture)
      );
    };
  }

  function timeout(callback, delay) {
    if (destroyed) {
      return () => {};
    }

    let cancel;

    const id = setTimeout(() => {
      cleanups.delete(cancel);

      if (!destroyed) {
        callback();
      }
    }, delay);

    cancel = () => {
      clearTimeout(id);
      cleanups.delete(cancel);
    };

    add(cancel);

    return cancel;
  }

  function destroy() {
    if (destroyed) {
      return;
    }

    destroyed = true;
    controller.abort();

    const callbacks = [...cleanups].reverse();
    cleanups.clear();

    for (const cleanup of callbacks) {
      try {
        cleanup();
      } catch (error) {
        console.error("Cleanup failed:", error);
      }
    }
  }

  return {
    signal: controller.signal,
    add,
    own,
    listen,
    timeout,
    destroy,
    get destroyed() {
      return destroyed;
    }
  };
}