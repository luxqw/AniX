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
// import MediaThemeSutro from "./MediaThemeSutro";
import { getAnonEpisodesWatched } from "./ReleasePlayer";
import { tryCatchPlayer, tryCatchAPI } from "#/api/utils";

import Styles from "./MediaPlayer.module.css";

import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaVolumeRange,
  MediaPlayButton,
  MediaSeekForwardButton,
  MediaMuteButton,
  MediaFullscreenButton,
  MediaCastButton,
  MediaPreviewTimeDisplay,
  MediaPipButton,
  MediaAirplayButton,
} from "media-chrome/react";
import {
  MediaPlaybackRateMenu,
  MediaRenditionMenu,
  MediaSettingsMenu,
  MediaSettingsMenuButton,
  MediaSettingsMenuItem,
} from "media-chrome/react/menu";

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
    // Fetch data through a proxy
    const data = await _fetchPlayer(
      `https://anix-player.wah.su/?url=${url}&player=kodik`
    );
    if (data) {
      let lowQualityLink = data.links["360"][0].src; // we assume that 360p is always present

      if (!lowQualityLink.includes("//")) {
        // check if link is encrypted, else do nothing
        const decryptedBase64 = lowQualityLink.replace(/[a-zA-Z]/g, (e) => {
          return String.fromCharCode(
            (e <= "Z" ? 90 : 122) >= (e = e.charCodeAt(0) + 18) ? e : e - 26
          );
        });
        lowQualityLink = atob(decryptedBase64);
      }

      if (lowQualityLink.includes("https://")) {
        // string the https prefix, since we add it manually
        lowQualityLink = lowQualityLink.replace("https://", "//");
      }

      let manifest = `https:${lowQualityLink.replace("360.mp4:hls:", "")}`;
      let poster = `https:${lowQualityLink.replace("360.mp4:hls:manifest.m3u8", "thumb001.jpg")}`;

      if (lowQualityLink.includes("animetvseries")) {
        // if link includes "animetvseries" we need to construct manifest ourselves
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.id, props.token]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setIsLoading(true);
      setPlayerError(null);
      __getInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episode.selected]);

  return (
    <Card className="">
      {/* <div className="flex items-center justify-center w-full h-full">
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

        : <iframe
            src={playerProps.src}
            className="w-full aspect-video"
            allowFullScreen={true}
          />
        }
      </div> */}

      <div className="flex items-center justify-center w-full h-full">
        <MediaController
          breakpoints="md:480"
          defaultStreamType="on-demand"
          className={`relative w-full overflow-hidden ${Styles["media-controller"]}`}
        >
          <div className="absolute flex flex-wrap w-full gap-2 top-2 left-2">
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
          <div className={`${Styles["media-gradient-bottom"]}`}></div>
          <MediaSettingsMenu
            hidden
            anchor="auto"
            className={`${Styles["media-settings-menu"]}`}
          >
            <MediaSettingsMenuItem
              className={`${Styles["media-settings-menu-item"]}`}
            >
              Скорость воспроизведения
              <MediaPlaybackRateMenu
                slot="submenu"
                rates={"0.5 0.75 1 1.25 1.5 1.75 2" as any}
                // rates={[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]}
                hidden
              >
                <div slot="title">Скорость воспроизведения</div>
              </MediaPlaybackRateMenu>
            </MediaSettingsMenuItem>
            <MediaSettingsMenuItem
              className={`${Styles["media-settings-menu-item"]} ${Styles["quality-settings"]}`}
            >
              Качество
              <MediaRenditionMenu slot="submenu" hidden>
                <div slot="title">Качество</div>
              </MediaRenditionMenu>
            </MediaSettingsMenuItem>
          </MediaSettingsMenu>
          <MediaControlBar className={`${Styles["media-control-bar"]}`}>
            <MediaPlayButton
              mediaPaused={true}
              className={`${Styles["media-button"]} ${Styles["media-play-button"]}`}
            >
              <div slot="tooltip-play">Воспроизвести</div>
              <div slot="tooltip-pause">Пауза</div>
              <svg
                {...({ slot: "icon" } as any)}
                viewBox="0 0 32 32"
                className={`${Styles["svg"]}`}
              >
                <use
                  xlinkHref="#icon-play"
                  className={`${Styles["svg-shadow"]}`}
                ></use>
                <g id="icon-play" className={`${Styles["icon-play"]}`}>
                  <path d="M20.7131 14.6976C21.7208 15.2735 21.7208 16.7265 20.7131 17.3024L12.7442 21.856C11.7442 22.4274 10.5 21.7054 10.5 20.5536L10.5 11.4464C10.5 10.2946 11.7442 9.57257 12.7442 10.144L20.7131 14.6976Z" />
                </g>
                <use
                  xlinkHref="#icon-pause"
                  className={`${Styles["svg-shadow"]}`}
                ></use>
                <g id="icon-pause" className={`${Styles["icon-pause"]}`}>
                  <rect
                    id="pause-left"
                    className={`${Styles["pause-left"]}`}
                    x="10.5"
                    width="1em"
                    y="10.5"
                    height="11"
                    rx="0.5"
                  />
                  <rect
                    id="pause-right"
                    className={`${Styles["pause-right"]}`}
                    x="17.5"
                    width="1em"
                    y="10.5"
                    height="11"
                    rx="0.5"
                  />
                </g>
              </svg>
            </MediaPlayButton>
            <MediaMuteButton
              className={`${Styles["media-button"]} ${Styles["media-mute-button"]}`}
              noTooltip={true}
            >
              <svg
                {...({ slot: "icon" } as any)}
                viewBox="0 0 32 32"
                className={`${Styles["svg"]}`}
              >
                <g id="vol-paths">
                  <path
                    id="speaker-path"
                    d="M16.5 20.486v-8.972c0-1.537-2.037-2.08-2.802-.745l-1.026 1.79a2.5 2.5 0 0 1-.8.85l-1.194.78A1.5 1.5 0 0 0 10 15.446v1.11c0 .506.255.978.678 1.255l1.194.782a2.5 2.5 0 0 1 .8.849l1.026 1.79c.765 1.334 2.802.792 2.802-.745Z"
                  />
                  <path
                    id="vol-low-path"
                    className={`${Styles["vol-path"]} ${Styles["vol-low-path"]}`}
                    d="M18.5 18C19.6046 18 20.5 17.1046 20.5 16C20.5 14.8954 19.6046 14 18.5 14"
                  />
                  <path
                    id="vol-high-path"
                    className={`${Styles["vol-path"]} ${Styles["vol-high-path"]}`}
                    d="M18 21C20.7614 21 23 18.7614 23 16C23 13.2386 20.7614 11 18 11"
                  />
                  <path
                    id="muted-path-1"
                    className={`${Styles["muted-path"]} ${Styles["muted-path-1"]}`}
                    d="M23 18L19 14"
                  />
                  <path
                    id="muted-path-2"
                    className={`${Styles["muted-path"]} ${Styles["muted-path-2"]}`}
                    d="M23 14L19 18"
                  />
                </g>
              </svg>
            </MediaMuteButton>
            <div className={`${Styles["media-volume-range-wrapper"]}`}>
              <MediaVolumeRange
                className={`${Styles["media-volume-range"]}`}
              ></MediaVolumeRange>
            </div>
            <MediaTimeDisplay
              className={`${Styles["media-time-display"]}`}
            ></MediaTimeDisplay>
            <MediaTimeDisplay
              showDuration={true}
              className={`${Styles["media-time-display"]}`}
            ></MediaTimeDisplay>
            <MediaTimeRange className={`${Styles["media-time-range"]}`}>
              <MediaPreviewTimeDisplay
                className={`${Styles["media-preview-time-display"]}`}
              ></MediaPreviewTimeDisplay>
            </MediaTimeRange>
            <MediaSeekForwardButton className={`${Styles["media-button"]}`}>
              <div slot="tooltip-content">Пропустить 1.5 минуты</div>
              <svg
                {...({ slot: "icon" } as any)}
                className={`${Styles["svg"]}`}
                width="256"
                height="256"
                viewBox="-65 -75 400 400"
              >
                <path
                  fill="#fff"
                  d="m246.52 118l-88.19-56.13a12 12 0 0 0-12.18-.39A11.66 11.66 0 0 0 140 71.84v44.59L54.33 61.87a12 12 0 0 0-12.18-.39A11.66 11.66 0 0 0 36 71.84v112.32a11.66 11.66 0 0 0 6.15 10.36a12 12 0 0 0 12.18-.39L140 139.57v44.59a11.66 11.66 0 0 0 6.15 10.36a12 12 0 0 0 12.18-.39L246.52 138a11.81 11.81 0 0 0 0-19.94Zm-108.3 13.19L50 187.38a3.91 3.91 0 0 1-4 .13a3.76 3.76 0 0 1-2-3.35V71.84a3.76 3.76 0 0 1 2-3.35a4 4 0 0 1 1.91-.5a3.94 3.94 0 0 1 2.13.63l88.18 56.16a3.8 3.8 0 0 1 0 6.44Zm104 0L154 187.38a3.91 3.91 0 0 1-4 .13a3.76 3.76 0 0 1-2-3.35V71.84a3.76 3.76 0 0 1 2-3.35a4 4 0 0 1 1.91-.5a3.94 3.94 0 0 1 2.13.63l88.18 56.16a3.8 3.8 0 0 1 0 6.44Z"
                />
              </svg>
            </MediaSeekForwardButton>
            <MediaSettingsMenuButton
              className={`${Styles["media-button"]} ${Styles["media-settings-menu-button"]}`}
            >
              Настройки
              <div slot="tooltip-content">Настройки</div>
              <svg
                viewBox="0 0 32 32"
                className={`${Styles["svg"]}`}
                {...({ slot: "icon" } as any)}
              >
                <use
                  className={`${Styles["svg-shadow"]}`}
                  xlinkHref="#settings-icon"
                ></use>
                <g id="settings-icon">
                  <path d="M16 18C17.1046 18 18 17.1046 18 16C18 14.8954 17.1046 14 16 14C14.8954 14 14 14.8954 14 16C14 17.1046 14.8954 18 16 18Z" />
                  <path d="M21.0176 13.0362L20.9715 12.9531C20.8445 12.7239 20.7797 12.4629 20.784 12.1982L20.8049 10.8997C20.8092 10.6343 20.675 10.3874 20.4545 10.2549L18.5385 9.10362C18.3186 8.97143 18.0472 8.9738 17.8293 9.10981L16.7658 9.77382C16.5485 9.90953 16.2999 9.98121 16.0465 9.98121H15.9543C15.7004 9.98121 15.4513 9.90922 15.2336 9.77295L14.1652 9.10413C13.9467 8.96728 13.674 8.96518 13.4535 9.09864L11.5436 10.2545C11.3242 10.3873 11.1908 10.6336 11.1951 10.8981L11.216 12.1982C11.2203 12.4629 11.1555 12.7239 11.0285 12.9531L10.9831 13.0351C10.856 13.2645 10.6715 13.4535 10.4493 13.5819L9.36075 14.2109C9.13763 14.3398 8.99942 14.5851 9 14.8511L9.00501 17.152C9.00559 17.4163 9.1432 17.6597 9.36476 17.7883L10.4481 18.4167C10.671 18.546 10.8559 18.7364 10.9826 18.9673L11.0313 19.0559C11.1565 19.284 11.2203 19.5431 11.2161 19.8059L11.1951 21.1003C11.1908 21.3657 11.325 21.6126 11.5456 21.7452L13.4615 22.8964C13.6814 23.0286 13.9528 23.0262 14.1707 22.8902L15.2342 22.2262C15.4515 22.0905 15.7001 22.0188 15.9535 22.0188H16.0457C16.2996 22.0188 16.5487 22.0908 16.7664 22.227L17.8348 22.8959C18.0534 23.0327 18.326 23.0348 18.5465 22.9014L20.4564 21.7455C20.6758 21.6127 20.8092 21.3664 20.8049 21.1019L20.784 19.8018C20.7797 19.5371 20.8445 19.2761 20.9715 19.0469L21.0169 18.9649C21.144 18.7355 21.3285 18.5465 21.5507 18.4181L22.6393 17.7891C22.8624 17.6602 23.0006 17.4149 23 17.1489L22.995 14.848C22.9944 14.5837 22.8568 14.3403 22.6352 14.2117L21.5493 13.5818C21.328 13.4534 21.1442 13.2649 21.0176 13.0362Z" />
                </g>
              </svg>
            </MediaSettingsMenuButton>
            <MediaPipButton
              className={`${Styles["media-button"]} ${Styles["media-pip-button"]}`}
            >
              <svg
                {...({ slot: "icon" } as any)}
                className={`${Styles["svg"]}`}
                viewBox="0 0 32 32"
              >
                <use
                  className={`${Styles["svg-shadow"]}`}
                  xlinkHref="#pip-icon"
                ></use>
                <g id="pip-icon">
                  <path d="M12 22H9.77778C9.34822 22 9 21.6162 9 21.1429V10.8571C9 10.3838 9.34822 10 9.77778 10L22.2222 10C22.6518 10 23 10.3838 23 10.8571V12.5714" />
                  <path d="M15 21.5714V16.4286C15 16.1919 15.199 16 15.4444 16H22.5556C22.801 16 23 16.1919 23 16.4286V17V21.5714C23 21.8081 22.801 22 22.5556 22H20.3333H17.6667H15.4444C15.199 22 15 21.8081 15 21.5714Z" />
                </g>
              </svg>
            </MediaPipButton>
            <MediaAirplayButton className={`${Styles["media-button"]}`}>
              <svg
                viewBox="0 0 32 32"
                aria-hidden="true"
                {...({ slot: "icon" } as any)}
                className={`${Styles["svg"]}`}
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M20.5 20h1.722c.43 0 .778-.32.778-.714v-8.572c0-.394-.348-.714-.778-.714H9.778c-.43 0-.778.32-.778.714v1.429"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M11.5 20H9.778c-.43 0-.778-.32-.778-.714v-8.572c0-.394.348-.714.778-.714h12.444c.43 0 .778.32.778.714v1.429"
                />
                <path
                  stroke-linejoin="round"
                  d="m16 19 3.464 3.75h-6.928L16 19Z"
                />
              </svg>
            </MediaAirplayButton>
            <MediaCastButton className={`${Styles["media-button"]}`}>
              <svg
                {...({ slot: "icon" } as any)}
                className={`${Styles["svg"]}`}
                viewBox="0 0 32 32"
              >
                <use
                  className={`${Styles["svg-shadow"]}`}
                  xlinkHref="#cast-icon"
                ></use>
                <g id="cast-icon">
                  <path d="M18.5 21.833h4.167c.46 0 .833-.373.833-.833V11a.833.833 0 0 0-.833-.833H9.333A.833.833 0 0 0 8.5 11v1.111m0 8.056c.92 0 1.667.746 1.667 1.666M8.5 17.667a4.167 4.167 0 0 1 4.167 4.166" />
                  <path d="M8.5 15.167a6.667 6.667 0 0 1 6.667 6.666" />
                </g>
              </svg>
            </MediaCastButton>
            <MediaFullscreenButton
              className={`${Styles["media-button"]} ${Styles["media-fullscreen-button"]}`}
            >
              <div slot="tooltip-enter">Войти в полный экран</div>
              <div slot="tooltip-exit">Выйти из полного экрана</div>
              <svg
                {...({ slot: "enter" } as any)}
                viewBox="0 0 32 32"
                className={`${Styles["svg"]}`}
              >
                <use
                  className={`${Styles["svg-shadow"]}`}
                  xlinkHref="#fs-enter-paths"
                ></use>
                <g id="fs-enter-paths">
                  <g
                    id="fs-enter-top"
                    className={`${Styles["fs-arrow"]} ${Styles["fs-enter-top"]}`}
                  >
                    <path d="M18 10H22V14" />
                    <path d="M22 10L18 14" />
                  </g>
                  <g
                    id="fs-enter-bottom"
                    className={`${Styles["fs-arrow"]} ${Styles["fs-enter-bottom"]}`}
                  >
                    <path d="M14 22L10 22V18" />
                    <path d="M10 22L14 18" />
                  </g>
                </g>
              </svg>
              <svg
                {...({ slot: "exit" } as any)}
                viewBox="0 0 32 32"
                className={`${Styles["svg"]}`}
              >
                <use
                  className={`${Styles["svg-shadow"]}`}
                  xlinkHref="#fs-exit-paths"
                ></use>
                <g id="fs-exit-paths">
                  <g
                    id="fs-exit-top"
                    className={`${Styles["fs-arrow"]} ${Styles["fs-exit-top"]}`}
                  >
                    <path d="M22 14H18V10" />
                    <path d="M22 10L18 14" />
                  </g>
                  <g
                    id="fs-exit-bottom"
                    className={`${Styles["fs-arrow"]} ${Styles["fs-exit-bottom"]}`}
                  >
                    <path d="M10 18L14 18V22" />
                    <path d="M14 18L10 22" />
                  </g>
                </g>
              </svg>
            </MediaFullscreenButton>
          </MediaControlBar>
          {episode.selected && source.selected && voiceover.selected && (
            <div className="w-full">
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
          )}
        </MediaController>
      </div>

      <div></div>
    </Card>
  );
};
