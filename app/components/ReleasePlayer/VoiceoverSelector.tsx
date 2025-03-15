"use client";

import { Dropdown } from "flowbite-react";
import { numberDeclension } from "#/api/utils";
import { useUserPlayerPreferencesStore } from "#/store/player";

interface Voiceover {
  id: number;
  name: string;
  icon: string;
  episodes_count: number;
  view_count: number;
  pinned: boolean;
}

const DropdownTrigger = ({ icon, name, pinned }: Voiceover) => {
  return (
    <div className="flex items-center gap-2 cursor-pointer">
      {icon && <img className="w-6 h-6 rounded-full" src={icon}></img>}
      <p>{name}</p>
      {pinned && (
        <span className="h-6 bg-gray-700 dark:bg-gray-300 iconify material-symbols--push-pin"></span>
      )}
      <span className="w-6 h-6 -ml-2 iconify material-symbols--arrow-drop-down"></span>
    </div>
  );
};

const DropdownItem = ({
  icon,
  name,
  pinned,
  episodes_count,
  view_count,
}: Voiceover) => {
  return (
    <div className="flex flex-col gap-2 cursor-pointer">
      <div className="flex items-center gap-2">
        {icon && <img className="w-6 h-6 rounded-full" src={icon}></img>}
        <p>{name}</p>
        {pinned && (
          <span className="h-6 iconify material-symbols--push-pin"></span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <p>
          {episodes_count}{" "}
          {numberDeclension(episodes_count, "серия", "серии", "серий")}
        </p>
        <p>
          {view_count}{" "}
          {numberDeclension(view_count, "просмотр", "просмотра", "просмотров")}
        </p>
      </div>
    </div>
  );
};

const DropdownTheme = {
  content: "md:grid md:grid-cols-2 xl:grid-cols-4 gap-2 w-full container",
};

export const VoiceoverSelector = (props: {
  availableVoiceover: Voiceover[];
  voiceover: Voiceover;
  setVoiceover: any;
  release_id: number;
}) => {
  const playerPreferenceStore = useUserPlayerPreferencesStore();

  return (
    <Dropdown
      theme={DropdownTheme}
      label=""
      dismissOnClick={true}
      renderTrigger={() => (
        <span>
          <DropdownTrigger {...props.voiceover} />
        </span>
      )}
    >
      {props.availableVoiceover.map((voiceover: Voiceover) => (
        <Dropdown.Item
          className="w-fit"
          key={`voiceover_${voiceover.id}`}
          onClick={() => {
            playerPreferenceStore.setPreferredVoiceover(
              props.release_id,
              voiceover.name
            );
            props.setVoiceover({
              selected: voiceover,
              available: props.availableVoiceover,
            });
          }}
        >
          <DropdownItem {...voiceover} />
        </Dropdown.Item>
      ))}
    </Dropdown>
  );
};
