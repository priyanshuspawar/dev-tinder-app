import { useState } from "react";
import FeedCard from "@/components/feed-card";
import { useQuery } from "@tanstack/react-query";
import { getFeed } from "@/queries/profile";
import { Spacer } from "@heroui/react";

const dashboard = () => {
  const [page, setPage] = useState(1);
  const { data: feed, isLoading } = useQuery({
    queryKey: ["feed"],
    queryFn: () => getFeed(page),
  });
  const [profileActiveSlide, setProfileActiveSlide] = useState(0);
  if (isLoading) {
    <Spacer />;
  }
  return (
    <>
      {!feed || feed.length == 0 ? (
        <span className="absolute z-0 top-1/2 w-full text-center italic font-semibold">
          No more users available
        </span>
      ) : (
        feed.map((card) => (
          <FeedCard
            activeSlide={profileActiveSlide}
            setActiveSlide={setProfileActiveSlide}
            key={card._id}
            {...card}
          />
        ))
      )}
    </>
  );
};

export default dashboard;
