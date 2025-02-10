import { CollectionsFullPage } from "#/pages/CollectionsFull";
import { fetchDataViaGet } from "#/api/utils";
import type { Metadata, ResolvingMetadata } from "next";
export const dynamic = 'force-static';

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
    title: "Коллекции - " + profile.profile.login,
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

export default async function Collections({ params }) {
  const profile: any = await fetchDataViaGet(
    `https://api.anixart.tv/profile/${params.id}`
  );
  return (
    <CollectionsFullPage
      type="profile"
      title={`Коллекции пользователя ${profile.profile.login}`}
      profile_id={params.id}
    />
  );
}
