import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Message } from "@/queries/chatQueries";
dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(classes));
}

export function getMinMaxDate() {
  const today = new Date();
  const minDate = `${today.getFullYear() - 100}-01-01`;
  const maxDate = `${today.getFullYear() - 18}-12-31`;
  return { min: minDate, max: maxDate };
}
export function getAge(d: string | null | undefined) {
  if (!d) {
    return null;
  }
  const today = new Date();
  const dob = new Date(d);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();

  // Adjust if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

export const isValidDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false; // Strict YYYY-MM-DD format

  const date = new Date(value);
  const [year, month, day] = value.split("-").map(Number);

  // Validate exact date (handles 2024-02-30 case)
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return false;
  }

  // Age Calculation
  const today = new Date();
  const age =
    today.getFullYear() -
    year -
    (today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)
      ? 1
      : 0);

  return age >= 18 && age <= 99; // Age check
};

export const getProfilePhoto = (arr?: { _id: string; imgUrl: string }[]) => {
  if (!arr || arr.length === 0) {
    return "https://www.svgrepo.com/show/170633/profile-user.svg";
  }
  return (
    arr[0]?.imgUrl ?? "https://www.svgrepo.com/show/170633/profile-user.svg"
  );
};

export const userPlaceHolder =
  "https://www.svgrepo.com/show/170633/profile-user.svg";

export const getSlideImage = ({
  pictures,
  activeSlide,
}: {
  pictures: { _id: string; imgUrl: string }[] | undefined;
  activeSlide: number;
}) => {
  if (!pictures) {
    return "";
  }
  if (activeSlide < pictures.length) {
    return pictures[activeSlide].imgUrl;
  }
  return "";
};

export const msgTimeFormater = (isoString: string) => {
  return dayjs.utc(isoString).local().format("hh:mm A");
};

export function getFormattedDate(dateStr: string) {
  const d = dayjs(dateStr);
  if (d.isToday()) return "Today";
  if (d.isYesterday()) return "Yesterday";
  return d.format("ddd, D MMM"); // e.g., "Fri, 14 Jun"
}

export function groupMessagesByDate(messages: Message[]) {
  const groups: Record<string, typeof messages> = {};
  console.log("@@@", messages);
  messages.forEach((msg) => {
    const key = getFormattedDate(msg.createdAt);
    if (!groups[key]) groups[key] = [];
    groups[key] = [msg, ...groups[key]];
  });

  return groups;
}

export function groupByRead(messages: Message[]) {
  const group: Record<string, typeof messages> = {
    read: [],
    unseen: [],
  };
  messages.forEach((msg) => {
    if (msg.status === "read") {
      group["read"] = [msg, ...group["read"]];
    } else {
      group["unseen"] = [msg, ...group["unseen"]];
    }
  });
  return group;
}

export function isLastMessageOfDate(
  currDate: string,
  currIndex: number,
  messages: Message[]
) {
  let last = messages.length - 1;
  return !dayjs(currDate).isSame(
    last - currIndex < 0 ? null : messages[last - currIndex].createdAt,
    "date"
  );
}
