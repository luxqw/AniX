"use client";

import { Card, Carousel, CustomFlowbiteTheme, FlowbiteCarouselControlTheme, FlowbiteCarouselIndicatorsTheme } from "flowbite-react";
import { ReleaseLink } from "#/components/ReleaseLink/ReleaseLinkUpdate";
import Link from "next/link";

const CarouselIndicatorsTheme: FlowbiteCarouselIndicatorsTheme = {
  active: {
    off: "bg-gray-400/50 hover:bg-gray-200",
    on: "bg-gray-200",
  },
  base: "h-3 w-3 rounded-full max-w-[300px]",
  wrapper: "absolute bottom-5 left-1/2 flex -translate-x-1/2 space-x-3",
};

const CarouselControlsTheme: FlowbiteCarouselControlTheme = {
  base: "inline-flex h-8 w-8 items-center justify-center rounded-full group-focus:outline-none group-focus:ring-4 bg-gray-400/30 group-hover:bg-gray-400/60 group-focus:ring-gray-400/70 sm:h-10 sm:w-10",
  icon: "h-5 w-5 text-gray-400 sm:h-6 sm:w-6",
};

const CarouselTheme: CustomFlowbiteTheme["carousel"] = {
  root: {
    base: "relative h-full w-full max-w-[300px]",
  },
  indicators: CarouselIndicatorsTheme,
  control: CarouselControlsTheme,
};

export const ReleaseInfoRelated = (props: {
  release_id: number;
  related: any;
  related_releases: any;
}) => {
  return (
    <Card>
      <div className="flex justify-between py-2 border-b-2 border-black dark:border-white">
        <h1>Связанные релизы</h1>
        {props.related && (
          <Link href={`/related/${props.related.id}`}>
            <div className="flex items-center">
              <p className="hidden xl:block">Показать все</p>
              <span className="w-6 h-6 iconify mdi--arrow-right"></span>
            </div>
          </Link>
        )}
      </div>
      <div className="flex justify-center mt-2">
        <Carousel pauseOnHover={true} theme={CarouselTheme}>
          {props.related_releases
            .filter((release: any) => {
              if (release.id == props.release_id) {
                return false;
              }
              return true;
            })
            .map((release: any) => {
              return (
                <ReleaseLink
                  key={release.id}
                  {...release}
                  settings={{ showGenres: false, showDescription: false }}
                />
              );
            })}
        </Carousel>
      </div>
    </Card>
  );
};
