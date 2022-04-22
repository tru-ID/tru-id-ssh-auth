const express = require("express");
const bodyParser = require("body-parser");
const ngrok = require('ngrok');

const app = express()
app.use(bodyParser.json());

app.get("/", async (req, res) => {
  res.send('hello');
});

async function connectNgrok() {
  let url = await ngrok.connect({
    proto: 'http',
    port: '8080',
  });

  console.log('Ngrok connected, URL: ' + url);
}

async function startServer() {
  const port = 8080;

  app.listen(port, (err) => {
    if (err) {
      return console.log(`Unable to start server: ${err}`);
    }

    console.log('WebServer started, starting Ngrok');
    connectNgrok();

    return true;
  });
}

// Triggers the whole process of creating a session, adding the the session id to the database.
// Opens a headless mode for the publisher view.
// Will send a text message.
startServer();