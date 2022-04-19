import express from "express";
import bodyParser from "body-parser";
import { patchPhoneCheck } from "./tru.mjs";

const app = express()
app.use(bodyParser.json());

// exchange the code obtained by the last redirect on the client
app.post("/complete-check", async (req, res) => {
  if (!req.body) {
    res.status(400).send("body missing");

    return;
  }

  const { code, check_id } = await req.body;

  if (!code) {
    res.status(400).send("code missing");

    return;
  }

  if (!check_id) {
    res.status(400).send("check_id missing");

    return;
  }

  if (req.body.redirect_url) {
    console.log("URL to check signature:", req.body.redirect_url);
    const verified = await verifySignature(req.body.redirect_url);

    if (!verified) {
      res.status(400).send("signature not verified");

      return;
    }
  }

  try {
    const check = await patchPhoneCheck(check_id, code);

    if (check.status === "COMPLETED" && check.match) {
      // verification successful = user authenticated
      const phoneNumber = inMemoryCheckPhoneNumberDB[check_id]; // the phone number
      const access_token = jwt.sign(
      {
        sub: phoneNumber,
        exp: Math.floor(Date.now() / 1000) + 24 * (60 * 60) * 30, // Expires in 30 days
      },
      process.env.JWT_SECRET
      );

      delete inMemoryCheckPhoneNumberDB[check_id]; // clear up

      // issue a JWT
      res.send({
        access_token,
      });
    } else {
      // verification failed = user not authenticated
      res.status(401).send("Verification failed, false match");
    }
  } catch (err) {
    console.log(err);

    if (err.status) {
      res.status(err.status || 500).send(err.message);
    } else {
      res.status(500).send("server error");
    }
  }
});

app.listen(8080)