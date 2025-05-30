import { asJSON, randomUA } from "./shared";
const altDomains = ["kodik.info", "aniqit.com", "kodik.cc", "kodik.biz"];

export async function getKodikURL(res, url: string) {
  const origDomain = url.replace("https://", "").split("/")[0];
  let domain = url.replace("https://", "").split("/")[0];

  if (!altDomains.includes(domain)) {
    asJSON(res, { message: "Wrong url provided for player kodik" }, 400);
    return;
  }

  let user_agent = randomUA();

  let pageRes = await fetch(url, {
    headers: {
      "User-Agent": user_agent,
    },
  });

  if (!pageRes.ok) {
    for (let i = 0; i < altDomains.length - 1; i++) {
      if (url.includes(altDomains[i])) {
        continue;
      }

      user_agent = randomUA();
      const altDomain = altDomains[i];
      const altUrl = url.replace(
        `https://${origDomain}/`,
        `https://${altDomain}/`
      );

      domain = altDomain;
      pageRes = await fetch(altUrl, {
        headers: {
          "User-Agent": user_agent,
        },
      });

      if (pageRes.ok) {
        break;
      }
    }
  }

  if (!pageRes.ok) {
    asJSON(res, { message: "KODIK: failed to load page" }, 500);
    return;
  }

  const pageData = await pageRes.text();
  const urlParamsRe = /var urlParams = .*;$/m;
  const urlParamsMatch = urlParamsRe.exec(pageData);

  if (!urlParamsMatch || urlParamsMatch.length == 0) {
    asJSON(res, { message: `KODIK: failed to find data to parse` }, 500);
    return;
  }

  const urlParamsStr = urlParamsMatch[0]
    .replace("var urlParams = '", "")
    .replace("';", "");

  const urlStr = url.replace(`https://${origDomain}/`, "");
  const type = urlStr.split("/")[0];
  const id = urlStr.split("/")[1];
  const hash = urlStr.split("/")[2];

  const urlParams = JSON.parse(urlParamsStr);
  urlParams["type"] = type;
  urlParams["id"] = id;
  urlParams["hash"] = hash;

  const formData = new FormData();
  for (const [key, value] of Object.entries(urlParams)) {
    formData.append(key, value as any);
  }

  const linksRes = await fetch(`https://${domain}/ftor`, {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent": user_agent,
    },
  });

  if (!linksRes.ok) {
    asJSON(res, { message: `KODIK: failed to get links` }, 500);
    return;
  }

  asJSON(res, await linksRes.json(), 200);
  return;
}
