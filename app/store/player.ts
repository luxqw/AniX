"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface userPlayerPreferencesState {
    voiceover: Map<number, string>;
    player: Map<number, string>;
    getPreferredVoiceover: (id: number) => (string | undefined);
    setPreferredVoiceover: (id: number, voiceover: string) => void;
    getPreferredPlayer: (id: number) => (string | undefined);
    setPreferredPlayer: (id: number, player: string) => void;
}

export const useUserPlayerPreferencesStore = create<userPlayerPreferencesState>()(
    persist(
        (set, get) => ({
            voiceover: new Map<number, string>(),
            player: new Map<number, string>(),
            getPreferredVoiceover: (id: number) => get().voiceover[id],
            setPreferredVoiceover: (id: number, voiceover: string) => {
                let current = get().voiceover
                current[id] = voiceover
                set({
                    voiceover: current,
                    player: get().player,
                });
            },
            getPreferredPlayer: (id: number) => get().player[id],
            setPreferredPlayer: (id: number, player: string) => {
                let current = get().player
                current[id] = player
                set({
                    voiceover: get().voiceover,
                    player: current,
                })
            }
        }),
        {
            name: "player-preferences",
        }
    )
);