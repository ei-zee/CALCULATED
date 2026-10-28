/*
 * Справка временно отключена на релиз.
 * Интерфейс сохранён для совместимости с app.js.
 */

export function createHelp() {
  function close() {
    const dialog = document.getElementById("helpDialog");

    if (dialog?.open) {
      dialog.close();
    }
  }

  function init() {
    close();
  }

  function open() {
    // Временно отключено до переработки справки.
  }

  function isOpen() {
    return false;
  }

  function destroy() {
    close();
  }

  return {
    init,
    open,
    close,
    isOpen,
    destroy
  };
}