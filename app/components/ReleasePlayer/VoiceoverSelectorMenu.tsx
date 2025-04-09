"use client";

import { ENDPOINTS } from "#/api/config";
import { useEffect } from "react";
import { _fetchAPI } from "./PlayerParsing";
import { useUserPlayerPreferencesStore } from "#/store/player";
import { Button } from "flowbite-react";
import { numberDeclension } from "#/api/utils";

interface Voiceover {
  id: number;
  name: string;
  icon: string;
  episodes_count: number;
  view_count: number;
  pinned: boolean;
}

interface VoiceoverSelectorMenuProps {
  release_id: number;
  token: string | null;
  setVoiceover: (state) => void;
  voiceover: Voiceover;
  voiceoverList: Voiceover[];
  setPlayerError: (state) => void;
}

export const VoiceoverSelectorMenu = ({
  release_id,
  token,
  setVoiceover,
  voiceover,
  voiceoverList,
  setPlayerError,
}: VoiceoverSelectorMenuProps) => {
  const playerPreferenceStore = useUserPlayerPreferencesStore();
  const preferredVO = playerPreferenceStore.getPreferredVoiceover(release_id);

  useEffect(() => {
    const __getInfo = async () => {
      let url = `${ENDPOINTS.release.episode}/${release_id}`;
      if (token) {
        url += `?token=${token}`;
      }
      const vo = await _fetchAPI(
        url,
        "Не удалось получить информацию о озвучках",
        setPlayerError,
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
  }, [release_id, token]);

  return (
    <div className="flex flex-col items-start justify-start gap-4">
        <p className="text-[22px] px-2 py-2 font-bold">Озвучка</p>
        <div className="max-h-full flex flex-col gap-4 items-start justify-start overflow-x-hidden overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-[rgb(60_60_60_/_.8)] scrollbar-track-[rgb(30_30_30_/_.8)]">
          {voiceoverList && voiceoverList.length > 0 ?
            voiceoverList.map((vo: Voiceover) => {
              return (
                <button key={`release-${release_id}-voiceover-${vo.id}`}
                    className={`h-fit justify-start items-start ${voiceover.id == vo.id ? "text-white" : "text-gray-500 hover:text-gray-300"} transition-colors`}
                    onClick={() => {
                            setVoiceover({
                                selected: vo,
                                available: voiceoverList
                            });
                            playerPreferenceStore.setPreferredVoiceover(
                                release_id,
                                vo.name
                            );
                        }
                    }
                >
                    <div className="flex flex-col w-full gap-1">
                        <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {vo.icon ? <img alt="" className="w-6 h-6 rounded-full" src={vo.icon}></img> : ""}
                            <span className="text-[16px] leading-none">{vo.name}</span>
                            {vo.pinned && (
                                <span className={`h-4 iconify material-symbols--push-pin ${voiceover.id == vo.id ? "bg-white" : "bg-gray-500 hover:bg-gray-300"} transition-colors`}></span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <span>{vo.episodes_count} {numberDeclension(vo.episodes_count, "серия", "серии", "серий")}</span>
                            <span>{vo.view_count} {numberDeclension(vo.view_count, "просмотр", "просмотра", "просмотров")}</span>
                        </div>
                    </div>
                </button>
              );
            })
          : ""}
        </div>
    </div>
  );
};
