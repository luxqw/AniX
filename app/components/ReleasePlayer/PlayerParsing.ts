import { tryCatchPlayer, tryCatchAPI } from "#/api/utils";

export async function _fetchAPI(
  url: string,
  onErrorMsg: string,
  setPlayerError: (state) => void,
  onErrorCodes?: Record<number, string>
) {
  const { data, error } = await tryCatchAPI(fetch(url));
  if (error) {
    let errorDetail = "Мы правда не знаем что произошло...";

    if (error.name) {
      if (error.name == "TypeError") {
        errorDetail = "Не удалось подключиться к серверу";
      } else {
        errorDetail = `Неизвестная ошибка ${error.name}: ${error.message}`;
      }
    }
    if (error.code) {
      if (Object.keys(onErrorCodes).includes(error.code.toString())) {
        errorDetail = onErrorCodes[error.code.toString()];
      } else {
        errorDetail = `API вернуло ошибку: ${error.code}`;
      }
    }

    setPlayerError({
      message: onErrorMsg,
      detail: errorDetail,
    });
    return null;
  }
  return data;
}

export async function _fetchPlayer(
  url: string,
  setPlayerError: (state) => void
) {
  const { data, error } = (await tryCatchPlayer(fetch(url))) as any;
  if (error) {
    let errorDetail = "Мы правда не знаем что произошло...";

    if (error.name) {
      if (error.name == "TypeError") {
        errorDetail = "Не удалось подключиться к серверу";
      } else {
        errorDetail = `Неизвестная ошибка ${error.name}: ${error.message}`;
      }
    } else if (error.message) {
      errorDetail = error.message;
    }

    setPlayerError({
      message: "Не удалось получить ссылку на видео",
      detail: errorDetail,
    });
    return null;
  }
  return data;
}

function decryptKodikLink(enc: string) {
  const decryptedBase64 = enc.replace(/[a-zA-Z]/g, (e: any) => {
    return String.fromCharCode(
      (e <= "Z" ? 90 : 122) >= (e = e.charCodeAt(0) + 18) ? e : e - 26
    );
  });
  return atob(decryptedBase64);
}

export const _fetchKodikManifest = async (
  url: string,
  setPlayerError: (state) => void
) => {
  // Fetch episode links via edge function
  if (!process.env.NEXT_PUBLIC_KODIK_PARSER_DOMAIN) {
    setPlayerError({
      message: "Источник не настроен",
      detail: "переменная 'NEXT_PUBLIC_KODIK_PARSER_DOMAIN' не обнаружена",
    });
    return { manifest: null, poster: null };
  }

  const data = await _fetchPlayer(
    `https://${process.env.NEXT_PUBLIC_KODIK_PARSER_DOMAIN}/?url=${url}&player=kodik`,
    setPlayerError
  );
  if (data) {
    let lowQualityLink = data.links["360"][0].src; // we assume that 360p is always present

    if (!lowQualityLink.includes("//")) {
      // check if link is encrypted, else do nothing
      lowQualityLink = decryptKodikLink(lowQualityLink);
    }

    if (lowQualityLink.includes("https://")) {
      // strip the https prefix, since we add it manually
      lowQualityLink = lowQualityLink.replace("https://", "//");
    }

    let manifest = `https:${lowQualityLink.replace("360.mp4:hls:", "")}`;
    let poster = `https:${lowQualityLink.replace("360.mp4:hls:manifest.m3u8", "thumb001.jpg")}`;

    if (
      lowQualityLink.includes("animetvseries") ||
      lowQualityLink.includes("tvseries")
    ) {
      // if link includes "animetvseries" or "tvseries" we need to construct manifest ourselves
      let blobTxt = "#EXTM3U\n";

      if (data.links.hasOwnProperty("240")) {
        blobTxt += "#EXT-X-STREAM-INF:RESOLUTION=427x240,BANDWIDTH=200000\n";
        let link = data.links["240"][0].src;
        let dec = null;
        link.includes("//") ?
          link.startsWith("https:") ?
            (blobTxt += `${link}\n`)
          : (blobTxt += `https:${link}\n`)
        : (dec = decryptKodikLink(link));

        dec ?
          dec.startsWith("https:") ?
            (blobTxt += `${dec}\n`)
          : (blobTxt += `https:${dec}\n`)
        : null;
      }

      if (data.links.hasOwnProperty("360")) {
        blobTxt += "#EXT-X-STREAM-INF:RESOLUTION=578x360,BANDWIDTH=400000\n";
        let link = data.links["360"][0].src;
        let dec = null;
        link.includes("//") ?
          link.startsWith("https:") ?
            (blobTxt += `${link}\n`)
          : (blobTxt += `https:${link}\n`)
        : (dec = decryptKodikLink(link));

        dec ?
          dec.startsWith("https:") ?
            (blobTxt += `${dec}\n`)
          : (blobTxt += `https:${dec}\n`)
        : null;
      }

      if (data.links.hasOwnProperty("480")) {
        blobTxt += "#EXT-X-STREAM-INF:RESOLUTION=854x480,BANDWIDTH=596000\n";
        let link = data.links["480"][0].src;
        let dec = null;
        link.includes("//") ?
          link.startsWith("https:") ?
            (blobTxt += `${link}\n`)
          : (blobTxt += `https:${link}\n`)
        : (dec = decryptKodikLink(link));

        dec ?
          dec.startsWith("https:") ?
            (blobTxt += `${dec}\n`)
          : (blobTxt += `https:${dec}\n`)
        : null;
      }

      if (data.links.hasOwnProperty("720")) {
        blobTxt += "#EXT-X-STREAM-INF:RESOLUTION=1280x720,BANDWIDTH=1280000\n";
        let link = data.links["720"][0].src;
        let dec = null;
        link.includes("//") ?
          link.startsWith("https:") ?
            (blobTxt += `${link}\n`)
          : (blobTxt += `https:${link}\n`)
        : (dec = decryptKodikLink(link));

        dec ?
          dec.startsWith("https:") ?
            (blobTxt += `${dec}\n`)
          : (blobTxt += `https:${dec}\n`)
        : null;
      }

      if (data.links.hasOwnProperty("1080")) {
        blobTxt += "#EXT-X-STREAM-INF:RESOLUTION=1920x1080,BANDWIDTH=2560000\n";
        let link = data.links["1080"][0].src;
        let dec = null;
        link.includes("//") ?
          link.startsWith("https:") ?
            (blobTxt += `${link}\n`)
          : (blobTxt += `https:${link}\n`)
        : (dec = decryptKodikLink(link));

        dec ?
          dec.startsWith("https:") ?
            (blobTxt += `${dec}\n`)
          : (blobTxt += `https:${dec}\n`)
        : null;
      }

      let file = new File([blobTxt], "manifest.m3u8", {
        type: "application/x-mpegURL",
      });
      manifest = URL.createObjectURL(file);
    }
    return { manifest, poster };
  }
  return { manifest: null, poster: null };
};

