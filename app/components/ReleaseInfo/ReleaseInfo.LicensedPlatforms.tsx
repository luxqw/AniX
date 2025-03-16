"use client";

import { ENDPOINTS } from "#/api/config";
import { useEffect, useState } from "react";

export const ReleaseInfoStreaming = (props: { release_id: number }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const _getData = async () => {
      const response = await fetch(
        `${ENDPOINTS.release.licensed}/${props.release_id}`
      );
      setData(await response.json());
    };
    _getData();
  }, []);

  return (
    <>
      {!data ?
        ""
      : !(data.content.length > 0) ?
        ""
      : <div>
          <p className="mt-4 mb-1 text-lg">Официальные источники: </p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {data.content.map((item: any) => {
              return (
                <a
                  href={item.url}
                  key={`platform_${item.id}`}
                  className="flex items-center gap-2 px-2 py-1 transition-colors bg-gray-100 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 "
                >
                  <img src={item.icon} className="w-6 h-6 rounded-full" />
                  <p className="text-lg">{item.name}</p>
                </a>
              );
            })}
          </div>
        </div>
      }
    </>
  );
};
