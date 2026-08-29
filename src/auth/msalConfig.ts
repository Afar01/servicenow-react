import type { Configuration, PopupRequest } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId:    "3b4572c2-68eb-40f1-938b-65f4622ccfc5",
    authority:   "https://login.microsoftonline.com/4ff53a26-1fdb-4527-8970-d93458013947",
    redirectUri:  redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
};

export const loginRequest: PopupRequest = {
  scopes: [
    "https://kedirtraining.sharepoint.com/.default",
  ],
};

export const SITE_URL =
  "https://kedirtraining.sharepoint.com/sites/PowerAutomate";

export const LIST_NAMES = {
  incidents: "SNOW_Incidents",
  requests:  "SNOW_Requests",
  workNotes: "SNOW_WorkNotes",
};
