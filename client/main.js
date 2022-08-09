const { app, session, screen, BrowserWindow } = require('electron');

function createWindow () {
  const {width, height} = screen.getPrimaryDisplay().workAreaSize
  const win = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.maximize();

  //load the index.html from a url
  win.loadFile('./build/index.html');
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

app.on('ready',() => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    if(details.url.includes("dood.pm")){
      details.requestHeaders['Referer'] = "https://dood.pm/";
    }
    if(details.url.includes("empire-streaming")){
      details.requestHeaders['Referer'] = "https://empire-streaming.co/";
    }
    if(details.url.includes("delivery") && details.url.includes("m3u8")){
      details.requestHeaders["Accept-Language"] = "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7";
      details.requestHeaders["Accept-Encoding"] = "gzip, deflate, br";
      details.requestHeaders["Origin"] = "https://playersb.com";
      details.requestHeaders["Referer"] = "https://playersb.com/";
      details.requestHeaders["sec-ch-ua"] = '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"';
      details.requestHeaders["Sec-Fetch-Dest"] = "empty";
      details.requestHeaders["Sec-Fetch-Mode"] = "cors";
      details.requestHeaders["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36";
      delete details.requestHeaders["Range"];
    }
    callback({ requestHeaders: details.requestHeaders })
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.