import Link from "next/link";
import { sinceUnixDate } from "#/api/utils";
import { Chip } from "#/components/Chip/Chip";
import Image from "next/image";

const profile_lists = {
  // 0: "Не смотрю",
  1: { name: "Смотрю", bg_color: "bg-green-500" },
  2: { name: "В планах", bg_color: "bg-purple-500" },
  3: { name: "Просмотрено", bg_color: "bg-blue-500" },
  4: { name: "Отложено", bg_color: "bg-yellow-500" },
  5: { name: "Брошено", bg_color: "bg-red-500" },
};

export const ReleaseLink169Poster = (props: any) => {
  const grade = props.grade ? props.grade.toFixed(1) : null;
  const profile_list_status = props.profile_list_status;
  let user_list = null;
  if (profile_list_status != null || profile_list_status != 0) {
    user_list = profile_lists[profile_list_status];
  }
  return (
    <Link
      href={`/release/${props.id}`}
      className={props.isLinkDisabled ? "pointer-events-none" : ""}
      aria-disabled={props.isLinkDisabled}
      tabIndex={props.isLinkDisabled ? -1 : undefined}
    >
      <div className="w-full h-auto p-2 bg-gray-100 rounded-lg dark:bg-slate-800">
        <div className="flex w-full h-full gap-2 overflow-hidden">
          <div className="flex-shrink-0">
            <Image
              src={props.image}
              height={250}
              width={250}
              alt={props.title || ""}
              className="object-cover aspect-[9/16] h-auto w-24 md:w-32 lg:w-48 rounded-md"
            />
          </div>
          <div className="flex flex-col flex-1 w-full h-full">
            <div>
              {props.genres && (
                <p className="text-xs font-light text-black dark:text-white md:text-sm lg:text-base xl:text-lg">
                  {props.genres}
                </p>
              )}
              <p className="text-sm font-bold text-black dark:text-white md:text-base lg:text-lg xl:text-xl">
                {`${props.title_ru.slice(0, 47)}${
                  props.title_ru.length > 47 ? "..." : ""
                }`}
              </p>
              <p className="text-xs font-light text-black dark:text-white md:text-sm lg:text-base xl:text-lg">
                {`${props.description.slice(0, 97)}${
                  props.description.length > 97 ? "..." : ""
                }`}
              </p>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {grade ? <Chip
                bg_color={
                  grade == 0
                    ? "hidden"
                    : grade < 2
                    ? "bg-red-500"
                    : grade < 3
                    ? "bg-orange-500"
                    : grade < 4
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }
                name={grade}
              /> : ""}
              {user_list && (
                <Chip bg_color={user_list.bg_color} name={user_list.name} />
              )}
              {props.status ? (
                <Chip name={props.status.name} />
              ) : (
                props.status_id != 0 && (
                  <Chip
                    name={
                      props.status_id == 1
                        ? "Завершено"
                        : props.status_id == 2
                        ? "Онгоинг"
                        : props.status_id == 3 && "Анонс"
                    }
                  />
                )
              )}
              <Chip
                name={props.episodes_released && props.episodes_released}
                name_2={
                  props.episodes_total ? props.episodes_total + " эп." : "? эп."
                }
                devider="/"
              />
              {props.last_view_episode && (
                <Chip
                  name={
                    props.last_view_episode.name
                      ? props.last_view_episode.name
                      : `${props.last_view_episode.position + 1} серия`
                  }
                  name_2={
                    "last_view_timestamp" in props &&
                    sinceUnixDate(props.last_view_timestamp)
                  }
                  devider=", "
                />
              )}
              {props.category && <Chip name={props.category.name} />}
              {props.is_favorite && (
                <div className="flex items-center justify-center bg-pink-500 rounded-sm">
                  <span className="w-3 px-4 py-2.5 text-white sm:px-4 sm:py-3 xl:px-6 xl:py-4 iconify mdi--heart"></span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
