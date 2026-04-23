const { contextBridge, clipboard, app } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  writeClipboard(text) {
    clipboard.writeText(text);
  },
  getVersion() {
    return app.getVersion();
  }
});
