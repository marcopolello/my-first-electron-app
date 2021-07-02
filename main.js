const electron = require('electron');
const url = require('url');
const path = require('path');

//SET ENV (decommentare per togliere dev tools)
process.env.NODE_ENV = 'production';

const {app, BrowserWindow, Menu, Tray, ipcMain} = electron;
let tray = null;
let mainWindow;
let addWindow;

//only one instance at a time
if (!app.requestSingleInstanceLock()) {
   app.quit();
}

app.whenReady().then(() => {
   tray = new Tray(path.join(__dirname, 'app.ico'));
   const contextMenu = Menu.buildFromTemplate([
      { label: 'Item1', type: 'radio' },
      { label: 'Item2', type: 'radio' },
      { label: 'Item3', type: 'radio', checked: true },
      { label: 'Item4', type: 'radio' }
   ])
   tray.setToolTip('My Shopping List.')
   tray.setContextMenu(contextMenu)
})

//quando l'app è pronta
app.on('ready', function (){
   mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
         nodeIntegration:true,
         contextIsolation: false,
         preload: path.join(__dirname, 'preload.js')
      }
   });
   //load html into window
   mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
   }));
   //Quit app when closed
   mainWindow.on('closed', function (){
      app.quit();
   });

   //build menu from template
   const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
   //insert menu
   Menu.setApplicationMenu(mainMenu);
});

//handle create add window for create new item
function createAddWindow() {
   addWindow = new BrowserWindow({
      width: 400,
      height: 400,
      title: 'Add Shopping List Item',
      webPreferences: {
         nodeIntegration:true,
         contextIsolation: false,
      }
   });
   //load html into window
   addWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'addWindow.html'),
      protocol: 'file:',
      slashes: true
   }));
   //Garbage collection handle (for optimize)
   addWindow?.on('close', function (){
      addWindow = null;
   });
}

// Catch item:add
ipcMain.on('item:add', function (e, item){
   //console.log(item);
   mainWindow.webContents.send('item:add', item);
   addWindow.close();
});

//menu template
const mainMenuTemplate = [
   {
      label: 'File',
      submenu: [
         {
            label: 'Add Item',
            accelerator: process.platform === 'darwin' ? 'Command+1' : 'Ctrl+1',
            click(){
               createAddWindow();
            }
         },
         {
            label: 'Clear All Items',
            click(){
               mainWindow.webContents.send('item:clear');
            }
         },
         {
            label: 'Quit',
            //x uscire da Mac e da windows. node => node.process.platform = 'win32' mentre su mac è 'darwin'
            accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
            click(){
               app.quit();
            }
         }
      ]
   }
];

// If Mac, add empty object to menu
if (process.platform === 'darwin'){
   mainMenuTemplate.unshift({});
}

//add developer tools item if not in production
if (process.env.NODE_ENV !== 'production'){
   mainMenuTemplate.push({
      label: 'Developer Tools',
      submenu: [
         {
            label: 'Toggle DevTools',
            accelerator: process.platform === 'darwin' ? 'Command+I' : 'Ctrl+I',
            click(item, focusedWindow){
               focusedWindow.toggleDevTools();
            }
         },
         {
            role: 'reload'
         }
      ]
   });
}