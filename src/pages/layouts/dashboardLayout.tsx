import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useSideBarStore from "@/store/sidebarStore";
import { useMediaQuery } from "usehooks-ts";
import { Icon } from "@iconify/react";
import { cn } from "@/utils/helpers";
import { useQuery } from "@tanstack/react-query";
import { getRequestsReceived } from "@/queries/profile";
import Loader from "@/components/Loader";
const DashboardLayout = () => {
  const { data: requestsReceived, isLoading } = useQuery({
    queryKey: ["request-received"],
    queryFn: getRequestsReceived,
    retryDelay: 1 * 60000,
  });
  const { isFullModeActive } = useSideBarStore();
  const isBottomNavActive = useMediaQuery("(max-width: 895px)");
  const location = useLocation();
  const navigation = useNavigate();
  if (isLoading) {
    return <Loader />;
  }
  return (
    <div className="w-full h-screen flex flex-col overflow-y-clip">
      {!location.pathname.includes("/dashboard/profile") &&
        !isFullModeActive && (
          <section className="">
            <div className="w-full py-1.5 px-3.5 bg-gradient-to-br from-secondary-200 to-secondary-500">
              <h2 className="w-full font-medium text-xl">DevTinder ✨</h2>
            </div>
          </section>
        )}
      {/* grid placeitemscenter was removed */}
      <section className="w-full h-full">
        <Outlet
          context={{
            isFullModeActive,
            isBottomNavActive,
          }}
        />
      </section>
      {isBottomNavActive &&
        !location.pathname.includes("/dashboard/profile/edit") && (
          <section
            className={cn(
              "flex justify-evenly w-full h-fit",
              location.pathname == "/dashboard"
                ? "pb-3 bg-gradient-to-b from-black/80 to-black"
                : "pb-3 pt-3 bg-secondary-50"
            )}
          >
            <Icon
              icon={"material-symbols:star-rounded"}
              onClick={() => navigation("/dashboard")}
              className={cn(
                location.pathname == "/dashboard"
                  ? "text-secondary-500"
                  : "text-default-500 hover:text-default-700",
                "text-3xl cursor-pointer transition-all transform duration-250 ease-in-out"
              )}
            />
            <span
              onClick={() => {
                navigation("/dashboard/connections");
              }}
              className="relative"
            >
              <Icon
                icon={"lets-icons:chat-alt-fill"}
                className={cn(
                  location.pathname == "/dashboard/chat"
                    ? "text-secondary-500"
                    : "text-default-500 hover:text-default-700",
                  "text-3xl cursor-pointer transition-all transform duration-250 ease-in-out"
                )}
              />
              {requestsReceived?.length != 0 && (
                <span className="absolute bg-primary rounded-full flex justify-center items-center text-[8px] font-semibold w-3 h-3 top-0 right-0">
                  {requestsReceived?.length}
                </span>
              )}
            </span>
            <Icon
              icon={"gridicons:user"}
              onClick={() => navigation("/dashboard/profile")}
              className={cn(
                location.pathname.includes("/dashboard/profile")
                  ? "text-secondary-500"
                  : "text-default-500 hover:text-default-700",
                "text-3xl cursor-pointer transition-all transform duration-250 ease-in-out"
              )}
            />
          </section>
        )}
    </div>
  );
};

export default DashboardLayout;
