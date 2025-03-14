import type { NextFetchEvent } from "next/server";
import { fetchDataViaGet, fetchDataViaPost } from "#/api/utils";
import { API_URL } from "#/api/config";

export const config = {
  matcher: "/api/proxy/:path*",
};

export default async function middleware(
  request: Request,
  context: NextFetchEvent
) {
  if (request.method == "GET") {
    const url = new URL(request.url);
    const isApiV2 = url.searchParams.get("API-Version") == "v2" || false;
    if (isApiV2) {
      url.searchParams.delete("API-Version");
    }
    const isHTML = url.searchParams.get("html") == "true" || false;
    if (isHTML) {
      url.searchParams.delete("html");
    }
    const isNotAnixart =
      url.searchParams.get("isNotAnixart") == "true" || false;
    if (isNotAnixart) {
      url.searchParams.delete("isNotAnixart");
    }
    let path = url.pathname.match(/\/api\/proxy\/(.*)/)?.[1] + url.search;
    let data = null;
    path = decodeURIComponent(path);

    if ((isHTML || isNotAnixart) && !path.startsWith("https://kodik.info")) {
      return new Response(JSON.stringify({ message: "URL not allowed" }), {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (isHTML) {
      const response = await fetch(path);
      data = await response.text();
      return new Response(data, {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      });
    } else if (isNotAnixart) {
      data = await fetchDataViaGet(path);
    } else {
      data = await fetchDataViaGet(`${API_URL}/${path}`, isApiV2);
    }

    if (!data) {
      return new Response(JSON.stringify({ message: "Error Fetching Data" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  if (request.method == "POST") {
    const url = new URL(request.url);
    const isApiV2 = url.searchParams.get("API-Version") == "v2" || false;
    if (isApiV2) {
      url.searchParams.delete("API-Version");
    }
    const isNotAnixart =
      url.searchParams.get("isNotAnixart") == "true" || false;
    if (isNotAnixart) {
      url.searchParams.delete("isNotAnixart");
    }
    let path = url.pathname.match(/\/api\/proxy\/(.*)/)?.[1] + url.search;
    path = decodeURIComponent(path);

    if (isNotAnixart) {
      if (!path.startsWith("https://kodik.info")) {
        return new Response(JSON.stringify({ message: "URL not allowed" }), {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      const formData = new FormData();
      for (const [key, value] of Object.entries(await request.json())) {
        formData.append(key as any, value as any);
      }

      const response = await fetch(path, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const ReqContentTypeHeader = request.headers.get("Content-Type") || "";
    let ResContentTypeHeader = "";
    let body = null;

    if (ReqContentTypeHeader.split(";")[0] == "multipart/form-data") {
      ResContentTypeHeader = ReqContentTypeHeader;
      body = await request.arrayBuffer();
    } else {
      ResContentTypeHeader = "application/json; charset=UTF-8";
      body = JSON.stringify(await request.json());
    }

    const data = await fetchDataViaPost(
      `${API_URL}/${path}`,
      body,
      isApiV2,
      ResContentTypeHeader
    );

    if (!data) {
      return new Response(JSON.stringify({ message: "Error Fetching Data" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
