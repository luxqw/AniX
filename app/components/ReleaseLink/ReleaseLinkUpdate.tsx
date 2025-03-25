import Link from "next/link";
import { PosterWithStuff } from "../ReleasePoster/PosterWithStuff";

export const ReleaseLink = (props: {
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
  return (
    <Link href={`/release/${props.id}`}>
      <PosterWithStuff {...props} />
    </Link>
  );
};
