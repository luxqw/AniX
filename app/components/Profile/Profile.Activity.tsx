"use client";
import { Button, ButtonGroup, Card } from "flowbite-react";
// import Link from "next/link";
// import { numberDeclension } from "#/api/utils";
import { ProfileActivityCollections } from "./Profile.ActivityCollections";
import { useEffect, useState } from "react";
import { CollectionCourusel } from "../CollectionCourusel/CollectionCourusel";

export function ProfileActivity(props: {
  profile_id: number;
  commentCount: number;
  videoCount: number;
  collectionCount: number;
  collectionPreview: any;
  friendsCount: number;
}) {
  const [tab, setTab] = useState<
    "collections" | "comments" | "friends" | "videos"
  >("collections");

  const [collections, setCollections] = useState<Record<number, any>>({});

  function _setCollection(array: any[]) {
    if (array && array.length == 0) {
      return;
    }
    let _coll = array.filter((col) => {
      if (typeof col == "number") {
        return false;
      }
      return true;
    });
    _coll.map((col) => {
      setCollections((prev) => {
        return {
          ...prev,
          [col.id]: col,
        };
      });

      if (
        col.creator.collections_preview &&
        col.creator.collections_preview.length > 0
      ) {
        _setCollection(col.creator.collections_preview || []);
      }
    });
  }

  useEffect(() => {
    _setCollection(props.collectionPreview || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.collectionPreview]);

  return (
    <Card className="overflow-hidden h-fit">
      <h1 className="text-2xl font-bold">Активность</h1>
      <ButtonGroup>
        <Button
          color={tab == "collections" ? "blue" : "light"}
          onClick={() => setTab("collections")}
        >
          Коллекции | {props.collectionCount}
        </Button>
        <Button
          color={tab == "comments" ? "blue" : "light"}
          onClick={() => setTab("comments")}
        >
          Комментарии
        </Button>
        <Button
          color={tab == "friends" ? "blue" : "light"}
          onClick={() => setTab("friends")}
        >
          Друзья
        </Button>
      </ButtonGroup>

      {tab == "collections" && (
        <ProfileActivityCollections
          content={Object.values(collections) || []}
          profile_id={props.profile_id}
        />
      )}
      {tab == "comments" && <>comments</>}
      {tab == "friends" && <>friends</>}

      {/* <div className="flex items-center gap-4 text-lg">
        <div>
          <p>
            {props.commentCount}{" "}
            {numberDeclension(
              props.commentCount,
              "комментарий",
              "комментария",
              "комментариев"
            )}
          </p>
          <p className="mt-2">{props.videoCount} видео</p>
        </div>
        <div>
          <Link href={`/profile/${props.profile_id}/collections`}>
            <p className="border-b-2 border-gray-300 border-solid dark:border-gray-400 hover:border-gray-500 dark:hover:border-gray-200">
              {props.collectionCount}{" "}
              {numberDeclension(
                props.commentCount,
                "коллекция",
                "коллекции",
                "коллекций"
              )}
            </p>
          </Link>
          <p className="mt-2">
            {props.friendsCount}{" "}
            {numberDeclension(props.commentCount, "друзей", "друга", "друзей")}
          </p>
        </div>
      </div> */}
    </Card>
  );
}
