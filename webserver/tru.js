const moment = require("moment");
const fetch = require("node-fetch");
const httpSignature = require("http-signature");
const jwksClient = require("jwks-rsa");
const config = require("../tru.json");

const tru_api_base_url = 'https://eu.api.tru.id';
const keyClient = jwksClient({
  jwksUri: `${tru_api_base_url}/.well-known/jwks.json`,
});

// token cache in memory
const TOKEN = {
  accessToken: undefined,
  expiresAt: undefined,
};

async function getAccessToken() {
  // check if existing valid token
  if (TOKEN.accessToken !== undefined && TOKEN.expiresAt !== undefined) {
    // we already have an access token let's check if it's not expired
    // I'm removing 1 minute just in case it's about to expire better refresh it anyway
    if (
      moment()
        .add(1, "minute")
        .isBefore(moment(new Date(TOKEN.expiresAt)))
    ) {
      // token not expired
      return TOKEN.accessToken;
    }
  }

  const url = `${tru_api_base_url}/oauth2/v1/token`;

  const toEncode = `${config.credentials[0].client_id}:${config.credentials[0].client_secret}`;
  const auth = Buffer.from(toEncode).toString('base64');

  const requestHeaders = {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const res = await fetch(url, {
    method: "post",
    headers: requestHeaders,
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "phone_check coverage",
    }),
  });

  if (!res.ok) {
    return res.status(400).body("Unable to create access token")
  }

  const json = await res.json();

  // update token cache in memory
  TOKEN.accessToken = json.access_token;
  TOKEN.expiresAt = moment().add(json.expires_in, "seconds").toString();

  return json.access_token;
}

async function patchPhoneCheck(checkId, code) {
  const url = `${tru_api_base_url}/phone_check/v0.2/checks/${checkId}`;
  const body = [{ op: "add", path: "/code", value: code }];

  const token = await getAccessToken();
  const requestHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json-patch+json",
  };

  const res = await fetch(url, {
    method: "patch",
    headers: requestHeaders,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return res;
  }

  const json = await res.json();

  return json;
}

async function verifySignature(originalUrl) {
  try {
    const url = new URL(originalUrl);
    const signature = Buffer.from(
      url.searchParams.get("authorization"),
      "base64"
    ).toString("utf-8");
    const date = Buffer.from(url.searchParams.get("date"), "base64").toString(
      "utf-8"
    );
    url.searchParams.delete("authorization");
    url.searchParams.delete("date");
    const originalRequest = {
      url: `${url.pathname}${url.search}`,
      method: "get",
      hostname: url.hostname,
      headers: {
        date,
        host: url.host,
        authorization: signature,
      },
    };
    const parsedOriginalRequest = httpSignature.parseRequest(originalRequest, {
      clockSkew: 300,
    });
    const jwk = await keyClient.getSigningKey(parsedOriginalRequest.keyId);
    const verified = httpSignature.verifySignature(
      parsedOriginalRequest,
      jwk.getPublicKey()
    );
    return verified;
  } catch (err) {
    console.error(err);
    return false;
  }
}

module.exports = {
  patchPhoneCheck,
  verifySignature
};