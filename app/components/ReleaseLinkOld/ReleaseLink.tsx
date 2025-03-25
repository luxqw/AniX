import Link from "next/link";
import { Poster } from "../ReleasePoster/Poster";
import { Chip } from "../Chip/Chip";
// import { ReleaseLink169 } from "./ReleaseLink.16_9FullImage";
// import { ReleaseLink169Poster } from "./ReleaseLink.16_9Poster";
// import { ReleaseLinkPoster } from "./ReleaseLink.Poster";

const profile_lists = {
  // 0: "Не смотрю",
  1: { name: "Смотрю", bg_color: "bg-green-500" },
  2: { name: "В планах", bg_color: "bg-purple-500" },
  3: { name: "Просмотрено", bg_color: "bg-blue-500" },
  4: { name: "Отложено", bg_color: "bg-yellow-500" },
  5: { name: "Брошено", bg_color: "bg-red-500" },
};

export const ReleaseLink = (props: {
  // type?: "16_9" | "poster";
  image: string;
  title_ru: string;
  title_original: string;
  genres?: string;
  grade?: number;
  id: number;
  settings?: {
    showGenres?: boolean;
  };
  profile_list_status?: number;
  status?: {
    name: string;
  };
  status_id?: number;
}) => {
  // const type = props.type || "16_9";

  // if (type == "16_9") {
  //   return (
  //     <>
  //       <div>TYPE=16/9</div>

  //       {/* <div className="hidden lg:block"><ReleaseLink169 {...props} /></div> */}
  //       {/* <div className="block lg:hidden"><ReleaseLink169Poster {...props} /></div> */}
  //     </>
  //   );
  // }
  // if (props.type == "poster") {
  return (
    <>You NEED to fix this. Replace import to `ReleaseLinkUpdate`</>
  );
  // return <ReleaseLinkPoster {...props} />;
  // }
};
