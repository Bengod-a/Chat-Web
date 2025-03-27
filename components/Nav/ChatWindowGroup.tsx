import React, { useEffect, useRef, useState } from "react";
import DropdownButtonGroup from "../ui/DropdownButtonGroup";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";
import CryptoJS from "crypto-js";
import toast from "react-hot-toast";

interface Group {
  id: number;
  name: string;
  members: { id: number; userId: number; role: string; user: any }[];
}

const socket = io("http://localhost:5000");

const NEXT_PUBLIC_ENCRYPTION_KEY = process.env
  .NEXT_PUBLIC_ENCRYPTION_KEY as string;

interface User {
  id: number;
  name?: string;
  email?: string;
  image?: string | null;
  friendshipStatus: string;
  friendshipId: number;
}

interface ApiMessage {
  id: number;
  sender: { id: number; name?: string; image?: string | null };
  content: string | null;
  createdAt: string;
  file?: string | null;
}

interface Message {
  id: number | string;
  sender: string;
  profile: string | null;
  content: string | null;
  time: string;
  isMe: boolean;
  file?: string | null;
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
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const decryptContent = (en: string) => {
    try {
      const bytes = CryptoJS.AES.decrypt(en, NEXT_PUBLIC_ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.log(error);
    }
  };

  const isImageUrl = (text: string): boolean => {
    const imageUrlRegex = /\.(webp|jpg|jpeg|png|gif|application|pdf|video)$/i;
    return imageUrlRegex.test(text.trim());
  };



  const getmessage = async () => {
    if (!session?.user?.id || !selectedGroup?.id) {
      return;
    }
  
    try {
      const res = await fetch(`/api/user/getMessagesGroup/${selectedGroup.id}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch messages: ${res.status}`);
      }
  
      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error("Expected an array of messages");
      }
  
      const transformedMessages: any[] = data.map((msg: ApiMessage) => {
        const contentIsImage = msg.content && isImageUrl(msg.content);
        const finalContent = contentIsImage
          ? msg.content
          : msg.content
          ? decryptContent(msg.content)
          : null;
  
        return {
          id: msg.id,
          sender:
            msg.sender.id === Number(session?.user.id)
              ? "คุณ"
              : msg.sender.name || "ไม่ทราบชื่อ",
          profile: msg.sender.image || "man.svg",
          content: finalContent,
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMe: msg.sender.id === Number(session?.user.id),
          file: msg.file || null,
        };
      });
  
      setMessages(transformedMessages);
    } catch (error) {
      console.error( error);
    }
  };
  
  console.log(messages);
  
  useEffect(() => {
    if (status === "authenticated" && selectedGroup?.id) {
      getmessage();
    }
  }, [status, selectedGroup]);

  const sendMessage = async () => {
    if (!session?.user?.id || !selectedGroup?.id || (!message.trim() && !file))
      return;
    setIsLoading(true);

    const chatId = `group-${selectedGroup.id}`;
    const formData = new FormData();

    let encryptedContent = null;
    if (message.trim()) {
      encryptedContent = CryptoJS.AES.encrypt(
        message,
        NEXT_PUBLIC_ENCRYPTION_KEY
      ).toString();
      formData.append("content", encryptedContent);
    }
    formData.append("recipientId", String(selectedGroup.id));
    if (file) formData.append("file", file);

    try {
      const res = await fetch(
        `/api/user/sendmessagegroup/${selectedGroup.id}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error(`${res.status}`);

      const data = await res.json();
      const messageId = data.data.id;

      socket.emit("send_message", {
        id: messageId,
        content: encryptedContent,
        file: data.data.file,
        profile: session.user.image,
        chatId,
        conversationId: selectedGroup.id,
        userId: session.user.id,
      });

      const newMessage: Message = {
        id: messageId,
        sender: "คุณ",
        profile: session.user.image || "man.svg",
        content: message || null,
        time: new Date(data.data.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: true,
        file: data.data.file || null,
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
      setFile(null);
      setFilePreview(null);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error("ไฟล์ใหญ่เกิน 50MB ไม่สามารถอัปโหลดได้");
      return;
    }
    const pptxMimeType =
      "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    if (
      selectedFile.type === pptxMimeType ||
      selectedFile.name.endsWith(".pptx")
    ) {
      toast.error("ไม่สามารถอัปโหลดไฟล์ PPT ได้");
      return;
    }
    setFile(selectedFile);
    if (selectedFile.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(selectedFile));
    } else {
      setFilePreview(selectedFile.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading && (message.trim() || file)) {
      sendMessage();
    }
  };

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
              onChange={handleFileChange}
            />
            <label
              htmlFor="upload"
              className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              <Icon icon="iconoir:attachment" width="18" height="18" />
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="พิมพ์ข้อความ..."
              className="w-full p-2 pl-10 pr-12 rounded-full bg-gray-100 border-none"
            />
            <button
              onClick={sendMessage}
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
