const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { processFile } = require("./buscar");

let originalFilePath = null;
let modifiedFilePath = null;
let historyFilePath = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 700,
    height: 500,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  win.loadFile(path.join(__dirname, "public", "index.html"));
}

// Seleccionar archivo original
ipcMain.handle("select-file", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    defaultPath: app.getPath("documents"),
    properties: ["openFile"],
    filters: [{ name: "Text Files", extensions: ["txt"] }],
  });

  if (canceled || filePaths.length === 0) return null;

  originalFilePath = filePaths[0];

  // Carpeta resultados
  const resultsDir = path.join(app.getPath("documents"), "spool_freezed_results");
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir);

  // Archivo centralizado de salida
  modifiedFilePath = path.join(resultsDir, "spool_modificado.txt");
  historyFilePath = path.join(resultsDir, "history.json");

  // Primera vez: copiamos el original
  if (!fs.existsSync(modifiedFilePath)) {
    fs.copyFileSync(originalFilePath, modifiedFilePath);
  }

  // Si no existe historial, lo creamos vacío
  if (!fs.existsSync(historyFilePath)) {
    fs.writeFileSync(historyFilePath, JSON.stringify([], null, 2));
  }

  return originalFilePath;
});

// Procesar sobre archivo modificado
ipcMain.handle("process-file", async (event, { userId, freezeValue }) => {
  if (!modifiedFilePath) {
    return { error: "Primero selecciona un archivo spool.txt" };
  }

  try {
    const result = processFile(modifiedFilePath, userId, Number(freezeValue));
    fs.writeFileSync(modifiedFilePath, result.updatedFile, "utf8");

    // Guardar en historial
    let history = [];
    if (fs.existsSync(historyFilePath)) {
      history = JSON.parse(fs.readFileSync(historyFilePath, "utf8"));
    }

    const record = {
      date: new Date().toLocaleString(),
      userId,
      freezeValue,
      file: path.basename(modifiedFilePath),
    };

    history.push(record);
    fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2));

    return { success: true, outputPath: modifiedFilePath, row14: result.row14, history };
  } catch (err) {
    return { error: err.message };
  }
});
