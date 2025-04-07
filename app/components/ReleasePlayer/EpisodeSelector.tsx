"use client";

import { ENDPOINTS } from "#/api/config";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/mousewheel";
import "swiper/css/scrollbar";
import { Navigation, Mousewheel, Scrollbar } from "swiper/modules";
import { Button } from "flowbite-react";

import {
  getAnonEpisodesWatched,
  saveAnonEpisodeWatched,
} from "./ReleasePlayer";

interface Episode {
  id: number;
  position: number;
  name: string;
  is_watched: boolean;
}

interface Source {
  id: number;
  name: string;
  episodes_count: number;
}

export const EpisodeSelector = (props: {
  availableEpisodes: Episode[];
  episode: Episode;
  setEpisode: any;
  source: Source;
  release_id: any;
  voiceover: any;
  token: string | null;
}) => {
  let anonEpisodesWatched = getAnonEpisodesWatched(
    props.release_id,
    props.source.id,
    props.voiceover.id
  );
  anonEpisodesWatched =
    anonEpisodesWatched[props.release_id][props.source.id][props.voiceover.id];

  async function saveEpisodeToHistory(episode: Episode) {
    if (episode && props.token) {
      fetch(
        `${ENDPOINTS.statistic.addHistory}/${props.release_id}/${props.source.id}/${episode.position}?token=${props.token}`
      );
      fetch(
        `${ENDPOINTS.statistic.markWatched}/${props.release_id}/${props.source.id}/${episode.position}?token=${props.token}`
      );
    }
  }

  return (
    <div className="px-2 py-2 bg-black bg-opacity-75 backdrop-blur-md">
      <Swiper
        modules={[Navigation, Mousewheel, Scrollbar]}
        spaceBetween={8}
        slidesPerView={"auto"}
        direction={"horizontal"}
        mousewheel={{
          enabled: true,
          sensitivity: 4,
        }}
        scrollbar={{
          enabled: true,
          draggable: true,
        }}
        allowTouchMove={true}
        style={
          {
            "--swiper-scrollbar-bottom": "0",
            "--swiper-scrollbar-drag-bg-color": "#ffffff"
          } as React.CSSProperties
        }
      >
        {props.availableEpisodes.map((episode: Episode) => (
          <SwiperSlide
            key={`episode_${episode.position}`}
            style={{ maxWidth: "fit-content" }}
            className="pb-4"
          >
            <Button
              color={
                props.episode.position === episode.position ? "blue" : "light"
              }
              theme={{ base: "w-full disabled:opacity-100" }}
              onClick={() => {
                if (["Sibnet"].includes(props.source.name)) {
                  props.availableEpisodes[episode.position].is_watched = true;
                } else {
                  props.availableEpisodes[episode.position - 1].is_watched =
                    true;
                }
                saveAnonEpisodeWatched(
                  props.release_id,
                  props.source.id,
                  props.voiceover.id,
                  episode.position
                );
                saveEpisodeToHistory(episode);
                props.setEpisode({
                  selected: { ...episode, is_watched: true },
                  available: props.availableEpisodes,
                });
              }}
              disabled={props.episode.position === episode.position}
            >
              <div className="flex items-center">
                {episode.name ?
                  episode.name
                : ["Sibnet"].includes(props.source.name) ?
                  `${episode.position + 1} Серия`
                : `${episode.position} Серия`}
                {(
                  episode.is_watched ||
                  Object.keys(anonEpisodesWatched).includes(
                    episode.position.toString()
                  )
                ) ?
                  <span className="w-4 h-4 ml-2 iconify material-symbols--check-circle"></span>
                : <span className="w-4 h-4 ml-2 iconify material-symbols--check-circle-outline"></span>
                }
              </div>
            </Button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
