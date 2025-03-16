import { cn } from "@/utils/helpers";

type Props = {
  currentTab: string;
  handleTabChange: (tab: string) => void;
};

const CardHeader = ({ currentTab, handleTabChange }: Props) => {
  return (
    <div className="flex items-center w-full border-b border-secondary/30 h-full">
      {["edit", "preview"].map((tab, index) => (
        <h2
          key={tab}
          onClick={() => {
            handleTabChange(tab);
          }}
          className={cn(
            "inline-flex capitalize font-semibold text-lg tracking-wide w-full items-center justify-center text-center h-full cursor-pointer hover:text-primary transition-colors transform duration-300 ease-in-out",
            {
              "border-r border-secondary/30": index === 0,
              "text-primary-600": tab === currentTab,
            }
          )}
        >
          {tab}
        </h2>
      ))}
    </div>
  );
};

export default CardHeader;
