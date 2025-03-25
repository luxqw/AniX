import { Chip } from "../Chip/Chip";

interface ChipProps {
  settings?: any;
  grade?: any;
  status?: any;
  status_id?: any;
  user_list?: any;
  episodes_released?: any;
  episodes_total?: any;
  category?: any;
  is_favorite?: any;
}

export const ReleaseChips = ({
  settings,
  grade,
  status,
  status_id,
  user_list,
  episodes_released,
  episodes_total,
  category,
  is_favorite,
}: ChipProps) => {
  return (
    <div
      className={`${settings.chips.enabled ? "flex" : "hidden"} gap-1 flex-wrap`}
    >
      {!settings.chips.gradeHidden && grade ?
        <Chip
          className="w-12"
          bg_color={
            grade == 0 ? "hidden"
            : grade < 2 ?
              "bg-red-500"
            : grade < 3 ?
              "bg-orange-500"
            : grade < 4 ?
              "bg-yellow-500"
            : "bg-green-500"
          }
          name={`${grade}`}
        />
      : ""}
      {!settings.chips.listHidden && user_list && (
        <Chip bg_color={user_list.bg_color} name={user_list.name} />
      )}
      {!settings.chips.statusHidden && status ?
        <Chip name={status.name} />
      : status_id != 0 && (
          <Chip
            name={
              status_id == 1 ? "Завершено"
              : status_id == 2 ?
                "Онгоинг"
              : status_id == 3 && "Анонс"
            }
          />
        )
      }
      {!settings.chips.episodesHidden && (
        <Chip
          name={episodes_released && episodes_released}
          name_2={episodes_total ? episodes_total + " эп." : "? эп."}
          devider="/"
        />
      )}
      {!settings.chips.categoryHidden && category && (
        <Chip name={category.name} />
      )}
      {!settings.chips.favHidden && is_favorite && (
        <div className="flex items-center justify-center bg-pink-500 rounded-sm">
          <span className="w-3 px-4 py-2.5 text-white sm:px-4 sm:py-3 xl:px-6 xl:py-4 iconify mdi--heart"></span>
        </div>
      )}
    </div>
  );
};
