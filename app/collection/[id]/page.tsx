import { ViewCollectionPage } from "#/pages/ViewCollection";
import { fetchDataViaGet } from "#/api/utils";
import type { Metadata, ResolvingMetadata } from "next";
export const dynamic = 'force-static';

export async function generateMetadata(
  { params },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  const collection = await fetchDataViaGet(
    `https://api.anixart.tv/collection/${id}`
  );
  const previousOG = (await parent).openGraph;

  return {
    title: collection.collection
      ? "коллекция - " + collection.collection.title
      : "Приватная коллекция",
    description: collection.collection && collection.collection.description,
    openGraph: {
      ...previousOG,
      images: [
        {
          url: collection.collection && collection.collection.image, // Must be an absolute URL
          width: 600,
          height: 800,
        },
      ],
    },
  };
}

export default async function Collections({ params }) {
  return <ViewCollectionPage id={params.id} />;
}
