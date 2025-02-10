import { ReleasePage } from "#/pages/Release";
import { fetchDataViaGet } from "#/api/utils";
import type { Metadata, ResolvingMetadata } from "next";
export const dynamic = 'force-static';

export async function generateMetadata(
  { params },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  const release = await fetchDataViaGet(`https://api.anixart.tv/release/${id}`);
  const previousOG = (await parent).openGraph;

  return {
    title: release.release.title_ru,
    description: release.release.description,
    openGraph: {
      ...previousOG,
      images: [
        {
          url: release.release.image, // Must be an absolute URL
          width: 600,
          height: 800,
        },
      ],
    },
  };
}

export default async function Search({ params }) {
  const id = params.id;
  return <ReleasePage id={id} />;
}
