import { ProfilePage } from "#/pages/Profile";
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
    title: "Профиль - " + profile.profile.login,
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

export default async function Profile({ params }) {
  const id: string = params.id;
  return <ProfilePage id={id} />;
}
