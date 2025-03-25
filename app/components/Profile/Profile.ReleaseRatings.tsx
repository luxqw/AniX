import {
  Card,
  Carousel,
  RatingStar,
  Rating,
  Modal,
  Button,
} from "flowbite-react";
import type {
  FlowbiteCarouselIndicatorsTheme,
  FlowbiteCarouselControlTheme,
} from "flowbite-react";
import Image from "next/image";
import { unixToDate, useSWRfetcher } from "#/api/utils";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ENDPOINTS } from "#/api/config";
import useSWRInfinite from "swr/infinite";
import { Spinner } from "../Spinner/Spinner";
import { Poster } from "../ReleasePoster/Poster";

const CarouselIndicatorsTheme: FlowbiteCarouselIndicatorsTheme = {
  active: {
    off: "bg-gray-300/50 hover:bg-gray-400 dark:bg-gray-400/50 dark:hover:bg-gray-200",
    on: "bg-gray-600 dark:bg-gray-200",
  },
  base: "h-3 w-3 rounded-full",
  wrapper: "absolute bottom-5 left-1/2 flex -translate-x-1/2 space-x-3",
};

const CarouselControlsTheme: FlowbiteCarouselControlTheme = {
  base: "inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-600/30 group-hover:bg-gray-600/50 group-focus:outline-none group-focus:ring-4 group-focus:ring-gray-600 dark:bg-gray-400/30 dark:group-hover:bg-gray-400/60 dark:group-focus:ring-gray-400/70 sm:h-10 sm:w-10",
  icon: "h-5 w-5 text-gray-600 dark:text-gray-400 sm:h-6 sm:w-6",
};

const CarouselTheme = {
  root: {
    base: "relative h-full w-full max-w-[700px]",
  },
  indicators: CarouselIndicatorsTheme,
  control: CarouselControlsTheme,
};

export const ProfileReleaseRatings = (props: any) => {
  const [modal, setModal] = useState(false);
  return (
    <Card className="h-fit">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Оценки</h1>
        <Button color={"light"} onClick={() => setModal(true)} size={"xs"}>
          Посмотреть все
        </Button>
      </div>
      <div className="flex min-h-[200px] items-center justify-center">
        <Carousel theme={CarouselTheme}>
          {props.ratings.map((release) => {
            return (
              <Link href={`/release/${release.id}`} key={`vote-${release.id}`}>
                <div className="flex gap-4 xl:mx-20">
                  <div className="max-w-32">
                    <Poster image={release.image} />
                  </div>
                  <div className="flex flex-col gap-1 py-4">
                    <h2 className="text-lg">{release.title_ru}</h2>
                    <Rating size="md">
                      <RatingStar filled={release.my_vote >= 1} />
                      <RatingStar filled={release.my_vote >= 2} />
                      <RatingStar filled={release.my_vote >= 3} />
                      <RatingStar filled={release.my_vote >= 4} />
                      <RatingStar filled={release.my_vote >= 5} />
                    </Rating>
                    <h2 className="text-gray-500 text-md dark:text-gray-400">
                      {unixToDate(release.voted_at, "full")}
                    </h2>
                  </div>
                </div>
              </Link>
            );
          })}
        </Carousel>
      </div>
      <ProfileReleaseRatingsModal
        profile_id={props.profile_id}
        token={props.token}
        isOpen={modal}
        setIsOpen={setModal}
      />
    </Card>
  );
};

const ProfileReleaseRatingsModal = (props: {
  isOpen: boolean;
  setIsOpen: any;
  profile_id: number;
  token: string | null;
}) => {
  const [currentRef, setCurrentRef] = useState<any>(null);
  const modalRef = useCallback((ref) => {
    setCurrentRef(ref);
  }, []);

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.content.length) return null;
    let url = `${ENDPOINTS.user.profile}/vote/release/voted/${props.profile_id}/${pageIndex}?sort=1`;
    if (props.token) {
      url += `&token=${props.token}`;
    }
    return url;
  };

  const { data, error, isLoading, size, setSize } = useSWRInfinite(
    getKey,
    useSWRfetcher,
    { initialSize: 2 }
  );

  const [content, setContent] = useState([]);
  useEffect(() => {
    if (data) {
      let allReleases = [];
      for (let i = 0; i < data.length; i++) {
        allReleases.push(...data[i].content);
      }
      setContent(allReleases);
    }
  }, [data]);

  const [scrollPosition, setScrollPosition] = useState(0);
  function handleScroll() {
    const height = currentRef.scrollHeight - currentRef.clientHeight;
    const windowScroll = currentRef.scrollTop;
    const scrolled = (windowScroll / height) * 100;
    setScrollPosition(Math.floor(scrolled));
  }

  useEffect(() => {
    if (scrollPosition >= 95 && scrollPosition <= 96) {
      setSize(size + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollPosition]);

  return (
    <Modal
      dismissible
      show={props.isOpen}
      onClose={() => props.setIsOpen(false)}
      size={"4xl"}
    >
      <Modal.Header>Оценки</Modal.Header>
      <div
        className="flex flex-col gap-2 p-4 overflow-y-auto"
        onScroll={handleScroll}
        ref={modalRef}
      >
        {isLoading && <Spinner />}
        {content && content.length > 0 ?
          content.map((release) => {
            return (
              <Link
                href={`/release/${release.id}`}
                key={`vote-modal-${release.id}`}
              >
                <div className="flex gap-4 xl:mx-20">
                  <div className="flex-shrink-0 max-w-32">
                    <Poster image={release.image} />
                  </div>
                  <div className="flex flex-col gap-1 py-2">
                    <h2 className="text-lg">{release.title_ru}</h2>
                    <div className="flex items-center gap-1">
                      <p className="text-md">
                        {release.episodes_total ? release.episodes_total : "?"}{" "}
                        эп.
                      </p>
                      <span className="mx-1.5 h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400 hidden lg:block" />
                      <p className="text-md">
                        <Rating size="xs">
                          <RatingStar filled={true} />{" "}
                          {release.grade ? release.grade.toFixed(1) : "?"} из 5
                        </Rating>
                      </p>
                    </div>
                    <Rating size="md">
                      <RatingStar filled={release.my_vote >= 1} />
                      <RatingStar filled={release.my_vote >= 2} />
                      <RatingStar filled={release.my_vote >= 3} />
                      <RatingStar filled={release.my_vote >= 4} />
                      <RatingStar filled={release.my_vote >= 5} />
                    </Rating>
                    <h2 className="text-gray-500 text-md dark:text-gray-400">
                      {unixToDate(release.voted_at, "full")}
                    </h2>
                  </div>
                </div>
              </Link>
            );
          })
        : <h1>Оценок нет</h1>}
      </div>
    </Modal>
  );
};
