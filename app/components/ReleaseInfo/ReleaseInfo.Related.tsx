"use client";

import { Card, Carousel } from "flowbite-react";
import { ReleaseLink } from "#/components/ReleaseLink/ReleaseLinkUpdate";
import Link from "next/link";

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
        <Carousel pauseOnHover={true}>
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
