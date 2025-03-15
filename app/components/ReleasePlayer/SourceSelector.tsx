"use client";

import { Dropdown } from "flowbite-react";
import { numberDeclension } from "#/api/utils";

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

const DropdownItem = ({
  name,
  episodes_count,
}: Source) => {
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
}) => {
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
        <Dropdown.Item
          key={`source_${source.id}`}
          onClick={() =>
            props.setSource({
              selected: source,
              available: props.availableSource,
            })
          }
        >
          <DropdownItem {...source} />
        </Dropdown.Item>
      ))}
    </Dropdown>
  );
};
