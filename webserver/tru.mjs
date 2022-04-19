import moment from "moment";
import fetch from "node-fetch";
import config from "../tru.json";

const tru_api_base_url = 'https://eu.api.tru.id';

// token cache in memory
const TOKEN = {
  accessToken: undefined,
  expiresAt: undefined,
};

export async function getAccessToken() {
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
    await handleApiError(res);
  }

  const json = await res.json();

  // update token cache in memory
  TOKEN.accessToken = json.access_token;
  TOKEN.expiresAt = moment().add(json.expires_in, "seconds").toString();

  return json.access_token;
}
  
export async function patchPhoneCheck(checkId, code) {
  const url = `${process.env.TRU_API_BASE_URL}/phone_check/v0.2/checks/${checkId}`;
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
    await handleApiError(res);
  }

  const json = await res.json();

  return json;
}
  