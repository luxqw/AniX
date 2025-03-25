import { Card, Carousel } from "flowbite-react";
import type {
  FlowbiteCarouselIndicatorsTheme,
  FlowbiteCarouselControlTheme,
  CustomFlowbiteTheme,
} from "flowbite-react";
import { ReleaseLink } from "../ReleaseLink/ReleaseLinkUpdate";

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
    base: "relative h-full w-full max-w-[375px]",
  },
  indicators: CarouselIndicatorsTheme,
  control: CarouselControlsTheme,
};

export const ProfileReleaseHistory = (props: any) => {
  return (
    <Card className="h-fit">
      <h1 className="text-2xl font-bold">Недавно просмотренные</h1>
      <div className="flex justify-center">
        <Carousel theme={CarouselTheme}>
          {props.history.map((release) => {
            return (
              <ReleaseLink
                key={`history-${release.id}`}
                {...release}
                chipsSettings={{ lastWatchedHidden: false }}
              />
            );
          })}
        </Carousel>
      </div>
    </Card>
  );
};
