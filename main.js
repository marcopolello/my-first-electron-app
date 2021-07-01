const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, Tray} = electron;
let tray = null;
let mainWindow;
let addWindow;

//only one instance at a time
if (!app.requestSingleInstanceLock()) {
   app.quit();
}

app.whenReady().then(() => {
   tray = new Tray(path.join(__dirname, '../my-electron-app/app.ico'));
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
   mainWindow = new BrowserWindow({
      width: 400,
      height: 400,
      title: 'Add Shopping List Item'
   });
   //load html into window
   mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'addWindow.html'),
      protocol: 'file:',
      slashes: true
   }));
   //Garbage collection handle (for optimize)
   addWindow.on('close', function (){
      addWindow = null;
   });
}

//menu template
const mainMenuTemplate = [
   {
      label: 'File',
      submenu: [
         {
            label: 'Add Item',
            click(){
               createAddWindow();
            }
         },
         {
            label: 'Clear Items'
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
   mainMenuTemplate
}