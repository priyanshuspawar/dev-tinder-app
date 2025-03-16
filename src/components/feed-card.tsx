import { feedUser } from "@/queries/types";
import { Chip } from "@heroui/react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { Dispatch } from "react";
import { Icon } from "@iconify/react";
import { cn, getAge } from "@/utils/helpers";
import useSideBarStore from "@/store/sidebarStore";
import useAuthStore from "@/store/authStore";
import EditGoal from "./profile-edit/edit-goal";
import EditEssentials from "./profile-edit/edit-essentials";
import EditAbout from "./profile-edit/edit-about";
import { EditSkills } from "./profile-edit/edit-skills";

type Props = feedUser & {
  setCards: Dispatch<React.SetStateAction<feedUser[]>>;
  activeSlide: number;
  setActiveSlide: Dispatch<React.SetStateAction<number>>;
};

const FeedCard = ({
  _id: cardId,
  pictures,
  setCards,
  essentials,
  firstName,
  skills,
  dateOfBirth,
  lookingFor,
  gender,
  about,
  activeSlide,
  setActiveSlide,
}: Props) => {
  const x = useMotionValue(0);
  const offsetBoundary = 150;

  // Motion-based transforms
  const rotate = useTransform(x, [-150, 150], [-18, 18]);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);

  // Directly derive scale values instead of using state
  const leftScale = useTransform(
    x,
    [-offsetBoundary, 0, offsetBoundary],
    [1.5, 1, 0.8]
  );
  const rightScale = useTransform(
    x,
    [-offsetBoundary, 0, offsetBoundary],
    [0.8, 1, 1.5]
  );
  const { user } = useAuthStore();
  const userSkills = user?.skills.map((e) => e.label);
  // Handle swipe removal
  const handleDragEnd = () => {
    if (x.get() > 100) {
      setCards((prev) => prev.slice(1));
    }
    if (x.get() < -100) {
      setCards((prev) => prev.slice(1));
    }
  };
  // handle button removal
  const handleBtnClick = (direction: "left" | "right") => {
    if (direction === "left") {
      setCards((prev) => prev.slice(1));
    } else if (direction === "right") {
      setCards((prev) => prev.slice(1));
    }
  };
  const handleTabClick = () => {
    if (x.get() != 0) {
      return;
    }
    setActiveSlide((activeSlide + 1) % pictures.length);
  };

  const { toggleFullMode, isFullModeActive } = useSideBarStore();
  return (
    <div key={cardId} className="w-full h-full relative">
      {/* Draggable Card */}
      <motion.div
        drag={isFullModeActive ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        style={{ x, opacity, rotate }}
        className="w-full h-full"
      >
        <div
          className={cn(
            "h-full w-full bg-background rounded-lg overflow-y-scroll scrollbar-hide relative",
            {
              "gradient-mask-b-40": !isFullModeActive,
            }
          )}
        >
          <div
            className={cn(
              isFullModeActive ? "flex sticky top-0 z-50" : "hidden",
              "justify-between items-center bg-secondary-50 w-full py-3 px-4"
            )}
          >
            <div>
              <span className="text-2xl tracking-wide font-semibold">
                {firstName}
              </span>
              <span className="text-lg font-medium text-gray-100 whitespace-pre">
                {"  "}
                {getAge(dateOfBirth)}
              </span>
            </div>
            <button
              className="bg-primary-300 p-2 rounded-full hover:scale-125 hover:bg-primary-500 transition-all transform duration-200 ease-in-out cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullMode();
              }}
            >
              <Icon
                className="text-xs rotate-180"
                icon={"icon-park-solid:up-two"}
              />
            </button>
          </div>
          {/* photo */}
          <div
            onClick={() => {
              handleTabClick();
            }}
            className={cn(
              isFullModeActive
                ? "h-1/2 bg-cover bg-no-repeat bg-center bg-black/75"
                : "h-full bg-center bg-cover bg-default",
              "w-full transition-height transform duration-300 ease-in-out"
            )}
            style={{ backgroundImage: `url(${pictures[activeSlide].imgUrl})` }}
          >
            <div className="w-full py-[2px] px-[6px] bg-black absolute z-30 top-2 grid grid-rows-1 grid-flow-col auto-cols-auto gap-1.5">
              {pictures.map((_, i) => {
                const isActive = i == activeSlide;
                return (
                  <span
                    key={i}
                    onClick={() => {
                      setActiveSlide(i);
                    }}
                    className={cn(
                      "h-1 w-full rounded-lg cursor-pointer transition-all transform duration-250",
                      isActive
                        ? "bg-white"
                        : "bg-slate-400/80 hover:bg-slate-400/95"
                    )}
                  />
                );
              })}
            </div>
          </div>
          {/* USER DETAILED INFO ONLY SHOW WHEN FULL MODE ENABLED */}
          {/* RELATIONSHIP GOALS */}
          {isFullModeActive && (
            <div className="mt-2 mb-20 px-2 flex flex-col gap-2">
              <EditGoal value={lookingFor} isReadOnly />
              <EditEssentials
                isReadyOnly
                {...{
                  dateOfBirth,
                  education: essentials.education,
                  gender,
                  location: essentials.location,
                }}
              />
              <EditAbout value={about} isReadOnly />
              <EditSkills skills={skills} isReadOnly userSkills={userSkills} />
            </div>
          )}
        </div>
        {/* infos */}
        <div
          className={cn(
            isFullModeActive &&
              "opacity-0 transition-opacity duration-250 ease-in-out",
            "p-6 absolute bottom-20 w-full"
          )}
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex items-end gap-1">
              <h2 className="font-semibold text-3xl tracking-normal">
                {firstName},
              </h2>
              <span className="font-semibold text-xl">
                {getAge(dateOfBirth)}
              </span>
            </div>

            <button
              className="bg-default p-2.5 rounded-full hover:scale-125 hover:bg-default-300 transition-all transform duration-200 ease-in-out cursor-pointer"
              onClick={toggleFullMode}
            >
              <Icon className="w-2 h-2" icon={"icon-park-solid:up-two"} />
            </button>
          </div>

          <SlideDescription
            about={about}
            activeSlide={activeSlide}
            education={essentials.education}
            location={essentials.location}
            gender={gender}
            lookingFor={lookingFor}
            skills={skills}
            userSkills={userSkills}
          />
          {/* {activeSlide == 0 && (
            <span className="flex items-center gap-1 my-1 font-medium text-lg">
              <Icon
                icon={"akar-icons:location"}
                className="w-4 h-4 text-white"
              />
              <span className="font-medium text-sm">16 km away</span>
            </span>
          )} */}
        </div>
      </motion.div>
      {/* Action Buttons */}
      <div
        className={cn(
          "absolute bottom-0 z-50 w-full h-fit flex flex-col",
          isFullModeActive
            ? "pb-2 transition-all transform duration-200 ease-in-out bg-gradient-to-t from-black/80 via-black/40 to-black/0"
            : "pb-8 bg-gradient-to-t from-black via-black/80 to-black/0"
        )}
      >
        <div className="flex justify-center gap-6">
          <ActionBtn
            onClick={() => {}}
            icon="ci:undo"
            color="text-warning-400"
          />
          <ActionBtn
            onClick={() => handleBtnClick("left")}
            icon="maki:cross"
            color="text-danger-400"
            scale={leftScale}
          />
          <ActionBtn
            onClick={() => handleBtnClick("right")}
            icon="solar:heart-bold"
            color="text-success-400"
            scale={rightScale}
          />
        </div>
      </div>
    </div>
  );
};

