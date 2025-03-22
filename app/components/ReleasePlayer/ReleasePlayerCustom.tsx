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
import VideoJS from "videojs-video-element/react";
import MediaThemeSutro from "./MediaThemeSutro";
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
    type: null,
    useCustom: false,
  });
  const [playbackRate, setPlaybackRate] = useState(1);

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
      `https://anix-player.wah.su/?url=${url}&player=kodik`
    );
    const data = await response.json();
    let lowQualityLink = data.links["360"][0].src;
    if (lowQualityLink.includes("https://")) {
      lowQualityLink = lowQualityLink.replace("https://", "//");
    }
    let manifest = `https:${lowQualityLink.replace("360.mp4:hls:", "")}`;
    let poster = `https:${lowQualityLink.replace("360.mp4:hls:manifest.m3u8", "thumb001.jpg")}`;

    if (lowQualityLink.includes("animetvseries")) {
      let blobTxt = "#EXTM3U\n";

      if (data.links.hasOwnProperty("240")) {
        blobTxt += "#EXT-X-STREAM-INF:RESOLUTION=427x240,BANDWIDTH=200000\n";
        !data.links["240"][0].src.startsWith("https:") ?
          (blobTxt += `https:${data.links["240"][0].src}\n`)
        : (blobTxt += `${data.links["240"][0].src}\n`);
      }

      if (data.links.hasOwnProperty("360")) {
        blobTxt += "#EXT-X-STREAM-INF:RESOLUTION=578x360,BANDWIDTH=400000\n";
        !data.links["360"][0].src.startsWith("https:") ?
          (blobTxt += `https:${data.links["360"][0].src}\n`)
        : (blobTxt += `${data.links["360"][0].src}\n`);
      }

      if (data.links.hasOwnProperty("480")) {
        blobTxt += "#EXT-X-STREAM-INF:RESOLUTION=854x480,BANDWIDTH=596000\n";
        !data.links["480"][0].src.startsWith("https:") ?
          (blobTxt += `https:${data.links["480"][0].src}\n`)
        : (blobTxt += `${data.links["480"][0].src}\n`);
      }

      if (data.links.hasOwnProperty("720")) {
        blobTxt += "#EXT-X-STREAM-INF:RESOLUTION=1280x720,BANDWIDTH=1280000\n";
        !data.links["720"][0].src.startsWith("https:") ?
          (blobTxt += `https:${data.links["720"][0].src}\n`)
        : (blobTxt += `${data.links["720"][0].src}\n`);
      }

      let file = new File([blobTxt], "manifest.m3u8", {
        type: "application/x-mpegURL",
      });
      manifest = URL.createObjectURL(file);
    }
    return { manifest, poster };
  };

  const _fetchAnilibriaManifest = async (url: string) => {
    const id = url.split("?id=")[1].split("&ep=")[0];

    const response = await fetch(`https://api.anilibria.tv/v3/title?id=${id}`);
    const data = await response.json();

    const host = `https://${data.player.host}`;
    const ep = data.player.list[episode.selected.position];

    const blobTxt = `#EXTM3U\n${ep.hls.sd && `#EXT-X-STREAM-INF:RESOLUTION=854x480,BANDWIDTH=596000\n${host}${ep.hls.sd}\n`}${ep.hls.hd && `#EXT-X-STREAM-INF:RESOLUTION=1280x720,BANDWIDTH=1280000\n${host}${ep.hls.hd}\n`}${ep.hls.fhd && `#EXT-X-STREAM-INF:RESOLUTION=1920x1080,BANDWIDTH=2560000\n${host}${ep.hls.fhd}\n`}`;
    let file = new File([blobTxt], "manifest.m3u8", {
      type: "application/x-mpegURL",
    });
    let manifest = URL.createObjectURL(file);
    let poster = `https://anixart.libria.fun${ep.preview}`;
    return { manifest, poster };
  };

  const _fetchSibnetManifest = async (url: string) => {
    const response = await fetch(
      `https://sibnet.anix-player.wah.su/?url=${url}`
    );
    const data = await response.json();

    let manifest = data.video;
    let poster = data.poster;
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
          type: "hls",
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
          type: "hls",
        });
        return;
      }
      if (source.selected.name == "Sibnet") {
        const { manifest, poster } = await _fetchSibnetManifest(
          episode.selected.url
        );
        SetPlayerProps({
          src: manifest,
          poster: poster,
          useCustom: true,
          type: "mp4",
        });
        return;
      }
      SetPlayerProps({
        src: episode.selected.url,
        poster: null,
        useCustom: false,
        type: null,
      });
    };
    if (episode.selected) {
      __getInfo();
    }
  }, [episode.selected]);

  return (
    <Card className="aspect-video min-h-min-h-[300px] sm:min-h-[466px] md:min-h-[540px] lg:min-h-[512px] xl:min-h-[608px] 2xl:min-h-[712px]">
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
            <MediaThemeSutro className="object-none w-full aspect-video">
              {playerProps.type == "hls" ?
                <HlsVideo
                  className="object-contain h-full aspect-video"
                  slot="media"
                  src={playerProps.src}
                  poster={playerProps.poster}
                  defaultPlaybackRate={playbackRate}
                  onRateChange={(e) => {
                    // @ts-ignore
                    setPlaybackRate(e.target.playbackRate || 1);
                  }}
                />
              : <VideoJS
                  className="object-contain h-full aspect-video"
                  slot="media"
                  src={playerProps.src}
                  poster={playerProps.poster}
                  defaultPlaybackRate={playbackRate}
                  onRateChange={(e) => {
                    // @ts-ignore
                    setPlaybackRate(e.target.playbackRate || 1);
                  }}
                ></VideoJS>
              }
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