export const _fetchAnilibriaManifest = async (
  url: string,
  setPlayerError: (state) => void
) => {
  const id = url.split("?id=")[1].split("&ep=")[0];
  const epid = url.split("?id=")[1].split("&ep=")[1];
  const _url = `https://api.anilibria.tv/v3/title?id=${id}`;
  let data = null;
  if (process.env.NEXT_PUBLIC_ANILIBRIA_PARSER_DOMAIN) {
    data = await _fetchPlayer(
      `https://${process.env.NEXT_PUBLIC_ANILIBRIA_PARSER_DOMAIN}/?url=${_url}&player=libria`,
      setPlayerError
    );
  } else {
    data = await _fetchPlayer(_url, setPlayerError);
  }

  if (data) {
    const host = `https://${data.player.host}`;
    const ep = data.player.list[epid];

    // we need to manually construct a manifest file for a hls player
    const blobTxt = `#EXTM3U\n${ep.hls.sd && `#EXT-X-STREAM-INF:RESOLUTION=854x480,BANDWIDTH=596000\n${host}${ep.hls.sd}\n`}${ep.hls.hd && `#EXT-X-STREAM-INF:RESOLUTION=1280x720,BANDWIDTH=1280000\n${host}${ep.hls.hd}\n`}${ep.hls.fhd && `#EXT-X-STREAM-INF:RESOLUTION=1920x1080,BANDWIDTH=2560000\n${host}${ep.hls.fhd}\n`}`;
    let file = new File([blobTxt], "manifest.m3u8", {
      type: "application/x-mpegURL",
    });
    let manifest = URL.createObjectURL(file);
    let poster = `https://anixart.libria.fun${ep.preview}`;
    return { manifest, poster };
  }
  return { manifest: null, poster: null };
};

export const _fetchSibnetManifest = async (
  url: string,
  setPlayerError: (state) => void
) => {
  // Fetch data via cloud endpoint
  if (!process.env.NEXT_PUBLIC_SIBNET_PARSER_DOMAIN) {
    setPlayerError({
      message: "Источник не настроен",
      detail: "переменная 'NEXT_PUBLIC_SIBNET_PARSER_DOMAIN' не обнаружена",
    });
    return { manifest: null, poster: null };
  }
  const data = await _fetchPlayer(
    `https://${process.env.NEXT_PUBLIC_SIBNET_PARSER_DOMAIN}/?url=${url}`,
    setPlayerError
  );
  if (data) {
    let manifest = data.video;
    let poster = data.poster;
    return { manifest, poster };
  }
  return { manifest: null, poster: null };
};
