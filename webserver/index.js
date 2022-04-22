const express = require("express");
const bodyParser = require("body-parser");
const tru = require("./tru");
const ngrok = require('ngrok');

const app = express()
app.use(bodyParser.json());

// exchange the code obtained by the last redirect on the client
app.get("/complete-check", async (req, res) => {
  if (!req.query) {
    res.status(400).send("body missing");

    return;
  }

  const { code, check_id } = await req.query;

  if (!code) {
    res.status(400).send("code missing");

    return;
  }

  if (!check_id) {
    res.status(400).send("check_id missing");

    return;
  }

  if (req.query.redirect_url) {
    const verified = await tru.verifySignature(req.query.redirect_url);

    if (!verified) {
      res.status(400).send("signature not verified");

      return;
    }
  }

  try {
    const check = await tru.patchPhoneCheck(check_id, code);

    if (check.status === "COMPLETED" && check.match) {
      res.status(200).send('Verification complete, please close this tab and return to your SSH session.');

      return;
    } else {
      // verification failed = user not authenticated
      res.status(401).send("Verification failed, false match");

      return;
    }
  } catch (err) {
    console.log(err);

    if (err.status) {
      res.status(err.status || 500).send(err.message);
    } else {
      res.status(500).send("Unexpected Server error");
    }

    return;
  }
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