import { SITE_URL, LIST_NAMES } from "../auth/msalConfig";

const BASE = SITE_URL + "/_api/web/lists";

function headers(token: string) {
  return {
    "Accept": "application/json;odata=verbose",
    "Content-Type": "application/json;odata=verbose",
    "Authorization": "Bearer " + token,
  };
}

async function getDigest(token: string): Promise<string> {
  const res = await fetch(SITE_URL + "/_api/contextinfo", {
    method: "POST",
    headers: headers(token),
  });
  const data = await res.json();
  return data.d.GetContextWebInformation.FormDigestValue;
}

export async function getRequests(token: string) {
  const res = await fetch(
    BASE + "/getbytitle('" + LIST_NAMES.requests + "')/items" +
    "?$select=*,RequestedBy/Title,RequestedBy/EMail,AssignedTo/Title" +
    "&$expand=RequestedBy,AssignedTo" +
    "&$orderby=Created desc" +
    "&$top=500",
    { headers: headers(token) }
  );
  const data = await res.json();
  return data.d.results;
}

export async function getRequest(id: number, token: string) {
  const res = await fetch(
    BASE + "/getbytitle('" + LIST_NAMES.requests + "')/items(" + id + ")" +
    "?$select=*,RequestedBy/Title,AssignedTo/Title" +
    "&$expand=RequestedBy,AssignedTo",
    { headers: headers(token) }
  );
  const data = await res.json();
  return data.d;
}

export async function updateRequest(
  id: number,
  payload: Record<string, unknown>,
  token: string
): Promise<void> {
  const digest = await getDigest(token);
  await fetch(
    BASE + "/getbytitle('" + LIST_NAMES.requests + "')/items(" + id + ")",
    {
      method: "PATCH",
      headers: {
        ...headers(token),
        "X-RequestDigest": digest,
        "IF-MATCH": "*",
        "X-HTTP-Method": "MERGE",
      },
      body: JSON.stringify({
        "__metadata": { "type": "SP.Data.SNOW_RequestsListItem" },
        ...payload,
      }),
    }
  );
}

export async function createRequest(
  payload: Record<string, unknown>,
  token: string
): Promise<void> {
  const digest = await getDigest(token);
  await fetch(
    BASE + "/getbytitle('" + LIST_NAMES.requests + "')/items",
    {
      method: "POST",
      headers: {
        ...headers(token),
        "X-RequestDigest": digest,
      },
      body: JSON.stringify({
        "__metadata": { "type": "SP.Data.SNOW_RequestsListItem" },
        ...payload,
      }),
    }
  );
}