export default FeedCard;

/* Reusable Action Button */
const ActionBtn = ({
  icon,
  color,
  scale = 1,
  onClick,
}: {
  icon: string;
  color: string;
  scale?: any;
  onClick: () => void;
}) => (
  <motion.button onClick={onClick} whileTap={{ scale: 0.9 }}>
    <motion.div
      className="flex items-center justify-center w-[50px] h-[50px] rounded-full bg-default shadow transition-all duration-100 ease-out hover:scale-110 hover:bg-default-300"
      style={{ scale }}
    >
      <Icon icon={icon} className={`w-6 h-6 ${color}`} />
    </motion.div>
  </motion.button>
);

type SlideDescriptionProps = {
  skills: {
    _id: string;
    label: string;
  }[];
  about: string | undefined;
  lookingFor: string | undefined;
  gender: string | undefined;
  location: string | undefined;
  education: string | undefined;
  activeSlide: number;
  userSkills: string[] | undefined;
};
export const SlideDescription = ({
  skills,
  about,
  lookingFor,
  location,
  activeSlide,
  userSkills,
}: SlideDescriptionProps) => {
  const getProp = () => {
    if (activeSlide === 0) return { key: "location", value: location };
    if (activeSlide === 1)
      return about
        ? { key: "about", value: about }
        : skills.length
          ? { key: "skills", value: skills }
          : { key: "lookingFor", value: lookingFor };
    if (activeSlide === 2)
      return skills.length
        ? { key: "skills", value: skills }
        : { key: "lookingFor", value: lookingFor };
    if (activeSlide === 3) return { key: "lookingFor", value: lookingFor };
    return null;
  };

  const element = getProp();
  return (
    <>
      {element?.key == "location" && (
        <span className="flex items-center gap-1 my-1 font-medium text-sm">
          <Icon icon={"akar-icons:location"} className="text-white" />
          <span>16 km away</span>
        </span>
      )}
      {element?.key == "about" && (
        <span className="flex items-center gap-0.5 my-1 font-medium text-sm">
          <Icon icon={"gridicons:quote"} className="text-white" />
          <span className="line-clamp-2">{about}</span>
        </span>
      )}
      {element?.key == "skills" && (
        <div>
          <span className="flex items-center gap-1 my-2 font-medium text-sm">
            <Icon
              icon={"material-symbols-light:interests"}
              className="w-5 h-5 text-white"
            />
            <span>Interests</span>
          </span>
          <div aria-label="skills" className="flex flex-wrap gap-2">
            {skills.map((e) => {
              const isMatch = userSkills ? userSkills.includes(e.label) : false;

              return (
                <Chip
                  variant="bordered"
                  size="sm"
                  classNames={{
                    content: "font-medium",
                  }}
                  className={cn(
                    isMatch
                      ? "bg-gradient-to-r from-primary to-primary-200 border-none"
                      : ""
                  )}
                  key={e._id}
                >
                  {e.label}
                </Chip>
              );
            })}
          </div>
        </div>
      )}
      {element?.key == "lookingFor" && (
        <div className="flex">
          <span>Looking for</span>
          <span>{lookingFor}</span>
        </div>
      )}
    </>
  );
};
