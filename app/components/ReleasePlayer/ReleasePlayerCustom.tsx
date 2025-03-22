"use client";

import { Button, Card } from "flowbite-react";
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
import { tryCatchPlayer, tryCatchAPI } from "#/api/utils";

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
  const [playerError, setPlayerError] = useState(null);
  const [isErrorDetailsOpen, setIsErrorDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const playerPreferenceStore = useUserPlayerPreferencesStore();
  const preferredVO = playerPreferenceStore.getPreferredVoiceover(props.id);
  const preferredSource = playerPreferenceStore.getPreferredPlayer(props.id);

  async function _fetchAPI(
    url: string,
    onErrorMsg: string,
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

  async function _fetchPlayer(url: string) {
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

  const _fetchKodikManifest = async (url: string) => {
    const data = await _fetchPlayer(
      `https://anix-player.wah.su/?url=${url}&player=kodik`
    );
    if (data) {
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
          blobTxt +=
            "#EXT-X-STREAM-INF:RESOLUTION=1280x720,BANDWIDTH=1280000\n";
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
    }
    return { manifest: null, poster: null };
  };

  const _fetchAnilibriaManifest = async (url: string) => {
    const id = url.split("?id=")[1].split("&ep=")[0];
    const data = await _fetchPlayer(
      `https://api.anilibria.tv/v3/title?id=${id}`
    );
    if (data) {
      const host = `https://${data.player.host}`;
      const ep = data.player.list[episode.selected.position];

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

  const _fetchSibnetManifest = async (url: string) => {
    const data = await _fetchPlayer(
      `https://sibnet.anix-player.wah.su/?url=${url}`
    );
    if (data) {
      let manifest = data.video;
      let poster = data.poster;
      return { manifest, poster };
    }
    return { manifest: null, poster: null };
  };

  useEffect(() => {
    const __getInfo = async () => {
      let url = `${ENDPOINTS.release.episode}/${props.id}`;
      if (props.token) {
        url += `?token=${props.token}`;
      }
      const vo = await _fetchAPI(
        url,
        "Не удалось получить информацию о озвучках",
        { 1: "Просмотр запрещён" }
      );
      if (vo) {
        const selectedVO =
          vo.types.find((voiceover: any) => voiceover.name === preferredVO) ||
          vo.types[0];
        setVoiceover({
          selected: selectedVO,
          available: vo.types,
        });
      }
    };
    __getInfo();
  }, []);

  useEffect(() => {
    const __getInfo = async () => {
      let url = `${ENDPOINTS.release.episode}/${props.id}/${voiceover.selected.id}`;
      const src = await _fetchAPI(
        url,
        "Не удалось получить информацию о источниках"
      );
      if (src) {
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
      }
    };
    if (voiceover.selected) {
      __getInfo();
    }
  }, [voiceover.selected]);

  useEffect(() => {
    const __getInfo = async () => {
      let url = `${ENDPOINTS.release.episode}/${props.id}/${voiceover.selected.id}/${source.selected.id}`;
      if (props.token) {
        url += `?token=${props.token}`;
      }
      const episodes = await _fetchAPI(
        url,
        "Не удалось получить информацию о эпизодах"
      );
      if (episodes) {
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
      }
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
        if (manifest) {
          SetPlayerProps({
            src: manifest,
            poster: poster,
            useCustom: true,
            type: "hls",
          });
          setIsLoading(false);
        }
        return;
      }
      if (source.selected.name == "Libria") {
        const { manifest, poster } = await _fetchAnilibriaManifest(
          episode.selected.url
        );
        if (manifest) {
          SetPlayerProps({
            src: manifest,
            poster: poster,
            useCustom: true,
            type: "hls",
          });
          setIsLoading(false);
        }
        return;
      }
      if (source.selected.name == "Sibnet") {
        const { manifest, poster } = await _fetchSibnetManifest(
          episode.selected.url
        );
        if (manifest) {
          SetPlayerProps({
            src: manifest,
            poster: poster,
            useCustom: true,
            type: "mp4",
          });
          setIsLoading(false);
        }
        return;
      }
      SetPlayerProps({
        src: episode.selected.url,
        poster: null,
        useCustom: false,
        type: null,
      });
      setIsLoading(false);
    };
    if (episode.selected) {
      __getInfo();
    }
  }, [episode.selected]);

  return (
    <Card className="aspect-video min-h-min-h-[300px] sm:min-h-[466px] md:min-h-[540px] lg:min-h-[512px] xl:min-h-[608px] 2xl:min-h-[712px]">
      <div className="flex flex-wrap gap-4">
        {voiceover.selected && (
          <VoiceoverSelector
            availableVoiceover={voiceover.available}
            voiceover={voiceover.selected}
            setVoiceover={setVoiceover}
            release_id={props.id}
          />
        )}
        {source.selected && (
          <SourceSelector
            availableSource={source.available}
            source={source.selected}
            setSource={setSource}
            release_id={props.id}
          />
        )}
      </div>

      <div className="flex items-center justify-center w-full h-full">
        {isLoading ?
          !playerError ?
            <Spinner />
          : <div className="flex flex-col gap-2">
              <p className="text-lg font-bold">Ошибка: {playerError.message}</p>
              {!isErrorDetailsOpen ?
                <Button
                  color="light"
                  size="xs"
                  onClick={() => setIsErrorDetailsOpen(true)}
                >
                  Подробнее
                </Button>
              : <p className="text-gray-600 dark:text-gray-100">
                  {playerError.detail}
                </p>
              }
            </div>

        : playerProps.useCustom ?
          !playerError ?
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
          : <div className="flex flex-col gap-2">
              <p className="text-lg font-bold">Ошибка: {playerError.message}</p>
              {!isErrorDetailsOpen ?
                <Button
                  color="light"
                  size="xs"
                  onClick={() => setIsErrorDetailsOpen(true)}
                >
                  Подробнее
                </Button>
              : <p className="text-gray-600 dark:text-gray-100">
                  {playerError.detail}
                </p>
              }
            </div>

        : <iframe src={playerProps.src} className="w-full aspect-video" />}
      </div>

      <div>
        {episode.selected && source.selected && voiceover.selected && (
          <EpisodeSelector
            availableEpisodes={episode.available}
            episode={episode.selected}
            setEpisode={setEpisode}
            release_id={props.id}
            source={source.selected}
            voiceover={voiceover.selected}
            token={props.token}
          />
        )}
      </div>
    </Card>
  );
};
