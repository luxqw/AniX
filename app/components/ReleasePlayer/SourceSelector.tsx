"use client";

import { Dropdown, DropdownItem } from "flowbite-react";
import { numberDeclension } from "#/api/utils";
import { useUserPlayerPreferencesStore } from "#/store/player";

interface Source {
  id: number;
  name: string;
  episodes_count: number;
}

const DropdownTrigger = ({ name }: Source) => {
  return (
    <div className="flex items-center gap-1 cursor-pointer">
      <span className="w-6 h-6 iconify material-symbols--motion-play"></span>
      <p>{name}</p>
      <span className="w-6 h-6 iconify material-symbols--arrow-drop-down"></span>
    </div>
  );
};

const DropdownItemInternal = ({ name, episodes_count }: Source) => {
  return (
    <div className="flex flex-col gap-2 cursor-pointer">
      <div className="flex items-center gap-2">
        <p>{name}</p>
      </div>
      <div className="flex items-center gap-2">
        <p>
          {episodes_count}{" "}
          {numberDeclension(episodes_count, "серия", "серии", "серий")}
        </p>
      </div>
    </div>
  );
};

export const SourceSelector = (props: {
  availableSource: Source[];
  source: Source;
  setSource: any;
  release_id: any;
}) => {
  const playerPreferenceStore = useUserPlayerPreferencesStore();

  return (
    <Dropdown
      label=""
      dismissOnClick={true}
      renderTrigger={() => (
        <span>
          <DropdownTrigger {...props.source} />
        </span>
      )}
    >
      {props.availableSource.map((source: Source) => (
        <DropdownItem
          key={`source_${source.id}`}
          onClick={() => {
            playerPreferenceStore.setPreferredPlayer(
              props.release_id,
              source.name
            );
            props.setSource({
              selected: source,
              available: props.availableSource,
            });
          }}
        >
          <DropdownItemInternal {...source} />
        </DropdownItem>
      ))}
    </Dropdown>
  );
};
