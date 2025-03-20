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
const YearSeason = ["_", "Зима", "Весна", "Лето", "Осень"];

export const ReleaseLink169Related = (props: any) => {
  const grade = props.grade.toFixed(1);
  const profile_list_status = props.profile_list_status;
  let user_list = null;
  if (profile_list_status != null || profile_list_status != 0) {
    user_list = profile_lists[profile_list_status];
  }
  return (
    <Link
      href={`/release/${props.id}`}
      className={`${
        props.isLinkDisabled ? "pointer-events-none" : ""
      } flex gap-4 items-center justify-between mx-auto w-full max-w-[1024px]`}
      aria-disabled={props.isLinkDisabled}
      tabIndex={props.isLinkDisabled ? -1 : undefined}
    >
      <div className="items-center justify-center flex-1 hidden lg:flex">
        <h1 className="inline-block text-6xl font-bold text-center text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-500 dark:from-blue-500 dark:via-purple-400 dark:to-indigo-300 bg-clip-text ">
          {props.season ? YearSeason[props.season] : ""}
          <br/>
          {props.year ? props.year : ""}
        </h1>
      </div>
      <div className="w-full max-w-[768px] h-auto p-2 bg-gray-100 rounded-lg dark:bg-slate-800">
        <div className="flex w-full h-full gap-2 overflow-hidden">
          <div className="flex-shrink-0">
            <Image
              src={props.image}
              height={250}
              width={250}
              alt={props.title || ""}
              className="object-cover aspect-[9/16] lg:aspect-[12/16] h-auto w-24 md:w-32 lg:w-48 rounded-md"
            />
          </div>
          <div className="flex flex-col flex-1 w-full h-full">
            <div>
              {props.genres && (
                <p className="text-xs font-light text-black dark:text-white md:text-sm lg:text-base xl:text-lg">
                  {props.genres}
                </p>
              )}
              <p className="block text-sm font-bold text-black dark:text-white md:text-base lg:text-lg xl:text-xl md:hidden">
                {`${props.title_ru.slice(0, 47)}${
                  props.title_ru.length > 47 ? "..." : ""
                }`}
              </p>
              <p className="block text-xs font-light text-black dark:text-white md:text-sm lg:text-base xl:text-lg md:hidden">
                {`${props.description.slice(0, 97)}${
                  props.description.length > 97 ? "..." : ""
                }`}
              </p>
              <p className="hidden text-sm font-bold text-black dark:text-white md:text-base lg:text-lg xl:text-xl md:block max-w-[512px]">
                {props.title_ru}
              </p>
              <p className="hidden text-xs font-light text-black dark:text-white md:text-sm:text-base xl:text-lg md:block max-w-[512px]">
                {props.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              <Chip
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
              />
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
              {props.category && <Chip name={props.category.name} />}
              {props.season || props.year ? (
                <Chip
                  bg_color="lg:hidden bg-gray-500"
                  name={props.season ? YearSeason[props.season] : ""}
                  name_2={props.year ? `${props.year} год` : ""}
                  devider=" "
                />
              ) : (
                ""
              )}
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
