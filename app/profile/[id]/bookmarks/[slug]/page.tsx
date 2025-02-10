import { BookmarksCategoryPage } from "#/pages/BookmarksCategory";
import { fetchDataViaGet } from "#/api/utils";
import type { Metadata, ResolvingMetadata } from "next";
export const dynamic = 'force-static';

const SectionTitleMapping = {
  watching: "Смотрю",
  planned: "В планах",
  watched: "Просмотрено",
  delayed: "Отложено",
  abandoned: "Заброшено",
};

export async function generateMetadata(
  { params },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id: string = params.id;
  const profile: any = await fetchDataViaGet(
    `https://api.anixart.tv/profile/${id}`
  );
  const previousOG = (await parent).openGraph;

  return {
    title: SectionTitleMapping[params.slug] + " - " + profile.profile.login,
    description: profile.profile.status,
    openGraph: {
      ...previousOG,
      images: [
        {
          url: profile.profile.avatar, // Must be an absolute URL
          width: 600,
          height: 600,
        },
      ],
    },
  };
}

export default function Index({ params }) {
  return (
    <BookmarksCategoryPage
      slug={params.slug}
      SectionTitleMapping={SectionTitleMapping}
      profile_id={params.id}
    />
  );
}
