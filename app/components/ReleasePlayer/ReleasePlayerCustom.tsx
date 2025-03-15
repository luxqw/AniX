"use client";

import { Card } from "flowbite-react";
import { useEffect, useState } from "react";
import { ENDPOINTS } from "#/api/config";

import { VoiceoverSelector } from "./VoiceoverSelector";
import { SourceSelector } from "./SourceSelector";
import { EpisodeSelector } from "./EpisodeSelector";
import { Spinner } from "../Spinner/Spinner";
import { useUserPlayerPreferencesStore } from "#/store/player";

import HlsVideo from "hls-video-element/react";
import MediaThemeSutro from "player.style/sutro/react";
import { getAnonEpisodesWatched } from "./ReleasePlayer";

export const ReleasePlayerCustom = (props: {
  id: number;
  token: string | null;
}) => {
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
  const [playerProps, SetPlayerProps] = useState({
    src: null,
    poster: null,
    useCustom: false,
  });

  const playerPreferenceStore = useUserPlayerPreferencesStore();
  const preferredVO = playerPreferenceStore.getPreferredVoiceover(props.id);
  const preferredSource = playerPreferenceStore.getPreferredPlayer(props.id);

  const _fetchVoiceover = async (release_id: number) => {
    let url = `${ENDPOINTS.release.episode}/${release_id}`;
    if (props.token) {
      url += `?token=${props.token}`;
    }
    const response = await fetch(url);
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
    let url = `${ENDPOINTS.release.episode}/${release_id}/${voiceover_id}/${source_id}`;
    if (props.token) {
      url += `?token=${props.token}`;
    }
    const response = await fetch(url);
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
    }

    const urlParamsStr = urlParamsMatch[0]
      .replace("var urlParams = '", "")
      .replace("';", "");
    const urlParams = JSON.parse(urlParamsStr);

    const domain = url.replace("https://", "").split("/")[0];
    const urlStr = url.replace(`https://${domain}/`, "");
    const type = urlStr.split("/")[0];
    const id = urlStr.split("/")[1];
    const hash = urlStr.split("/")[2];

    const responseMan = await fetch(
      `/api/proxy/${encodeURIComponent(`https://${domain}/ftor`)}?isNotAnixart=true`,
      {
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
          info: {},
        }),
      }
    );
    const dataMan = await responseMan.json();
    let manifest = `https:${dataMan.links["360"][0].src.replace("360.mp4:hls:", "")}`;
    let poster = `https:${dataMan.links["360"][0].src.replace("360.mp4:hls:manifest.m3u8", "thumb001.jpg")}`;
    return { manifest, poster };
  };

  const _fetchAnilibriaManifest = async (url: string) => {
    const id = url.split("?id=")[1].split("&ep=")[0];

    const response = await fetch(`https://api.anilibria.tv/v3/title?id=${id}`);
    const data = await response.json();

    const host = `https://${data.player.host}`;
    const ep = data.player.list[episode.selected.position];

    const blobTxt = `#EXTM3U\n${ep.hls.sd && `#EXT-X-STREAM-INF:RESOLUTION=854x480,BANDWIDTH=596000\n${host}${ep.hls.sd}\n`}${ep.hls.hd && `#EXT-X-STREAM-INF:RESOLUTION=1280x720,BANDWIDTH=1280000\n${host}${ep.hls.hd}\n`}${ep.hls.fhd && `#EXT-X-STREAM-INF:RESOLUTION=1920x1080,BANDWIDTH=2560000\n${host}${ep.hls.fhd}\n`}`;
    const blob = new Blob([blobTxt], { type: "application/x-mpegURL" });

    let file = new File([blobTxt], "manifest.m3u8", {
      type: "application/x-mpegURL",
    });
    let manifest = URL.createObjectURL(file);
    let poster = `https://anixart.libria.fun${ep.preview}`;
    return { manifest, poster };
  };

  useEffect(() => {
    const __getInfo = async () => {
      const vo = await _fetchVoiceover(props.id);
      const selectedVO =
        vo.types.find((voiceover: any) => voiceover.name === preferredVO) ||
        vo.types[0];
      setVoiceover({
        selected: selectedVO,
        available: vo.types,
      });
    };
    __getInfo();
  }, []);

  useEffect(() => {
    const __getInfo = async () => {
      const src = await _fetchSource(props.id, voiceover.selected.id);
      const selectedSrc =
        src.sources.find((source: any) => source.name === preferredSource) ||
        src.sources[0];
      if (selectedSrc.episodes_count == 0) {
        const remSources = src.sources.filter(
          (source: any) => source.id !== selectedSrc.id
        );
        setSource({
          selected: remSources[0],
          available: remSources,
        });
        return;
      }
      setSource({
        selected: selectedSrc,
        available: src.sources,
      });
    };
    if (voiceover.selected) {
      __getInfo();
    }
  }, [voiceover.selected]);

  useEffect(() => {
    const __getInfo = async () => {
      const episodes = await _fetchEpisode(
        props.id,
        voiceover.selected.id,
        source.selected.id
      );

      let anonEpisodesWatched = getAnonEpisodesWatched(
        props.id,
        source.selected.id,
        voiceover.selected.id
      );
      let lastEpisodeWatched = Math.max.apply(
        0,
        Object.keys(
          anonEpisodesWatched[props.id][source.selected.id][
            voiceover.selected.id
          ]
        )
      );
      let selectedEpisode =
        episodes.episodes.find(
          (episode: any) => episode.position == lastEpisodeWatched
        ) || episodes.episodes[0];

      setEpisode({
        selected: selectedEpisode,
        available: episodes.episodes,
      });
    };
    if (source.selected) {
      __getInfo();
    }
  }, [source.selected]);

  useEffect(() => {
    const __getInfo = async () => {
      if (source.selected.name == "Kodik") {
        const { manifest, poster } = await _fetchKodikManifest(
          episode.selected.url
        );
        SetPlayerProps({
          src: manifest,
          poster: poster,
          useCustom: true,
        });
        return;
      }
      if (source.selected.name == "Libria") {
        const { manifest, poster } = await _fetchAnilibriaManifest(
          episode.selected.url
        );
        SetPlayerProps({
          src: manifest,
          poster: poster,
          useCustom: true,
        });
        return;
      }
      SetPlayerProps({
        src: episode.selected.url,
        poster: null,
        useCustom: false,
      });
    };
    if (episode.selected) {
      __getInfo();
    }
  }, [episode.selected]);

  return (
    <Card className="h-full">
      {(
        !voiceover.selected ||
        !source.selected ||
        !episode.selected ||
        !playerProps.src
      ) ?
        <div className="flex items-center justify-center w-full aspect-video">
          <Spinner />
        </div>
      : <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4">
            <VoiceoverSelector
              availableVoiceover={voiceover.available}
              voiceover={voiceover.selected}
              setVoiceover={setVoiceover}
              release_id={props.id}
            />
            <SourceSelector
              availableSource={source.available}
              source={source.selected}
              setSource={setSource}
              release_id={props.id}
            />
          </div>
          {playerProps.useCustom ?
            <MediaThemeSutro className="w-full aspect-video">
              <HlsVideo
                slot="media"
                src={playerProps.src}
                poster={playerProps.poster}
              />
            </MediaThemeSutro>
          : <iframe src={playerProps.src} className="w-full aspect-video" />}
          <EpisodeSelector
            availableEpisodes={episode.available}
            episode={episode.selected}
            setEpisode={setEpisode}
            release_id={props.id}
            source={source.selected}
            voiceover={voiceover.selected}
            token={props.token}
          />
        </div>
      }
    </Card>
  );
};
