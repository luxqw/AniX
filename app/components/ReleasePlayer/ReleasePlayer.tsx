"use client";

import { Spinner } from "#/components/Spinner/Spinner";
import { useUserStore } from "#/store/auth";
import { useUserPlayerPreferencesStore } from "#/store/player";
import { Card, Dropdown, Button } from "flowbite-react";
import { ENDPOINTS } from "#/api/config";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/mousewheel";
import "swiper/css/scrollbar";
import { Navigation, Mousewheel, Scrollbar } from "swiper/modules";

const DropdownTheme = {
  floating: {
    target: "w-full md:min-w-[256px] md:w-fit",
  },
};

async function _fetch(url: string) {
  const data = fetch(url)
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Error fetching data");
      }
    })
    .catch((err) => console.log(err));
  return data;
}

const getAnonEpisodesWatched = (
  Release: number,
  Source: number,
  Voiceover: number
) => {
  const anonEpisodesWatched =
    JSON.parse(localStorage.getItem("anonEpisodesWatched")) || {};
  console.log("anonEpisodesWatched", anonEpisodesWatched);

  if (!anonEpisodesWatched.hasOwnProperty(Release)) {
    console.log(
      `no key found for R: ${Release}`,
      anonEpisodesWatched.hasOwnProperty(Release)
    );
    anonEpisodesWatched[Release] = {};
  }
  if (!anonEpisodesWatched[Release].hasOwnProperty(Source)) {
    console.log(
      `no key found for R: ${Release} S: ${Source}`,
      anonEpisodesWatched.hasOwnProperty(Release)
    );
    anonEpisodesWatched[Release][Source] = {};
  }
  if (!anonEpisodesWatched[Release][Source].hasOwnProperty(Voiceover)) {
    console.log(
      `no key found for R: ${Release} S: ${Source} V: ${Voiceover}`,
      anonEpisodesWatched.hasOwnProperty(Release)
    );
    anonEpisodesWatched[Release][Source][Voiceover] = {};
  }

  return anonEpisodesWatched;
};

const getAnonCurrentEpisodeWatched = (
  Release: number,
  Source: number,
  Voiceover: number,
  Episode: number
) => {
  const anonEpisodesWatched =
    JSON.parse(localStorage.getItem("anonEpisodesWatched")) || {};

  if (!anonEpisodesWatched.hasOwnProperty(Release)) {
    console.log(
      `no key found for R: ${Release}`,
      anonEpisodesWatched.hasOwnProperty(Release)
    );
    return false;
  }
  if (!anonEpisodesWatched[Release].hasOwnProperty(Source)) {
    console.log(
      `no key found for R: ${Release} S: ${Source}`,
      anonEpisodesWatched.hasOwnProperty(Release)
    );
    return false;
  }
  if (!anonEpisodesWatched[Release][Source].hasOwnProperty(Voiceover)) {
    console.log(
      `no key found for R: ${Release} S: ${Source} V: ${Voiceover}`,
      anonEpisodesWatched.hasOwnProperty(Release)
    );
    return false;
  }
  if (
    !anonEpisodesWatched[Release][Source][Voiceover].hasOwnProperty(Episode)
  ) {
    console.log(
      `no key found for R: ${Release} S: ${Source} V: ${Voiceover} E: ${Episode}`,
      anonEpisodesWatched.hasOwnProperty(Release)
    );
    return false;
  }

  return anonEpisodesWatched[Release][Source][Voiceover][Episode];
};

const saveAnonEpisodeWatched = (
  Release: number,
  Source: number,
  Voiceover: number,
  Episode: number
) => {
  const anonEpisodesWatched = getAnonEpisodesWatched(
    Release,
    Source,
    Voiceover
  );
  localStorage.setItem(
    "anonEpisodesWatched",
    JSON.stringify({
      ...anonEpisodesWatched,
      [Release]: {
        ...anonEpisodesWatched[Release],
        [Source]: {
          ...anonEpisodesWatched[Release][Source],
          [Voiceover]: {
            ...anonEpisodesWatched[Release][Source][Voiceover],
            [Episode]: true,
          },
        },
      },
    })
  );
};

