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
    const isSibnet = url.searchParams.get("isSibnet") == "true" || false;
    if (isSibnet) {
      url.searchParams.delete("isSibnet");
    }
    let path = url.pathname.match(/\/api\/proxy\/(.*)/)?.[1] + url.search;
    let data = null;
    path = decodeURIComponent(path);

    console.log(path);

    // if (
    //   (isHTML || isNotAnixart || isSibnet) &&
    //   !(
    //     path.startsWith("https://kodik.info") ||
    //     path.startsWith("https://aniqit.com") ||
    //     path.startsWith("https://video.sibnet.ru") ||
    //     path.includes("sibnet.ru")
    //   )
    // ) {
    //   console.log("URL NOT ALLOWED");

    //   return new Response(JSON.stringify({ message: "URL not allowed" }), {
    //     status: 403,
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   });
    // }

    if (isSibnet) {
      const page = await fetch(`https://${path}`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
        },
      }).catch((err) => {
        console.log(err);
        return new Response(err.message, {
          status: 500,
        });
      });
      const pageData = await page.text();

      const videoRe = /\/v\/.*?\.mp4/;
      const video = videoRe.exec(pageData);

      if (video.length == 0) {
        return new Response(JSON.stringify({ message: "Error Fetching Data" }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      const posterRe = /\/upload\/cover\/.*?\.jpg/;
      const posterUrl = posterRe.exec(pageData);

      if (posterUrl.length == 0) {
        return new Response(JSON.stringify({ message: "Error Fetching Data" }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      const response = await fetch(`https://video.sibnet.ru${video[0]}`, {
        redirect: "manual",
        headers: {
          referer: `https://${path}`,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
        },
      }).catch((err) => {
        console.log(err);
        return new Response(err.message, {
          status: 500,
        });
      });

      return new Response(JSON.stringify({ url: `https:${response.headers.get("Location")}`, poster: `https://st.sibnet.ru${posterUrl[0]}` }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (isHTML) {
      const response = await fetch(`https://${path}`);
      data = await response.text();
      return new Response(data, {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      });
    } else if (isNotAnixart) {
      data = await fetchDataViaGet(`https://${path}`);
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

    console.log(path);

    if (isNotAnixart) {
      // if (
      //   !(
      //     path.startsWith("https://kodik.info") ||
      //     path.startsWith("https://aniqit.com")
      //   )
      // ) {
      //   console.log("URL NOT ALLOWED");

      //   return new Response(JSON.stringify({ message: "URL not allowed" }), {
      //     status: 403,
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //   });
      // }

      const params = await request.json()

      const formData = new FormData();
      for (const [key, value] of Object.entries(params)) {
        formData.append(key as any, value as any);
      }

      console.log("get JSON:", params);
      console.log("send FORM:", formData);

      const response = await fetch(`https://${path}`, {
        method: "POST",
        body: formData,
      }).catch((err) => {
        console.log(err);
        return new Response(err.message, {
          status: 500,
        });
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
