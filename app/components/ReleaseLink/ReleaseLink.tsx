import { ReleaseLink169 } from "./ReleaseLink.16_9FullImage";
import { ReleaseLink169Poster } from "./ReleaseLink.16_9Poster";
import { ReleaseLinkPoster } from "./ReleaseLink.Poster";

export const ReleaseLink = (props: { type?: "16_9" | "poster" }) => {
  const type = props.type || "16_9";

  if (type == "16_9") {
    return (
      <>
        <div>TYPE=16/9</div>

        {/* <div className="hidden lg:block"><ReleaseLink169 {...props} /></div> */}
        {/* <div className="block lg:hidden"><ReleaseLink169Poster {...props} /></div> */}
      </>
    );
  }
  if (type == "poster") {
    return <div>TYPE=POSTER</div>;
    // return <ReleaseLinkPoster {...props} />;
  }
};
