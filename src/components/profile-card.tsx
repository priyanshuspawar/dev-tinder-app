import { cn } from "@/utils/helpers";
import { motion, useMotionValue, useTransform } from "motion/react";
import { Dispatch, SetStateAction } from "react";
import { Icon } from "@iconify/react";
import { UserProfile } from "@/queries/types";
import useSideBarStore from "@/store/sidebarStore";

const ProfileCard = ({
  id,
  cards,
  setCards,
  activeTab,
  setActiveTab,
  index,
}: {
  id: string;
  cards: UserProfile[];
  setCards: Dispatch<SetStateAction<UserProfile[]>>;
  activeTab: number;
  setActiveTab: Dispatch<React.SetStateAction<number>>;
  index: number;
}) => {
  const x = useMotionValue(0);

  const rotate = useTransform(x, [-150, 150], [-18, 18]);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);
  const handleDragEnd = () => {
    if (Math.abs(x.get()) > 100) {
      setCards((pv) => pv.filter((v) => v._id !== id));
    }
  };
  // const [activeTab, setActiveTab] = useState(0);
  const handleTabClick = () => {
    if (x.get() != 0) {
      return;
    }
    setActiveTab((activeTab + 1) % cards[index].pictures.length);
  };
  const handlePrevClick = () => {
    if (x.get() !== 0) {
      return;
    }
    setActiveTab((prevTab) => (prevTab === 0 ? 0 : prevTab - 1));
  };
  const { isFullModeActive } = useSideBarStore();
  // console.log(activeTab);
  return (
    <motion.div
      className={cn(
        isFullModeActive ? "h-2/3" : "h-[98%]",
        "w-full rounded-lg bg-white object-cover hover:cursor-grab active:cursor-grabbing bg-center bg-cover overflow-hidden relative group flex items-center"
      )}
      key={id}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{
        gridColumn: 1,
        gridRow: 1,
        x,
        opacity,
        rotate,
      }}
      onDragEnd={handleDragEnd}
      onClick={() => {
        handleTabClick();
      }}
    >
      {index == cards.length - 1 && (
        <span
          className={cn(
            "w-full absolute top-2 z-10 grid grid-rows-1 grid-flow-col auto-cols-auto"
          )}
        >
          {cards[index].pictures.map((e, index) => (
            <span
              key={e._id}
              onClick={() => {
                // setProfileActiveTab(index);
              }}
              className={cn(
                "h-1 bg-[#ffffff] cursor-pointer hover:bg-slate-50 transition-colors ease-linear duration-300",
                {
                  "bg-primary/80": index === activeTab,
                  "border border-[#00000095]": index !== activeTab,
                }
              )}
            />
          ))}
        </span>
      )}
      <img
        src={cards[index].pictures[activeTab].imgUrl}
        className="w-full h-full pointer-events-none object-cover"
      />
      <div
        className="opacity-0 group-hover:opacity-100 transition-all transform duration-200 ease-in absolute w-8 aspect-square rounded-full bg-gray-800 z-20 left-3 flex items-center justify-center"
        onClick={(e) => {
          handlePrevClick();
          e.stopPropagation();
        }}
      >
        <Icon
          icon={"radix-icons:caret-left"}
          className="w-6 h-6 cursor-pointer"
        />
      </div>
      <div
        className="opacity-0 group-hover:opacity-100 transition-all transform duration-200 ease-in absolute w-8 aspect-square rounded-full bg-gray-800 z-20 right-3 flex items-center justify-center"
        onClick={(e) => {
          handleTabClick();
          e.stopPropagation();
        }}
      >
        <Icon
          icon={"radix-icons:caret-right"}
          className="w-6 h-6 cursor-pointer"
        />
      </div>
    </motion.div>
  );
};

export default ProfileCard;
