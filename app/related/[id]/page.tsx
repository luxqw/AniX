import { RelatedPage } from "#/pages/Related";
import { fetchDataViaGet } from "#/api/utils";
import type { Metadata, ResolvingMetadata } from "next";
export const dynamic = 'force-static';

export async function generateMetadata({ params }, parent: ResolvingMetadata): Promise<Metadata> {
  const id:string = params.id;
  const related: any = await fetchDataViaGet(`https://api.anixart.tv/related/${id}/0`);
  const firstRelease: any = await fetchDataViaGet(`https://api.anixart.tv/release/${related.content[0].id}`);
  const previousOG = (await parent).openGraph;

  return {
    title: "Франшиза - " + firstRelease.release.related.name_ru || firstRelease.release.related.name,
    description: firstRelease.release.description,
    openGraph: {
      ...previousOG,
      images: [
        {
          url: firstRelease.release.image, // Must be an absolute URL
          width: 600,
          height: 800,
        },
      ],
    },
  };
}

export default async function Related({ params }) {
  const id: string = params.id;
  const related: any = await fetchDataViaGet(`https://api.anixart.tv/related/${id}/0`);
  const firstRelease: any = await fetchDataViaGet(`https://api.anixart.tv/release/${related.content[0].id}`);
  return <RelatedPage id={id} title={firstRelease.release.related.name_ru || firstRelease.release.related.name} />;
}
