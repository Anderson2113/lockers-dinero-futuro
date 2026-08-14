import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false
    }
  });

  // En modo desarrollo, Vite corre en el puerto 5173
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // En producción carga el build de React
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-whatsapp-qr', async (event, tenantId) => {
  try {
    const response = await fetch('https://lockers-dinero-futuro-1.onrender.com/api/vincular-wa', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dev-secret-key-123'
      },
      body: JSON.stringify({ tenant_id: tenantId })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('desvincular-whatsapp', async (event, tenantId) => {
  try {
    const response = await fetch(`https://lockers-dinero-futuro-1.onrender.com/api/desvincular-wa/${tenantId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer dev-secret-key-123'
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, error: error.message };
  }
});