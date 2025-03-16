import { Icon } from "@iconify/react";
import { DropzoneOptions, useDropzone } from "react-dropzone";
const DropzoneSlot = (DropzoneOptions: DropzoneOptions) => {
  const { getInputProps, getRootProps } = useDropzone(DropzoneOptions);
  return (
    <div
      {...getRootProps()}
      className="bg-secondary-50 rounded-lg relative border-dashed border-3 border-primary-50 cursor-pointer"
    >
      <input {...getInputProps()} className="w-full h-full cursor-pointer" />
      <span className="bg-red-500 absolute rounded-full -bottom-1.5 -right-2 p-1 cursor-pointer">
        <Icon icon="line-md:plus" className="w-3.5 h-3.5 aspect-square" />
      </span>
    </div>
  );
};

export default DropzoneSlot;
