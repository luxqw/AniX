"use client";

import { Card } from "flowbite-react";
import Player from "next-video/player";
import { useEffect, useState } from "react";
import { ENDPOINTS } from "#/api/config";

export const ReleasePlayerCustom = (props: { id: number }) => {
  const [voiceover, setVoiceover] = useState({
    selected: null,
    available: null,
  });
  const [source, setSource] = useState({
    selected: null,
    available: null,
  });
  const [episode, setEpisode] = useState({
    selected: null,
    available: null,
  });
  const [playerSrc, SetPlayerSrc] = useState(null);

  const _fetchVoiceover = async (release_id: number) => {
    const response = await fetch(`${ENDPOINTS.release.episode}/${release_id}`);
    const data = await response.json();
    return data;
  };

  const _fetchSource = async (release_id: number, voiceover_id: number) => {
    const response = await fetch(
      `${ENDPOINTS.release.episode}/${release_id}/${voiceover_id}`
    );
    const data = await response.json();
    return data;
  };

  const _fetchEpisode = async (
    release_id: number,
    voiceover_id: number,
    source_id: number
  ) => {
    const response = await fetch(
      `${ENDPOINTS.release.episode}/${release_id}/${voiceover_id}/${source_id}`
    );
    const data = await response.json();
    return data;
  };

  const _fetchKodikManifest = async (url: string) => {
    const response = await fetch(
      `/api/proxy/${encodeURIComponent(url)}?html=true`
    );
    const data = await response.text();

    const urlParamsRe = /var urlParams = .*;$/m;
    const urlParamsMatch = urlParamsRe.exec(data);

    if (urlParamsMatch.length == 0) {
      alert("Failed to get urlParams");
      return;
    };

    const urlParamsStr = urlParamsMatch[0].replace("var urlParams = '", "").replace("';", "");
    const urlParams = JSON.parse(urlParamsStr);

    const urlStr = url.replace("https://kodik.info/", "")
    const type = urlStr.split("/")[0]
    const id = urlStr.split("/")[1]
    const hash = urlStr.split("/")[2]

    const responseMan = await fetch(
      `/api/proxy/${encodeURIComponent("https://kodik.info/ftor")}?isNotAnixart=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: type,
          id: id,
          hash: hash,
          d: urlParams.d,
          d_sign: urlParams.d_sign,
          pd: urlParams.pd,
          pd_sign: urlParams.pd_sign,
          ref: urlParams.ref,
          ref_sign: urlParams.ref_sign,
          bad_user: false,
          cdn_is_working: true,
          info: {}
        }),
      }
    );
    const dataMan = await responseMan.json();
    let manifest = `https:${dataMan.links["360"][0].src.replace("360.mp4:hls:", "")}`;
    return manifest;
  };

  useEffect(() => {
    const __getInfo = async () => {
      const vo = await _fetchVoiceover(props.id);
      const src = await _fetchSource(props.id, vo.types[0].id);
      const episodes = await _fetchEpisode(
        props.id,
        vo.types[0].id,
        src.sources[0].id
      );
      const manifest = await _fetchKodikManifest(episodes.episodes[0].url);
      SetPlayerSrc(manifest);
    };
    __getInfo();
  }, []);

  return (
    <Card>
      {/* @ts-ignore */}
      {!playerSrc ? <p>Loading...</p> : <Player src={playerSrc} />}
      <p>ReleasePlayerCustom</p>
    </Card>
  );
};
