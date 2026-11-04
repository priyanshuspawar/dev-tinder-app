import { SlideDescription } from "@/components/feed-card";
import EditAbout from "@/components/profile-edit/edit-about";
import EditEssentials from "@/components/profile-edit/edit-essentials";
import EditGoal from "@/components/profile-edit/edit-goal";
import { EditSkills } from "@/components/profile-edit/edit-skills";
import { getRequestsReceived, useReviewRequest } from "@/queries/profile";
import { feedUser } from "@/queries/types";
import { getAge, getProfilePhoto, getSlideImage } from "@/utils/helpers";
import {
  Avatar,
  Divider,
  useDisclosure,
  Modal,
  ModalContent,
  cn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const RequestReview = () => {
  // subscribe (not getQueryData) so the list re-renders on accept/reject and works on refresh
  const { data: requestsReceived } = useQuery({
    queryKey: ["request-received"],
    queryFn: getRequestsReceived,
  });
  const numberOfRequests = requestsReceived?.length ?? 0;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [activeSlide, setActiveSlide] = useState(0);
  const [previewRequest, setPreviewRequest] = useState<feedUser | null>(null);
  const handleTabClick = (pictures: any[]) => {
    if (pictures.length == 0 || pictures.length == 1) return;
    setActiveSlide((activeSlide + 1) % pictures.length);
  };
  const [isFullModePreview, setFullMode] = useState(false);
  const toggleFullMode = () => {
    setFullMode(!isFullModePreview);
  };
  const { mutate: reviewRequest } = useReviewRequest();
  return (
    <div className="flex p-3 w-full h-full">
      {numberOfRequests ? (
        <div className="w-full h-full">
          <h3 className="text-sm mb-3 font-semibold">Request Received</h3>
          <ul className="flex flex-col gap-2 w-full">
            {requestsReceived?.map((request) => (
              <li key={request._id} className="w-full flex items-center gap-1">
                <div
                  onClick={() => {
                    setPreviewRequest(request.fromUserId);
                    onOpen();
                  }}
                  className="flex flex-grow items-center gap-1 cursor-pointer"
                >
                  <Avatar
                    size="sm"
                    src={getProfilePhoto(request.fromUserId.pictures)}
                  />
                  <span className="text-sm font-medium text-gray-200">
                    {request.fromUserId.firstName}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      reviewRequest({
                        status: "accepted",
                        userId: request.fromUserId._id,
                        requestId: request._id,
                      });
                    }}
                    className="bg-success p-1.5 rounded-lg font-semibold text-xs"
                  >
                    accept
                  </button>
                  <button
                    onClick={() => {
                      reviewRequest({
                        status: "rejected",
                        userId: request.fromUserId._id,
                        requestId: request._id,
                      });
                    }}
                    className="bg-danger p-1.5 rounded-lg font-semibold text-xs"
                  >
                    reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <Divider className="my-3" />
          <Modal
            placement="center"
            hideCloseButton
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            backdrop="opaque"
          >
            <ModalContent className="bg-transparent">
              {(onClose) => (
                <div className="relative flex flex-col gap-2 h-[70vh]">
                  {!isFullModePreview && (
                    <div className="flex w-full justify-end h-fit cursor-pointer">
                      <span
                        onClick={onClose}
                        className="bg-default w-4 h-4 flex rounded-full"
                      >
                        <Icon icon={"basil:cross-outline"} />
                      </span>
                    </div>
                  )}
                  <div className="relative bg-background flex flex-col h-full overflow-y-scroll scrollbar-hide">
                    {isFullModePreview && (
                      <div
                        className={cn(
                          "flex sticky top-0 z-50",
                          "justify-between items-center bg-secondary-50 w-full py-3 px-4"
                        )}
                      >
                        <div>
                          <span className="text-2xl tracking-wide font-semibold">
                            {previewRequest?.firstName}
                          </span>
                          <span className="text-lg font-medium text-gray-100 whitespace-pre">
                            {"  "}
                            {getAge(previewRequest?.dateOfBirth)}
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
                    )}
                    <div
                      onClick={() => {
                        handleTabClick(previewRequest?.pictures ?? []);
                      }}
                      className={cn(
                        isFullModePreview ? "h-4/6 flex-shrink-0" : "h-full",
                        "flex items-end bg-cover bg-no-repeat bg-center bg-black/75",
                        "w-full transition-height transform duration-300 ease-in-out rounded-lg overflow-hidden"
                      )}
                      style={{
                        backgroundImage: `url(${getSlideImage({ pictures: previewRequest?.pictures, activeSlide })})`,
                      }}
                    >
                      <div className="w-full py-[2px] px-[6px] bg-black absolute z-30 top-2 grid grid-rows-1 grid-flow-col auto-cols-auto gap-1.5">
                        {previewRequest?.pictures.map((_, i) => {
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
                      {!isFullModePreview && (
                        <div className="w-full bg-gradient-to-t from-black via-black/80 to-black/0 pt-2">
                          {/* infos */}
                          <div className={cn("p-6")}>
                            <div className="flex justify-between items-center w-full">
                              <div className="flex items-end gap-1">
                                <h2 className="font-semibold text-3xl tracking-normal">
                                  {previewRequest?.firstName},
                                </h2>
                                <span className="font-semibold text-xl">
                                  {getAge(previewRequest?.dateOfBirth)}
                                </span>
                              </div>

                              <div
                                className="bg-default p-2 rounded-full hover:scale-125 hover:bg-default-300 transition-all transform duration-200 ease-in-out cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFullMode();
                                }}
                              >
                                <Icon
                                  className="w-3.5 h-3.5"
                                  icon={"icon-park-solid:up-two"}
                                />
                              </div>
                            </div>

                            <SlideDescription
                              about={previewRequest?.about}
                              activeSlide={activeSlide}
                              education={previewRequest?.essentials?.education}
                              location={previewRequest?.essentials?.location?.coordinates}
                              gender={previewRequest?.gender}
                              lookingFor={previewRequest?.lookingFor}
                              skills={previewRequest?.skills ?? []}
                              userSkills={[]}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {isFullModePreview && (
                      <div className="h-full mt-2 mb-4 px-2 flex flex-col gap-2">
                        <EditGoal
                          value={previewRequest?.lookingFor}
                          isReadOnly
                        />
                        <EditEssentials
                          isReadyOnly
                          {...{
                            dateOfBirth: previewRequest?.dateOfBirth,
                            education: previewRequest?.essentials.education,
                            gender: previewRequest?.gender,
                            location: previewRequest?.essentials.location,
                          }}
                        />
                        <EditAbout value={previewRequest?.about} isReadOnly />
                        <EditSkills
                          skills={previewRequest?.skills}
                          isReadOnly
                          userSkills={[]}
                        />
                      </div>
                    )}
                    {isFullModePreview && <Divider className="mb-2" />}
                  </div>
                </div>
              )}
            </ModalContent>
          </Modal>
        </div>
      ) : (
        <div>
          <span className="text-sm font-semibold">No Requests received</span>
        </div>
      )}
    </div>
  );
};

export default RequestReview;
