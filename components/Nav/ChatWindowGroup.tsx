import React, { useState } from "react";
import DropdownButtonGroup from "../ui/DropdownButtonGroup";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";

interface Group {
  id: number;
  name: string;
  members: { id: number; userId: number; role: string; user: any }[];
}

interface ChatWindowGroupProps {
  isOpenGroup: boolean;
  setIsOpenGroup: any;
  selectedGroup: Group | null;
}

const ChatWindowGroup = ({
  isOpenGroup,
  setIsOpenGroup,
  selectedGroup,
}: ChatWindowGroupProps) => {
  if (!isOpenGroup || !selectedGroup) return null;
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);




  

  const FilePreview: React.FC<{
    file: File | null;
    filePreview: string | null;
    onRemove: () => void;
  }> = ({ file, filePreview, onRemove }) => {
    if (!file || !filePreview) return null;

    const renderPreview = () => {
      if (file.type.startsWith("image/")) {
        return (
          <Image
            src={filePreview}
            alt="preview"
            width={100}
            height={100}
            className="rounded"
          />
        );
      } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        return (
          <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md">
            <Icon
              icon="mdi:file-document"
              width="20"
              height="20"
              className="inline mr-1"
            />
            {file.name} (Preview: {filePreview || "Loading..."})
          </div>
        );
      } else if (file.type.startsWith("video/")) {
        return filePreview.startsWith("blob:") ? (
          <video
            src={filePreview}
            controls
            className="rounded-md"
            style={{ maxWidth: "100px", width: "auto", height: "auto" }}
          />
        ) : (
          <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md">
            <Icon
              icon="mdi:file-video"
              width="20"
              height="20"
              className="inline mr-1"
            />
            {file.name}
          </div>
        );
      } else if (file.type === "application/pdf") {
        return (
          <a
            href={filePreview}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:underline"
          >
            <Icon icon="mdi:file-pdf" width="20" height="20" className="mr-1" />
            {file.name}
          </a>
        );
      } else if (file.type === "application/json") {
        return (
          <a
            href={filePreview}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:underline"
          >
            <Icon
              icon="mdi:file-json"
              width="20"
              height="20"
              className="mr-1"
            />
            {file.name}
          </a>
        );
      } else {
        return (
          <a
            href={filePreview}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:underline"
          >
            <Icon icon="mdi:file" width="20" height="20" className="mr-1" />
            {file.name}
          </a>
        );
      }
    };

    return (
      <div className="relative flex items-center gap-2">
        {renderPreview()}
        <button
          onClick={onRemove}
          className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          title="ลบไฟล์"
        >
          <Icon icon="mdi:close" width="16" height="16" />
        </button>
      </div>
    );
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
  };

  return (
    <div className="h-full flex flex-col w-full">
      <div className="w-full h-[50px] p-2 bg-gradient-to-r from-blue-500 to-purple-500 items-center flex justify-between shadow">
        <div>
          <h1 className="text-white">{selectedGroup.name}</h1>
        </div>

        <div className="flex items-center gap-4 p-2">
          <button className="cursor-pointer">
            <span>
              <Icon icon="proicons:call" width="20" height="20" color="white" />
            </span>
          </button>
          <button className="cursor-pointer">
            <span>
              <Icon
                icon="weui:video-call-outlined"
                width="24"
                height="24"
                color="white"
              />
            </span>
          </button>
          <DropdownButtonGroup setIsOpenGroup={setIsOpenGroup} />
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className=" justify-end">
          <div className="flex items-center w-full gap-2">
            <div className="flex-shrink-0">
              <Image
                src={"man.svg"}
                alt={`'s profile`}
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
            <div className="flex flex-col flex-1">
              <div className="justify-end">
                <div className="max-w-xs p-2 rounded-lg">
                  <span className="w-[200px] h-auto break-words whitespace-pre-wrap">
                    amkj
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white shadow rounded-2xl md:mb-0 mb-9 m-3">
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <input
                type="file"
                id="upload"
                className="hidden"
                // disabled={isLoading || friendship?.status === "BLOCKED"}
                // onChange={handleFileChange}
              />
              <label
                htmlFor="upload"
                className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <Icon icon="iconoir:attachment" width="18" height="18" />
              </label>
              <input
                type="text"
                // value={message}
                // onChange={(e) => setMessage(e.target.value)}
                // onKeyDown={handleKeyDown}
                placeholder="พิมพ์ข้อความ..."
                className="w-full p-2 pl-10 pr-12 rounded-full bg-gray-100 border-none"
                // disabled={isLoading || friendship?.status === "BLOCKED"}
              />
              <button
                // onClick={sendMessage}
                // disabled={isLoading || friendship?.status === "BLOCKED"}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  isLoading ? "opacity-50" : ""
                }`}
              >
                <Icon icon="lucide:send" width="20" height="20" color="black" />
              </button>
            </div>
          </div>
          {filePreview && (
            <div className="mt-2">
              <FilePreview
                file={file}
                filePreview={filePreview}
                onRemove={handleRemoveFile}
              />
            </div>
          )}
        </div>

    </div>
  );
};

export default ChatWindowGroup;
