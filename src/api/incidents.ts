import { SITE_URL, LIST_NAMES } from "../auth/msalConfig";

const BASE = SITE_URL + "/_api/web/lists";

function headers(token: string) {
  return {
    "Accept": "application/json;odata=verbose",
    "Content-Type": "application/json;odata=verbose",
    "Authorization": "Bearer " + token,
  };
}

export async function getIncidents(token: string) {
  const res = await fetch(
    BASE + "/getbytitle('" + LIST_NAMES.incidents + "')/items" +
    "?$select=*,AssignedTo/Title,AssignedTo/EMail,CallerID/Title,CallerID/EMail" +
    "&$expand=AssignedTo,CallerID" +
    "&$orderby=Created desc" +
    "&$top=500",
    { headers: headers(token) }
  );
  const data = await res.json();
  return data.d.results;
}

export async function getIncident(id: number, token: string) {
  const res = await fetch(
    BASE + "/getbytitle('" + LIST_NAMES.incidents + "')/items(" + id + ")" +
    "?$select=*,AssignedTo/Title,CallerID/Title" +
    "&$expand=AssignedTo,CallerID",
    { headers: headers(token) }
  );
  const data = await res.json();
  return data.d;
}

async function getDigest(token: string): Promise<string> {
  const res = await fetch(SITE_URL + "/_api/contextinfo", {
    method: "POST",
    headers: headers(token),
  });
  const data = await res.json();
  return data.d.GetContextWebInformation.FormDigestValue;
}

let cachedEntityType: string | null = null;

async function getEntityType(token: string): Promise<string> {
  if (cachedEntityType) return cachedEntityType;
  const res = await fetch(
    BASE + "/getbytitle('" + LIST_NAMES.incidents + "')?$select=ListItemEntityTypeFullName",
    { headers: headers(token) }
  );
  const data = await res.json();
  cachedEntityType = data.d.ListItemEntityTypeFullName;
  return cachedEntityType!;
}

export async function createIncident(
  payload: Record<string, unknown>,
  token: string
): Promise<any> {
  const [digest, entityType] = await Promise.all([
    getDigest(token),
    getEntityType(token),
  ]);
  const res = await fetch(
    BASE + "/getbytitle('" + LIST_NAMES.incidents + "')/items",
    {
      method: "POST",
      headers: {
        ...headers(token),
        "X-RequestDigest": digest,
      },
      body: JSON.stringify({
        "__metadata": { "type": entityType },
        ...payload,
      }),
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error("SharePoint create failed (" + res.status + "): " + errText);
  }
  const data = await res.json();
  return data.d;
}

export async function updateIncident(
  id: number,
  payload: Record<string, unknown>,
  token: string
): Promise<void> {
  const [digest, entityType] = await Promise.all([
    getDigest(token),
    getEntityType(token),
  ]);
  const res = await fetch(
    BASE + "/getbytitle('" + LIST_NAMES.incidents + "')/items(" + id + ")",
    {
      method: "PATCH",
      headers: {
        ...headers(token),
        "X-RequestDigest": digest,
        "IF-MATCH": "*",
        "X-HTTP-Method": "MERGE",
      },
      body: JSON.stringify({
        "__metadata": { "type": entityType },
        ...payload,
      }),
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error("SharePoint update failed (" + res.status + "): " + errText);
  }
}
