import { useState } from "react";
import { feedUser } from "@/queries/types";
import { newData } from "@/utils/constants";
import FeedCard from "@/components/feed-card";

const dashboard = () => {
  const [cards, setCards] = useState<feedUser[]>(newData);
  const [profileActiveSlide, setProfileActiveSlide] = useState(0);
  return (
    <>
      {cards.length == 0 && (
        <span className="absolute z-0 top-1/2 w-full text-center italic font-semibold">
          No more users available
        </span>
      )}
      {cards.map((card) => (
        <FeedCard
          activeSlide={profileActiveSlide}
          setActiveSlide={setProfileActiveSlide}
          key={card._id}
          {...card}
          setCards={setCards}
        />
      ))}
    </>
  );
};

export default dashboard;
