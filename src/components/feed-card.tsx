import { feedUser } from "@/queries/types";
import { Chip } from "@heroui/react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "motion/react";
import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { cn, distanceLabel, getAge } from "@/utils/helpers";
import useSideBarStore from "@/store/sidebarStore";
import EditGoal from "./profile-edit/edit-goal";
import EditEssentials from "./profile-edit/edit-essentials";
import EditAbout from "./profile-edit/edit-about";
import { EditSkills } from "./profile-edit/edit-skills";

import useAuthStore from "@/store/authStore";

type Props = feedUser & {
  onSwipe: (status: "interested" | "ignore") => void;
  onUndo?: () => void; // undefined = nothing to undo
};

const SWIPE_DISTANCE = 100; // px dragged past which a release counts as a swipe
const SWIPE_VELOCITY = 500; // px/s flick that counts as a swipe

const FeedCard = ({
  pictures,
  essentials,
  firstName,
  skills,
  dateOfBirth,
  lookingFor,
  gender,
  about,
  onSwipe,
  onUndo,
}: Props) => {
  const { user } = useAuthStore();
  // per-card state: the parent keys this component by user id, so it resets per card
  const [activeSlide, setActiveSlide] = useState(0);
  const leaving = useRef(false);

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

  const userSkills = user?.skills.map((e) => e.label);
  // Fly the card off-screen, then report the swipe (parent removes the card).
  const swipeAway = async (direction: "left" | "right") => {
    if (leaving.current) return; // ignore double clicks / drag+click
    leaving.current = true;
    await animate(x, direction === "right" ? 600 : -600, { duration: 0.25 });
    onSwipe(direction === "right" ? "interested" : "ignore");
  };
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) swipeAway("right");
    else if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) swipeAway("left");
    else animate(x, 0, { type: "spring", stiffness: 400, damping: 30 }); // not far enough: snap back
  };
  const handleTabClick = () => {
    if (x.get() != 0) {
      return;
    }
    setActiveSlide((activeSlide + 1) % pictures.length);
  };

  const { toggleFullMode, isFullModeActive } = useSideBarStore();
  if (!user) {
    return;
  }
  return (
    <div className="w-full h-full relative">
      {/* Draggable Card: follows the pointer 1:1; release decides swipe vs snap-back */}
      <motion.div
        drag={isFullModeActive ? false : "x"}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x, opacity, rotate }}
        // select-none: dragging over text would start a native text drag, which
        // cancels the pointer gesture and leaves the card stuck mid-swipe
        className="w-full h-full select-none"
      >
        <div
          className={cn(
            "h-full w-full bg-background rounded-lg scrollbar-hide relative",
            {
              "gradient-mask-b-40": !isFullModeActive,
              "overflow-y-scroll": isFullModeActive,
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
            style={{ backgroundImage: `url(${pictures[activeSlide]?.imgUrl})` }}
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
            education={essentials?.education}
            location={essentials?.location?.coordinates}
            gender={gender}
            lookingFor={lookingFor}
            skills={skills}
            userSkills={userSkills}
          />
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
            label="Undo last swipe"
            onClick={onUndo}
            icon="ci:undo"
            color="text-warning-400"
          />
          <ActionBtn
            label={`Pass on ${firstName}`}
            onClick={() => swipeAway("left")}
            icon="maki:cross"
            color="text-danger-400"
            scale={leftScale}
          />
          <ActionBtn
            label={`Like ${firstName}`}
            onClick={() => swipeAway("right")}
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
  label,
  scale = 1,
  onClick,
}: {
  icon: string;
  color: string;
  label: string;
  scale?: any;
  onClick?: () => void; // undefined renders the button disabled
}) => (
  <motion.button
    onClick={onClick}
    disabled={!onClick}
    aria-label={label}
    title={label}
    whileTap={onClick ? { scale: 0.9 } : undefined}
    className="disabled:opacity-40 disabled:cursor-not-allowed"
  >
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
  location?: [number, number];
  education: string | undefined;
  activeSlide: number;
  selfProfileView?: boolean;
  userSkills: string[] | undefined;
};
export const SlideDescription = ({
  skills,
  selfProfileView = false,
  about,
  lookingFor,
  location,
  activeSlide,
  userSkills,
}: SlideDescriptionProps) => {
  const { user } = useAuthStore();
  const getPropForPreview = () => {
    if (activeSlide === 0)
      return about
        ? { key: "about", value: about }
        : skills.length
          ? { key: "skills", value: skills }
          : { key: "lookingFor", value: lookingFor };
    if (activeSlide === 1)
      return skills.length
        ? { key: "skills", value: skills }
        : { key: "lookingFor", value: lookingFor };
    if (activeSlide === 2) return { key: "lookingFor", value: lookingFor };
    return null;
  };
  const getPropForFeed = () => {
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

  const element = selfProfileView ? getPropForPreview() : getPropForFeed();
  const distance = distanceLabel(user?.essentials?.location?.coordinates, location);
  return (
    <>
      {element?.key == "location" && distance && (
        <span className="flex items-center gap-1 my-1 font-medium text-sm">
          <Icon icon={"akar-icons:location"} className="text-white" />
          <span>{distance}</span>
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
                    base: "bg-black/15",
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
        <div className="flex flex-col my-0.5">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            {" "}
            <Icon icon={"iconamoon:search"} />
            Looking for
          </span>
          <span className="font-semibold">✨ {lookingFor}</span>
        </div>
      )}
    </>
  );
};
