"use client";
import useSWRInfinite from "swr/infinite";
import { Spinner } from "#/components/Spinner/Spinner";
import { useState, useEffect } from "react";
import { useScrollPosition } from "#/hooks/useScrollPosition";
import { useUserStore } from "../store/auth";
import { ENDPOINTS } from "#/api/config";
import { ReleaseLink169Related } from "#/components/ReleaseLink/ReleaseLink.16_9Related";
import { useSWRfetcher } from "#/api/utils";


export function RelatedPage(props: {id: number|string, title: string}) {
  const token = useUserStore((state) => state.token);

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.content.length) return null;
    if (token) {
      return `${ENDPOINTS.release.related}/${props.id}/${pageIndex}?token=${token}&API-Version=v2`;
    }
    return `${ENDPOINTS.release.related}/${props.id}/${pageIndex}?API-Version=v2`;
  };

  const { data, error, isLoading, size, setSize } = useSWRInfinite(
    getKey,
    useSWRfetcher,
    { initialSize: 1 }
  );

  const [content, setContent] = useState(null);
  useEffect(() => {
    if (data) {
      let allReleases = [];
      for (let i = 0; i < data.length; i++) {
        allReleases.push(...data[i].content);
      }
      setContent(allReleases);
    }
  }, [data]);

  const scrollPosition = useScrollPosition();
  useEffect(() => {
    if (scrollPosition >= 98 && scrollPosition <= 99) {
      setSize(size + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollPosition]);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-black dark:border-white">
        <h1 className="font-bold text-md sm:text-xl md:text-lg xl:text-xl">
          Франшиза {props.title}
        </h1>
      </div>
      {content && content.length > 0 ? (
        <div className="flex flex-col gap-4 my-4">
          {content.map((release, index) => {
            return <ReleaseLink169Related {...release} key={release.id} _position={index + 1} />
          })}
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center min-w-full min-h-screen">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-w-full gap-4 mt-12 text-xl">
          <span className="w-24 h-24 iconify-color twemoji--broken-heart"></span>
          <p>В франшизе пока ничего нет...</p>
        </div>
      )}
      {data &&
        data[data.length - 1].current_page <
          data[data.length - 1].total_page_count && (
          <button
            className="mx-auto w-[calc(100%-10rem)] border border-black rounded-lg p-2 mb-6 flex items-center justify-center gap-2 hover:bg-black hover:text-white transition"
            onClick={() => setSize(size + 1)}
          >
            <span className="w-10 h-10 iconify mdi--plus"></span>
            <span className="text-lg">Загрузить ещё</span>
          </button>
        )}
    </>
  );
}