export const ReleasePlayer = (props: { id: number }) => {
  const userStore = useUserStore();
  const preferredVoiceoverStore = useUserPlayerPreferencesStore();
  const storedPreferredVoiceover = preferredVoiceoverStore.getPreferredVoiceover(props.id);
  const storedPreferredPlayer = preferredVoiceoverStore.getPreferredPlayer(props.id);
  const [voiceoverInfo, setVoiceoverInfo] = useState(null);
  const [selectedVoiceover, setSelectedVoiceover] = useState(null);
  const [sourcesInfo, setSourcesInfo] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [episodeInfo, setEpisodeInfo] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const setSelectedVoiceoverAndSaveAsPreferred = (voiceover: any) => {
    setSelectedVoiceover(voiceover);
    preferredVoiceoverStore.setPreferredVoiceover(props.id, voiceover.name);
  }
  const setSelectedPlayerAndSaveAsPreferred = (player: any) => {
    setSelectedSource(player);
    preferredVoiceoverStore.setPreferredPlayer(props.id, player.name);
  }

  useEffect(() => {
    async function _fetchInfo() {
      const voiceover = await _fetch(
        `${ENDPOINTS.release.episode}/${props.id}`
      );
      const preferredVoiceover = voiceover.types.find(
        (voiceover: any) => voiceover.name === storedPreferredVoiceover
      ) || voiceover.types[0];

      setVoiceoverInfo(voiceover.types);
      setSelectedVoiceover(preferredVoiceover);
    }
    _fetchInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function _fetchInfo() {
      const sources = await _fetch(
        `${ENDPOINTS.release.episode}/${props.id}/${selectedVoiceover.id}`
      );
      const preferredSource = sources.sources.find(
        (source: any) => source.name === storedPreferredPlayer
      ) || sources.sources[0];

      setSourcesInfo(sources.sources);
      setSelectedSource(preferredSource);
    }
    if (selectedVoiceover) {
      _fetchInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVoiceover]);

  useEffect(() => {
    async function _fetchInfo(url: string) {
      const episodes = await _fetch(url);

      if (episodes.episodes.length === 0) {
        const remSources = sourcesInfo.filter(
          (source) => source.id !== selectedSource.id
        );
        setSourcesInfo(remSources);
        setSelectedSource(remSources[0]);

        return;
      }

      setEpisodeInfo(episodes.episodes);
      setSelectedEpisode(episodes.episodes[0]);
    }
    if (selectedSource) {
      let url = `${ENDPOINTS.release.episode}/${props.id}/${selectedVoiceover.id}/${selectedSource.id}`;
      if (userStore.token) {
        url = `${ENDPOINTS.release.episode}/${props.id}/${selectedVoiceover.id}/${selectedSource.id}?token=${userStore.token}`;
      }
      _fetchInfo(url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSource, userStore.token]);

  async function _addToHistory(episode: any) {
    if (episode && userStore.token) {
      _fetch(
        `${ENDPOINTS.statistic.addHistory}/${props.id}/${selectedSource.id}/${episode.position}?token=${userStore.token}`
      );
      _fetch(
        `${ENDPOINTS.statistic.markWatched}/${props.id}/${selectedSource.id}/${episode.position}?token=${userStore.token}`
      );
    }
  }

  return (
    <Card>
      {!voiceoverInfo || !sourcesInfo || !episodeInfo ? (
        <div className="flex items-center justify-center w-full aspect-video">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <Dropdown
              label={`Озвучка: ${selectedVoiceover.name}`}
              color="blue"
              theme={DropdownTheme}
            >
              {voiceoverInfo.map((voiceover: any) => (
                <Dropdown.Item
                  key={`voiceover_${voiceover.id}`}
                  onClick={() => setSelectedVoiceoverAndSaveAsPreferred(voiceover)}
                >
                  {voiceover.name}
                </Dropdown.Item>
              ))}
            </Dropdown>
            <Dropdown
              label={`Плеер: ${selectedSource.name}`}
              color="blue"
              theme={DropdownTheme}
            >
              {sourcesInfo.map((source: any) => (
                <Dropdown.Item
                  key={`source_${source.id}`}
                  onClick={() => setSelectedPlayerAndSaveAsPreferred(source)}
                >
                  {source.name}
                </Dropdown.Item>
              ))}
            </Dropdown>
          </div>
          <div className="aspect-video">
            <iframe
              allowFullScreen={true}
              src={selectedEpisode.url}
              className="w-full h-full rounded-md"
            ></iframe>
          </div>
          <div>
            <Swiper
              modules={[Navigation, Mousewheel, Scrollbar]}
              spaceBetween={8}
              slidesPerView={"auto"}
              direction={"horizontal"}
              mousewheel={{
                enabled: true,
                sensitivity: 2,
              }}
              scrollbar={true}
              allowTouchMove={true}
              style={
                {
                  "--swiper-scrollbar-bottom": "0",
                } as React.CSSProperties
              }
            >
              {episodeInfo.map((episode: any) => (
                <SwiperSlide
                  key={`episode_${episode.position}`}
                  style={{ maxWidth: "fit-content" }}
                >
                  <Button
                    color={
                      selectedEpisode.position === episode.position
                        ? "blue"
                        : "light"
                    }
                    theme={{ base: "w-full disabled:opacity-100" }}
                    onClick={() => {
                      setSelectedEpisode(episode);
                      episode.is_watched = true;
                      _addToHistory(episode);
                      saveAnonEpisodeWatched(
                        props.id,
                        selectedSource.id,
                        selectedVoiceover.id,
                        episode.position
                      );
                    }}
                    disabled={selectedEpisode.position === episode.position}
                  >
                    {episode.name
                      ? episode.name
                      : `${
                          selectedSource.name != "Sibnet"
                            ? episode.position
                            : episode.position + 1
                        } серия`}
                    {episode.is_watched ||
                    getAnonCurrentEpisodeWatched(
                      props.id,
                      selectedSource.id,
                      selectedVoiceover.id,
                      episode.position
                    ) ? (
                      <span className="w-5 h-5 ml-2 iconify material-symbols--check-circle"></span>
                    ) : (
                      <span className="w-5 h-5 ml-2 opacity-10 iconify material-symbols--check-circle"></span>
                    )}
                  </Button>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </>
      )}
    </Card>
  );
};
