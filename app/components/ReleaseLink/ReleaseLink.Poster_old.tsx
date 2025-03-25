import Link from "next/link";
import { Chip } from "#/components/Chip/Chip";

const profile_lists = {
  // 0: "Не смотрю",
  1: { name: "Смотрю", bg_color: "bg-green-500" },
  2: { name: "В планах", bg_color: "bg-purple-500" },
  3: { name: "Просмотрено", bg_color: "bg-blue-500" },
  4: { name: "Отложено", bg_color: "bg-yellow-500" },
  5: { name: "Брошено", bg_color: "bg-red-500" },
};

export const ReleaseLinkPoster = (props: any) => {
  const grade = props.grade.toFixed(1);
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
      <div
        className="relative w-full h-64 gap-8 p-2 overflow-hidden bg-white bg-center bg-no-repeat bg-cover border border-gray-200 rounded-lg shadow-md lg:min-w-[300px] lg:min-h-[385px] lg:max-w-[300px] lg:max-h-[385px] lg:bg-top dark:border-gray-700 dark:bg-gray-800"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.9) 100%), url(${props.image})`,
        }}
      >
        <div className="flex flex-wrap gap-1">
          <Chip
            bg_color={
              props.grade.toFixed(1) == 0
                ? "hidden"
                : props.grade.toFixed(1) < 2
                ? "bg-red-500"
                : props.grade.toFixed(1) < 3
                ? "bg-orange-500"
                : props.grade.toFixed(1) < 4
                ? "bg-yellow-500"
                : "bg-green-500"
            }
            name={props.grade.toFixed(1)}
          />
          {props.status ? (
            <Chip name={props.status.name} />
          ) : (
            <Chip
              name={
                props.status_id == 1
                  ? "Завершено"
                  : props.status_id == 2
                  ? "Онгоинг"
                  : "Анонс"
              }
            />
          )}
          <Chip
            name={props.episodes_released && props.episodes_released}
            name_2={
              props.episodes_total ? props.episodes_total + " эп." : "? эп."
            }
            devider="/"
          />
        </div>
        <div className="absolute flex flex-col gap-2 text-white bottom-4 left-2 right-2">
          {props.title_ru && (
            <p className="text-xl font-bold text-white md:text-2xl">
              {props.title_ru}
            </p>
          )}
          {props.title_original && (
            <p className="text-sm text-gray-300 md:text-base">
              {props.title_original}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};
