import { Card, Dropdown, Button, Modal } from "flowbite-react";
import { ENDPOINTS } from "#/api/config";
import Link from "next/link";
import useSWRInfinite from "swr/infinite";
import { useCallback, useEffect, useState } from "react";
import { tryCatchAPI, useSWRfetcher } from "#/api/utils";
import { toast } from "react-toastify";
import { useThemeMode } from "flowbite-react";

const lists = [
  { list: 0, name: "Не смотрю" },
  { list: 1, name: "Смотрю" },
  { list: 2, name: "В планах" },
  { list: 3, name: "Просмотрено" },
  { list: 4, name: "Отложено" },
  { list: 5, name: "Брошено" },
];

const DropdownTheme = {
  floating: {
    target: "flex-1",
  },
};

export const ReleaseInfoUserList = (props: {
  userList: number;
  isFavorite: boolean;
  release_id: number;
  token: string | null;
  setUserList: any;
  setIsFavorite: any;
  collection_count: number;
  profile_id: number | null;
}) => {
  const [AddReleaseToCollectionModalOpen, setAddReleaseToCollectionModalOpen] =
    useState(false);
  const [favButtonDisabled, setFavButtonDisabled] = useState(false);
  const [listEventDisabledd, setListEventDisabled] = useState(false);
  const theme = useThemeMode();

  function _addToFavorite() {
    async function _setFav(url: string) {
      setFavButtonDisabled(true);
      const tid = toast.loading(
        !props.isFavorite ?
          "Добавляем в избранное..."
        : "Удаляем из избранное...",
        {
          position: "bottom-center",
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: false,
          theme: theme.mode == "light" ? "light" : "dark",
        }
      );
      const { data, error } = await tryCatchAPI(fetch(url));

      if (error) {
        toast.update(tid, {
          render:
            !props.isFavorite ?
              "Ошибка добавления в избранное"
            : "Ошибка удаления из избранного",
          type: "error",
          autoClose: 2500,
          isLoading: false,
          closeOnClick: true,
          draggable: true,
        });
        setFavButtonDisabled(false);
        return;
      }

      toast.update(tid, {
        render:
          !props.isFavorite ? "Добавлено в избранное" : "Удалено из избранного",
        type: "success",
        autoClose: 2500,
        isLoading: false,
        closeOnClick: true,
        draggable: true,
      });

      props.setIsFavorite(!props.isFavorite);
      setFavButtonDisabled(false);
    }

    if (props.token) {
      let url = `${ENDPOINTS.user.favorite}/add/${props.release_id}?token=${props.token}`;
      if (props.isFavorite) {
        url = `${ENDPOINTS.user.favorite}/delete/${props.release_id}?token=${props.token}`;
      }
      _setFav(url);
    }
  }

  function _addToList(list: number) {
    if (props.token) {
      props.setUserList(list);
      fetch(
        `${ENDPOINTS.user.bookmark}/add/${list}/${props.release_id}?token=${props.token}`
      );
    }
  }

  return (
    <Card className="h-full">
      <div className="flex flex-wrap gap-1">
        <Button color={"blue"} size="sm" className="w-full lg:w-auto ">
          <Link href={`/release/${props.release_id}/collections`}>
            Показать в коллекциях{" "}
            <span className="p-1 ml-1 text-gray-500 rounded bg-gray-50">
              {props.collection_count}
            </span>
          </Link>
        </Button>
        {props.token && (
          <Button
            color={"blue"}
            size="sm"
            className="w-full lg:w-auto lg:flex-1"
            onClick={() => setAddReleaseToCollectionModalOpen(true)}
          >
            В коллекцию{" "}
            <span className="w-6 h-6 iconify mdi--bookmark-add "></span>
          </Button>
        )}
        {props.token ?
          <>
            <Dropdown
              label={lists[props.userList].name}
              dismissOnClick={true}
              theme={DropdownTheme}
              color="blue"
              size="sm"
            >
              {lists.map((list) => (
                <Dropdown.Item
                  key={list.list}
                  onClick={() => _addToList(list.list)}
                >
                  {list.name}
                </Dropdown.Item>
              ))}
            </Dropdown>
            <Button
              color="blue"
              onClick={() => {
                _addToFavorite();
              }}
              size="sm"
              disabled={favButtonDisabled}
            >
              <span
                className={`iconify w-6 h-6 ${
                  props.isFavorite ? "mdi--heart" : "mdi--heart-outline"
                }`}
              ></span>
            </Button>
          </>
        : <p>Войдите что-бы добавить в список, избранное или коллекцию</p>}
      </div>
      <AddReleaseToCollectionModal
        isOpen={AddReleaseToCollectionModalOpen}
        setIsOpen={setAddReleaseToCollectionModalOpen}
        release_id={props.release_id}
        token={props.token}
        profile_id={props.profile_id}
      />
    </Card>
  );
};

const AddReleaseToCollectionModal = (props: {
  isOpen: boolean;
  setIsOpen: (isopen: boolean) => void;
  release_id: number;
  token: string;
  profile_id: number;
}) => {
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (!props.token) return null;
    if (previousPageData && !previousPageData.content.length) return null;
    return `${ENDPOINTS.collection.userCollections}/${props.profile_id}/${pageIndex}?token=${props.token}`;
  };

  const { data, error, isLoading, size, setSize } = useSWRInfinite(
    getKey,
    useSWRfetcher,
    { initialSize: 2 }
  );

  const [currentRef, setCurrentRef] = useState<any>(null);
  const modalRef = useCallback((ref) => {
    setCurrentRef(ref);
  }, []);

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

  function _addToCollection(collection_id: number) {
    if (props.token) {
      fetch(
        `${ENDPOINTS.collection.addRelease}/${collection_id}?release_id=${props.release_id}&token=${props.token}`
      )
        .then((res) => {
          if (!res.ok) {
            alert("Ошибка добавления релиза в коллекцию.");
          } else {
            return res.json();
          }
        })
        .then((data) => {
          if (data.code != 0) {
            alert(
              "Не удалось добавить релиз в коллекцию, возможно он уже в ней находится."
            );
          } else {
            props.setIsOpen(false);
          }
        });
    }
  }

  return (
    <Modal
      dismissible
      show={props.isOpen}
      onClose={() => props.setIsOpen(false)}
    >
      <Modal.Header>Выбор коллекции</Modal.Header>
      <div
        className="flex flex-col gap-2 p-4 overflow-y-auto"
        onScroll={handleScroll}
        ref={modalRef}
      >
        {content && content.length > 0 ?
          content.map((collection) => (
            <button
              className="relative w-full h-64 overflow-hidden bg-center bg-no-repeat bg-cover rounded-sm group-hover:animate-bg_zoom animate-bg_zoom_rev group-hover:[background-size:110%] "
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.9) 100%), url(${collection.image})`,
              }}
              key={`collection_${collection.id}`}
              onClick={() => _addToCollection(collection.id)}
            >
              <div className="absolute bottom-0 left-0 gap-1 p-2">
                <p className="text-xl font-bold text-white">
                  {collection.title}
                </p>
                <p className="text-gray-400">{collection.description}</p>
              </div>
            </button>
          ))
        : "коллекций не найдено"}
      </div>
    </Modal>
  );
};
