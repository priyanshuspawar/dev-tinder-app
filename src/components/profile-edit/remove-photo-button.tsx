import { Icon } from "@iconify/react";
const RemovePhotoButton = ({ onClick }) => (
  <span
    onClick={onClick}
    className="bg-white text-slate-600 absolute rounded-full -bottom-1.5 -right-1 aspect-square p-0.5 cursor-pointer"
  >
    <Icon icon="line-md:plus" className="w-3.5 h-3.5 aspect-square rotate-45" />
  </span>
);

export default RemovePhotoButton;
