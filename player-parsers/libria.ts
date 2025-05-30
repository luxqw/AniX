import { asJSON } from "./shared";

export async function getAnilibriaURL(res, url: string) {

  if (!url.includes("anilibria")) {
    asJSON(res, { message: "Wrong url provided for player libria" }, 400);
    return
  }

  let apiRes = await fetch(url);
  if (!apiRes.ok) {
    asJSON(res, { message: "LIBRIA: failed to get api response" }, 500);
    return
  }
  asJSON(res, await apiRes.json(), 200);
  return
}
