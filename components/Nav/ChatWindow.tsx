// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import Image from "next/image";
// import { Icon } from "@iconify/react";
// import { useSession } from "next-auth/react";
// import Link from "next/link";
// import io from "socket.io-client";
// import toast from "react-hot-toast";
// import CryptoJS from "crypto-js";
// import CallModal from "./CallModal";
// import CallStart from "./CallStart";
// import DropdownButton from "../ui/DropdownButton";

// const socket = io("http://localhost:5000");

// const NEXT_PUBLIC_ENCRYPTION_KEY = process.env
//   .NEXT_PUBLIC_ENCRYPTION_KEY as string;

// interface User {
//   id: number;
//   name?: string;
//   email?: string;
//   image?: string | null;
//   friendshipStatus: string;
//   friendshipId: number;
// }

// interface ApiMessage {
//   id: number;
//   sender: {
//     id: number;
//     name?: string;
//     image?: string | null;
//   };
//   content: string | null;
//   createdAt: string;
//   file?: string | null;
// }

// interface Message {
//   id: number | string;
//   sender: string;
//   profile: string | null;
//   content: string | null;
//   time: string;
//   isMe: boolean;
//   file?: string | null;
// }

// const ChatWindow: React.FC<{
//   isOpen: boolean;
//   setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
//   selectedUser: User;
// }> = ({ isOpen, setIsOpen, selectedUser }) => {
//   const [message, setMessage] = useState("");
//   const [file, setFile] = useState<File | null>(null);
//   const [filePreview, setFilePreview] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const { data: session, status } = useSession();
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const [isCallOpen, setIsCallOpen] = React.useState(false);
//   const [friendshipStatus, setFriendshipStatus] = useState() as any;

//   useEffect(() => {
//     if (status === "authenticated" && selectedUser.id) {
//       getMessages();
//       getFriendship();
//     }
//   }, [status, selectedUser.id]);

//   const isImageUrl = (text: string): boolean => {
//     const imageUrlRegex = /\.(webp|jpg|jpeg|png|gif|application|pdf|video)$/i;
//     return imageUrlRegex.test(text.trim());
//   };

//   const decryptContent = (encrypted: string): string => {
//     try {
//       const bytes = CryptoJS.AES.decrypt(encrypted, NEXT_PUBLIC_ENCRYPTION_KEY);
//       const decrypted = bytes.toString(CryptoJS.enc.Utf8);
//       return decrypted;
//     } catch (error) {
//       console.error(error);
//       return "ถอดรหัสล้มเหลว";
//     }
//   };

//   useEffect(() => {
//     if (session?.user?.id && selectedUser.id) {
//       const chatId =
//         session.user.id < selectedUser.id
//           ? `${session.user.id}-${selectedUser.id}`
//           : `${selectedUser.id}-${session.user.id}`;

//       socket.emit("join_chat", chatId);

//       const handleReceiveMessage = (msg: any) => {
//         if (msg.chatId !== chatId) return;

//         const contentIsImage = msg.content && isImageUrl(msg.content);
//         const finalContent = contentIsImage
//           ? msg.content
//           : msg.content
//           ? decryptContent(msg.content)
//           : null;

//         const receivedMessage: Message = {
//           id: msg.id || `${msg.userId}-${Date.now()}`,
//           sender:
//             msg.userId === session?.user?.id ? "คุณ" : selectedUser.name || "",
//           content: finalContent,
//           profile: msg.profile || selectedUser.image || "man.svg",
//           time: new Date().toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//           }),
//           isMe: msg.userId === session?.user?.id,
//           file: msg.file,
//         };

//         setMessages((prevMessages) => {
//           const exists = prevMessages.some((m) => m.id === receivedMessage.id);
//           if (exists) return prevMessages;
//           return [...prevMessages, receivedMessage];
//         });
//       };

//       socket.on("receive_message", handleReceiveMessage);

//       return () => {
//         socket.off("receive_message", handleReceiveMessage);
//         socket.emit("leave_chat", chatId);
//       };
//     }
//   }, [session, selectedUser]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = async () => {
//     if (!session?.user?.id || !selectedUser?.id || (!message.trim() && !file))
//       return;
//     setIsLoading(true);

//     const chatId =
//       session.user.id < selectedUser.id
//         ? `${session.user.id}-${selectedUser.id}`
//         : `${selectedUser.id}-${session.user.id}`;

//     const formData = new FormData();
//     let encryptedContent = null;
//     if (message.trim()) {
//       encryptedContent = CryptoJS.AES.encrypt(
//         message,
//         NEXT_PUBLIC_ENCRYPTION_KEY
//       ).toString();
//       formData.append("content", encryptedContent);
//     }
//     formData.append("recipientId", String(selectedUser.id));
//     if (file) formData.append("file", file);

//     try {
//       const res = await fetch(`/api/user/sendmessage/${selectedUser.id}`, {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) throw new Error(`${res.status}`);

//       const data = await res.json();
//       const messageId = data.data.id;

//       socket.emit("send_message", {
//         id: messageId,
//         content: encryptedContent,
//         file: data.data.file,
//         profile: session.user.image,
//         chatId,
//         conversationId: selectedUser.id,
//         userId: session.user.id,
//       });

//       const newMessage: Message = {
//         id: messageId,
//         sender: "คุณ",
//         profile: session.user.image || "man.svg",
//         content: message || null,
//         time: new Date(data.data.createdAt).toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//         isMe: true,
//         file: data.data.file || null,
//       };

//       setMessages((prev) => [...prev, newMessage]);
//       setMessage("");
//       setFile(null);
//       setFilePreview(null);
//     } catch (error) {
//       console.error(error);
//       toast.error("ไม่สามารถส่งข้อความได้ กรุณาลองอีกครั้ง.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getMessages = async () => {
//     if (!session?.user?.id || !selectedUser.id) return;
//     try {
//       const res = await fetch(`/api/user/getMessages/${selectedUser.id}`);
//       if (!res.ok) throw new Error(`เกิดข้อผิดพลาด HTTP! สถานะ: ${res.status}`);
//       const data = (await res.json()) as ApiMessage[];
//       if (Array.isArray(data)) {
//         const transformedMessages: Message[] = data.map((msg) => {
//           const contentIsImage = msg.content && isImageUrl(msg.content);
//           const finalContent = contentIsImage
//             ? msg.content
//             : msg.content
//             ? decryptContent(msg.content)
//             : null;

//           return {
//             id: msg.id,
//             sender:
//               msg.sender.id === Number(session.user.id)
//                 ? "คุณ"
//                 : msg.sender.name || "ไม่ทราบชื่อ",
//             profile: msg.sender.image || "man.svg",
//             content: finalContent,
//             time: new Date(msg.createdAt).toLocaleTimeString([], {
//               hour: "2-digit",
//               minute: "2-digit",
//             }),
//             isMe: msg.sender.id === Number(session.user.id),
//             file: msg.file || null,
//           };
//         });
//         setMessages(transformedMessages);
//       }
//     } catch (error) {
//       console.error("การดึงข้อความล้มเหลว:", error);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = e.target.files?.[0];
//     if (!selectedFile) return;
//     if (selectedFile.size > 50 * 1024 * 1024) {
//       toast.error("ไฟล์ใหญ่เกิน 50MB ไม่สามารถอัปโหลดได้");
//       return;
//     }
//     const pptxMimeType =
//       "application/vnd.openxmlformats-officedocument.presentationml.presentation";
//     if (
//       selectedFile.type === pptxMimeType ||
//       selectedFile.name.endsWith(".pptx")
//     ) {
//       toast.error("ไม่สามารถอัปโหลดไฟล์ PPT ได้");
//       return;
//     }
//     setFile(selectedFile);
//     if (selectedFile.type.startsWith("image/")) {
//       setFilePreview(URL.createObjectURL(selectedFile));
//     } else {
//       setFilePreview(selectedFile.name);
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter" && !isLoading && (message.trim() || file)) {
//       sendMessage();
//     }
//   };

//   const FilePreview: React.FC<{
//     file: File | null;
//     filePreview: string | null;
//     onRemove: () => void;
//   }> = ({ file, filePreview, onRemove }) => {
//     if (!file || !filePreview) return null;

//     const renderPreview = () => {
//       if (file.type.startsWith("image/")) {
//         return (
//           <Image
//             src={filePreview}
//             alt="preview"
//             width={100}
//             height={100}
//             className="rounded"
//           />
//         );
//       } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
//         return (
//           <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md">
//             <Icon
//               icon="mdi:file-document"
//               width="20"
//               height="20"
//               className="inline mr-1"
//             />
//             {file.name} (Preview: {filePreview || "Loading..."})
//           </div>
//         );
//       } else if (file.type.startsWith("video/")) {
//         return filePreview.startsWith("blob:") ? (
//           <video
//             src={filePreview}
//             controls
//             className="rounded-md"
//             style={{ maxWidth: "100px", width: "auto", height: "auto" }}
//           />
//         ) : (
//           <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md">
//             <Icon
//               icon="mdi:file-video"
//               width="20"
//               height="20"
//               className="inline mr-1"
//             />
//             {file.name}
//           </div>
//         );
//       } else if (file.type === "application/pdf") {
//         return (
//           <a
//             href={filePreview}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="flex items-center text-blue-600 hover:underline"
//           >
//             <Icon icon="mdi:file-pdf" width="20" height="20" className="mr-1" />
//             {file.name}
//           </a>
//         );
//       } else if (file.type === "application/json") {
//         return (
//           <a
//             href={filePreview}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="flex items-center text-blue-600 hover:underline"
//           >
//             <Icon
//               icon="mdi:file-json"
//               width="20"
//               height="20"
//               className="mr-1"
//             />
//             {file.name}
//           </a>
//         );
//       } else {
//         return (
//           <a
//             href={filePreview}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="flex items-center text-blue-600 hover:underline"
//           >
//             <Icon icon="mdi:file" width="20" height="20" className="mr-1" />
//             {file.name}
//           </a>
//         );
//       }
//     };

//     return (
//       <div className="relative flex items-center gap-2">
//         {renderPreview()}
//         <button
//           onClick={onRemove}
//           className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
//           title="ลบไฟล์"
//         >
//           <Icon icon="mdi:close" width="16" height="16" />
//         </button>
//       </div>
//     );
//   };

//   const handleRemoveFile = () => {
//     setFile(null);
//     setFilePreview(null);
//     if (filePreview) URL.revokeObjectURL(filePreview);
//   };

//   const isUrl = (text: string): boolean => {
//     const urlRegex = /^(https?:\/\/)?([\w\d-]+\.)+[\w\d-]{2,}(\/.*)?$/i;
//     return urlRegex.test(text.trim());
//   };

//   const getFriendship = async () => {
//     if (!selectedUser.friendshipId) return;
//     try {
//       const res = await fetch(
//         `/api/user/getFriendship/${selectedUser.friendshipId}`
//       );
//       const data = await res.json();
//       console.log(data);

//       setFriendshipStatus(data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const startcall = async () => {
//     setIsCallOpen(true);
//     const chatId =
//       session!.user.id < selectedUser.id
//         ? `${session!.user.id}-${selectedUser.id}`
//         : `${selectedUser.id}-${session!.user.id}`;
//     if (chatId) {
//       socket.emit("startcall", { chatId });
//     }
//   };

//   const handleUnBlock = async () => {
//     if (status !== "authenticated" || !session?.user?.id) {
//       setIsOpen(false);
//       return;
//     }

//     if (!selectedUser.friendshipId) {
//       toast.error("ไม่พบ Friendship ID");
//       setIsOpen(false);
//       return;
//     }

//     try {
//       const res = await fetch(
//         `/api/user/friendship/unblock/${selectedUser.friendshipId}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//         }
//       );

//       if (res.ok) {
//         window.location.reload();
//       } else {
//         const errorData = await res.json();
//         console.log(errorData);
//       }
//     } catch (error) {
//       console.error(error);
//     }
//     setIsOpen(false);
//   };

//   const friendship = friendshipStatus?.data?.[0];

//   return (
//     <div className="h-full flex flex-col w-full">
//       <div className="w-full h-[50px] p-2 bg-gradient-to-r from-blue-500 to-purple-500  items-center flex justify-between shadow">
//         <div className="flex gap-2 items-center">
//           {selectedUser.image ? (
//             <Image
//               src={selectedUser.image}
//               alt="Profle"
//               width={30}
//               height={30}
//               className="rounded-full"
//             />
//           ) : (
//             <Image
//               src="/man.svg"
//               alt="Profle"
//               width={30}
//               height={30}
//               className="rounded-full"
//             />
//           )}
//           <p className="text-white">{selectedUser.name}</p>
//         </div>

//         {friendship?.status === "ACCEPTED" && (
//           <div className="flex items-center gap-4 p-2">
//             <button onClick={() => startcall()} className="cursor-pointer">
//               <span>
//                 <Icon
//                   icon="proicons:call"
//                   width="20"
//                   height="20"
//                   color="white"
//                 />
//               </span>
//             </button>
//             {isCallOpen && <CallStart user={selectedUser} />}
//             <button className="cursor-pointer">
//               <span>
//                 <Icon
//                   icon="weui:video-call-outlined"
//                   width="24"
//                   height="24"
//                   color="white"
//                 />
//               </span>
//             </button>
//             <DropdownButton selectedUser={selectedUser} />
//           </div>
//         )}
//       </div>
//       <div className="flex-1 p-4 overflow-y-auto">
//         {messages.map((msg) => (
//           <div
//             key={`msg-${msg.id}`}
//             className={`mb-4 flex ${
//               msg.isMe ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div ref={messagesEndRef} className="flex items-start w-full gap-2">
//               {!msg.isMe && msg.profile && (
//                 <div className="flex-shrink-0">
//                   <Image
//                     src={selectedUser.image || "man.svg"}
//                     alt={`${msg.sender}'s profile`}
//                     width={32}
//                     height={32}
//                     className="rounded-full"
//                     onError={(e) => {
//                       e.currentTarget.src = "/man.svg";
//                     }}
//                   />
//                 </div>
//               )}
//               <div className="flex flex-col flex-1">
//                 {msg.content && (
//                   <div
//                     className={`mb-1 flex ${
//                       msg.isMe ? "justify-end" : "justify-start"
//                     } w-full`}
//                   >
//                     <div
//                       className={`max-w-xs p-2 rounded-lg ${
//                         msg.isMe
//                           ? "bg-blue-500 text-white text-right self-end"
//                           : "bg-white text-left"
//                       }`}
//                     >
//                       {isUrl(msg.content) ? (
//                         <a
//                           href={
//                             msg.content.startsWith("http")
//                               ? msg.content
//                               : `https://${msg.content}`
//                           }
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className={`underline break-all duration-300 transition-all ${
//                             msg.isMe
//                               ? "text-white hover:text-gray-800"
//                               : "text-blue-600 hover:text-blue-800"
//                           } `}
//                         >
//                           {msg.content}
//                         </a>
//                       ) : (
//                         <span>{msg.content}</span>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {msg.file && (
//                   <div
//                     className={`mt-1 flex ${
//                       msg.isMe ? "justify-end" : "justify-start"
//                     } w-full`}
//                   >
//                     {msg.file.match(/\.(webp|jpg|jpeg|png|gif)$/i) ? (
//                       <Link href={msg.file}>
//                         <Image
//                           src={msg.file}
//                           alt="Attached image"
//                           width={300}
//                           height={150}
//                           onLoadingComplete={(img) => {
//                             img.style.width = "auto";
//                             img.style.height = "auto";
//                             img.style.maxWidth = "180px";
//                           }}
//                           className="rounded-md"
//                         />
//                       </Link>
//                     ) : msg.file.match(/\.(mp4|webm|mov)$/i) ? (
//                       <video
//                         src={msg.file}
//                         controls
//                         className="rounded-md md:w-[300px] max-w-[200px]"
//                       />
//                     ) : msg.file.match(/\.(txt|pdf|json)$/i) ? (
//                       <a
//                         href={msg.file}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="flex items-center text-blue-600 hover:underline"
//                       >
//                         <Icon
//                           icon={
//                             msg.file.endsWith(".txt")
//                               ? "mdi:file-document"
//                               : msg.file.endsWith(".pdf")
//                               ? "mdi:file-pdf"
//                               : "mdi:file-json"
//                           }
//                           width="20"
//                           height="20"
//                           className="mr-1"
//                         />
//                         {msg.file.split("/").pop()}
//                       </a>
//                     ) : (
//                       <a
//                         href={msg.file}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="flex items-center text-blue-600 hover:underline"
//                       >
//                         <Icon
//                           icon="mdi:file"
//                           width="20"
//                           height="20"
//                           className="mr-1"
//                         />
//                         {msg.file.split("/").pop()}
//                       </a>
//                     )}
//                   </div>
//                 )}

//                 <div
//                   className={`text-xs text-gray-500 ${
//                     msg.isMe ? "text-right" : "text-left"
//                   } w-full`}
//                 >
//                   {msg.time}
//                 </div>
//               </div>
//               {msg.isMe && msg.profile && (
//                 <div className="flex-shrink-0">
//                   <Image
//                     src={session?.user.image || "man.svg"}
//                     alt={`${msg.sender}'s profile`}
//                     width={32}
//                     height={32}
//                     className="rounded-full"
//                     onError={(e) => {
//                       e.currentTarget.src = "/man.svg";
//                     }}
//                   />
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {friendship?.status === "BLOCKED" &&
//         friendship?.blockedById === session?.user.id && (
//           <button
//             onClick={handleUnBlock}
//             className="p-2 cursor-pointer bg-green-500  text-white text-center rounded-lg md:mb-0 mb-10"
//           >
//             เลิกบล็อก
//           </button>
//         )}
//       {friendship?.status === "BLOCKED" &&
//         friendship?.blockedById !== session?.user.id && (
//           <div className="p-2 bg-red-100  md:mb-0 mb-10 text-red-500 text-center rounded-lg">
//             คุณได้ถูกบล็อกจากผู้ใช้นี้
//           </div>
//         )}
//       {friendship?.status === "ACCEPTED" && (
//         <div className="p-4 bg-white shadow rounded-2xl md:mb-0 mb-9 m-3">
//           <div className="flex items-center gap-2">
//             <div className="relative w-full">
//               <input
//                 type="file"
//                 id="upload"
//                 className="hidden"
//                 disabled={isLoading || friendship?.status === "BLOCKED"}
//                 onChange={handleFileChange}
//               />
//               <label
//                 htmlFor="upload"
//                 className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer"
//               >
//                 <Icon icon="iconoir:attachment" width="18" height="18" />
//               </label>
//               <input
//                 type="text"
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 placeholder="พิมพ์ข้อความ..."
//                 className="w-full p-2 pl-10 pr-12 rounded-full bg-gray-100 border-none"
//                 disabled={isLoading || friendship?.status === "BLOCKED"}
//               />
//               <button
//                 onClick={sendMessage}
//                 disabled={isLoading || friendship?.status === "BLOCKED"}
//                 className={`absolute right-3 top-1/2 -translate-y-1/2 ${
//                   isLoading ? "opacity-50" : ""
//                 }`}
//               >
//                 <Icon icon="lucide:send" width="20" height="20" color="black" />
//               </button>
//             </div>
//           </div>
//           {filePreview && (
//             <div className="mt-2">
//               <FilePreview
//                 file={file}
//                 filePreview={filePreview}
//                 onRemove={handleRemoveFile}
//               />
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatWindow;

"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import io from "socket.io-client";
import toast from "react-hot-toast";
import CryptoJS from "crypto-js";
import CallModal from "./CallModal";
import CallStart from "./CallStart";
import DropdownButton from "../ui/DropdownButton";

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

const ChatWindow: React.FC<{
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedUser: User;
}> = ({ isOpen, setIsOpen, selectedUser }) => {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { data: session, status } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isCallOpen, setIsCallOpen] = React.useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<any>();

  useEffect(() => {
    if (status === "authenticated" && selectedUser.id) {
      getMessages();
      getFriendship();
    }
  }, [status, selectedUser.id]);

  const isImageUrl = (text: string): boolean => {
    const imageUrlRegex = /\.(webp|jpg|jpeg|png|gif|application|pdf|video)$/i;
    return imageUrlRegex.test(text.trim());
  };

  const decryptContent = (encrypted: string): string => {
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, NEXT_PUBLIC_ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error(error);
      return "ถอดรหัสล้มเหลว";
    }
  };

  useEffect(() => {
    if (session?.user?.id && selectedUser.id) {
      const chatId =
        session.user.id < selectedUser.id
          ? `${session.user.id}-${selectedUser.id}`
          : `${selectedUser.id}-${session.user.id}`;

      socket.emit("join_chat", chatId);

      const handleReceiveMessage = (msg: any) => {
        if (msg.chatId !== chatId) return;

        const contentIsImage = msg.content && isImageUrl(msg.content);
        const finalContent = contentIsImage
          ? msg.content
          : msg.content
          ? decryptContent(msg.content)
          : null;

        const receivedMessage: Message = {
          id: msg.id || `${msg.userId}-${Date.now()}`,
          sender:
            msg.userId === session?.user?.id ? "คุณ" : selectedUser.name || "",
          content: finalContent,
          profile: msg.profile || selectedUser.image || "man.svg",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMe: msg.userId === session?.user?.id,
          file: msg.file,
        };

        setMessages((prevMessages) => {
          const exists = prevMessages.some((m) => m.id === receivedMessage.id);
          if (exists) return prevMessages;
          return [...prevMessages, receivedMessage];
        });
      };

      socket.on("receive_message", handleReceiveMessage);

      return () => {
        socket.off("receive_message", handleReceiveMessage);
        socket.emit("leave_chat", chatId);
      };
    }
  }, [session, selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!session?.user?.id || !selectedUser?.id || (!message.trim() && !file))
      return;
    setIsLoading(true);

    const chatId =
      session.user.id < selectedUser.id
        ? `${session.user.id}-${selectedUser.id}`
        : `${selectedUser.id}-${session.user.id}`;

    const formData = new FormData();
    let encryptedContent = null;
    if (message.trim()) {
      encryptedContent = CryptoJS.AES.encrypt(
        message,
        NEXT_PUBLIC_ENCRYPTION_KEY
      ).toString();
      formData.append("content", encryptedContent);
    }
    formData.append("recipientId", String(selectedUser.id));
    if (file) formData.append("file", file);

    try {
      const res = await fetch(`/api/user/sendmessage/${selectedUser.id}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`${res.status}`);

      const data = await res.json();
      const messageId = data.data.id;

      socket.emit("send_message", {
        id: messageId,
        content: encryptedContent,
        file: data.data.file,
        profile: session.user.image,
        chatId,
        conversationId: selectedUser.id,
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
      console.error(error);
      toast.error("ไม่สามารถส่งข้อความได้ กรุณาลองอีกครั้ง.");
    } finally {
      setIsLoading(false);
    }
  };

  const getMessages = async () => {
    if (!session?.user?.id || !selectedUser.id) return;
    try {
      const res = await fetch(`/api/user/getMessages/${selectedUser.id}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = (await res.json()) as ApiMessage[];
      if (Array.isArray(data)) {
        const transformedMessages: Message[] = data.map((msg) => {
          const contentIsImage = msg.content && isImageUrl(msg.content);
          const finalContent = contentIsImage
            ? msg.content
            : msg.content
            ? decryptContent(msg.content)
            : null;

          return {
            id: msg.id,
            sender:
              msg.sender.id === Number(session.user.id)
                ? "คุณ"
                : msg.sender.name || "ไม่ทราบชื่อ",
            profile: msg.sender.image || "man.svg",
            content: finalContent,
            time: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isMe: msg.sender.id === Number(session.user.id),
            file: msg.file || null,
          };
        });
        setMessages(transformedMessages);
      }
    } catch (error) {
      console.error("การดึงข้อความล้มเหลว:", error);
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

  const isUrl = (text: string): boolean => {
    const urlRegex = /^(https?:\/\/)?([\w\d-]+\.)+[\w\d-]{2,}(\/.*)?$/i;
    return urlRegex.test(text.trim());
  };

  const getFriendship = async () => {
    if (!selectedUser.friendshipId) return;
    try {
      const res = await fetch(
        `/api/user/getFriendship/${selectedUser.friendshipId}`
      );
      const data = await res.json();
      setFriendshipStatus(data);
    } catch (error) {
      console.error(error);
    }
  };

  const startcall = async () => {
    setIsCallOpen(true);
    if (!session?.user?.id || !selectedUser.id) {
      console.log("Missing user ID or selected user ID");
      return;
    }
    const targetId = selectedUser.id;
    console.log("Calling user ID:", targetId);
    socket.emit("startcall", { targetId, callerId: session.user.id });
  };

  const handleUnBlock = async () => {
    if (status !== "authenticated" || !session?.user?.id) {
      setIsOpen(false);
      return;
    }

    if (!selectedUser.friendshipId) {
      toast.error("ไม่พบ Friendship ID");
      setIsOpen(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/user/friendship/unblock/${selectedUser.friendshipId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.ok) {
        window.location.reload();
      } else {
        const errorData = await res.json();
        console.log(errorData);
      }
    } catch (error) {
      console.error(error);
    }
    setIsOpen(false);
  };

  const friendship = friendshipStatus?.data?.[0];

  return (
    <div className="h-full flex flex-col w-full">
      <div className="w-full h-[50px] p-2 bg-gradient-to-r from-blue-500 to-purple-500 items-center flex justify-between shadow">
        <div className="flex gap-2 items-center">
          {selectedUser.image ? (
            <Image
              src={selectedUser.image}
              alt="Profile"
              width={30}
              height={30}
              className="rounded-full"
            />
          ) : (
            <Image
              src="/man.svg"
              alt="Profile"
              width={30}
              height={30}
              className="rounded-full"
            />
          )}
          <p className="text-white">{selectedUser.name}</p>
        </div>

        {friendship?.status === "ACCEPTED" && (
          <div className="flex items-center gap-4 p-2">
            <button onClick={startcall} className="cursor-pointer">
              <span>
                <Icon
                  icon="proicons:call"
                  width="20"
                  height="20"
                  color="white"
                />
              </span>
            </button>
            {isCallOpen && <CallStart user={selectedUser} />}
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
            <DropdownButton selectedUser={selectedUser} />
          </div>
        )}
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={`msg-${msg.id}`}
            className={`mb-4 flex ${
              msg.isMe ? "justify-end" : "justify-start"
            }`}
          >
            <div ref={messagesEndRef} className="flex items-start w-full gap-2">
              {!msg.isMe && msg.profile && (
                <div className="flex-shrink-0">
                  <Image
                    src={selectedUser.image || "man.svg"}
                    alt={`${msg.sender}'s profile`}
                    width={32}
                    height={32}
                    className="rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = "/man.svg";
                    }}
                  />
                </div>
              )}
              <div className="flex flex-col flex-1">
                {msg.content && (
                  <div
                    className={`mb-1 flex ${
                      msg.isMe ? "justify-end" : "justify-start"
                    } w-full`}
                  >
                    <div
                      className={`md:max-w-xs max-w-[200px] p-2 rounded-lg ${
                        msg.isMe
                          ? "bg-blue-500 text-white text-right self-end"
                          : "bg-white text-left"
                      }`}
                    >
                      {isUrl(msg.content) ? (
                        <a
                          href={
                            msg.content.startsWith("http")
                              ? msg.content
                              : `https://${msg.content}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`underline break-all duration-300 transition-all  ${
                            msg.isMe
                              ? "text-white hover:text-gray-800"
                              : "text-blue-600 hover:text-blue-800"
                          }`}
                        >
                          {msg.content}
                        </a>
                      ) : (
                        <span className="w-[130px] h-auto break-words whitespace-pre-wrap">
                          {msg.content}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {msg.file && (
                  <div
                    className={`mt-1 flex ${
                      msg.isMe ? "justify-end" : "justify-start"
                    } w-full`}
                  >
                    {msg.file.match(/\.(webp|jpg|jpeg|png|gif)$/i) ? (
                      <Link href={msg.file}>
                        <Image
                          src={msg.file}
                          alt="Attached image"
                          width={300}
                          height={150}
                          onLoadingComplete={(img) => {
                            img.style.width = "auto";
                            img.style.height = "auto";
                            img.style.maxWidth = "180px";
                          }}
                          className="rounded-md"
                        />
                      </Link>
                    ) : msg.file.match(/\.(mp4|webm|mov)$/i) ? (
                      <video
                        src={msg.file}
                        controls
                        className="rounded-md md:w-[300px] max-w-[200px]"
                      />
                    ) : msg.file.match(/\.(txt|pdf|json)$/i) ? (
                      <a
                        href={msg.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        <Icon
                          icon={
                            msg.file.endsWith(".txt")
                              ? "mdi:file-document"
                              : msg.file.endsWith(".pdf")
                              ? "mdi:file-pdf"
                              : "mdi:file-json"
                          }
                          width="20"
                          height="20"
                          className="mr-1"
                        />
                        {msg.file.split("/").pop()}
                      </a>
                    ) :  msg.file.match(/\.(mp3)$/i) ? (
                      <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                        <Icon icon="mdi:music" width="24" height="24" className="text-blue-500" />
                        <audio
                          src={msg.file}
                          controls
                          className="rounded-lg md:w-[300px] max-w-[200px] border border-gray-200 shadow-inner"
                          style={{
                            accentColor: "#3B82F6", 
                          }}
                        />
                      </div>
                    ) : (
                      <a
                        href={msg.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        <Icon
                          icon="mdi:file"
                          width="20"
                          height="20"
                          className="mr-1"
                        />
                        {msg.file.split("/").pop()}
                      </a>
                    )}
                  </div>
                )}

                <div
                  className={`text-xs text-gray-500 ${
                    msg.isMe ? "text-right" : "text-left"
                  } w-full`}
                >
                  {msg.time}
                </div>
              </div>
              {msg.isMe && msg.profile && (
                <div className="flex-shrink-0">
                  <Image
                    src={session?.user.image || "man.svg"}
                    alt={`${msg.sender}'s profile`}
                    width={32}
                    height={32}
                    className="rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = "/man.svg";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {friendship?.status === "BLOCKED" &&
        friendship?.blockedById === session?.user.id && (
          <button
            onClick={handleUnBlock}
            className="p-2 cursor-pointer bg-green-500 text-white text-center rounded-lg md:mb-0 mb-10"
          >
            เลิกบล็อก
          </button>
        )}
      {friendship?.status === "BLOCKED" &&
        friendship?.blockedById !== session?.user.id && (
          <div className="p-2 bg-red-100 md:mb-0 mb-10 text-red-500 text-center rounded-lg">
            คุณได้ถูกบล็อกจากผู้ใช้นี้
          </div>
        )}
      {friendship?.status === "ACCEPTED" && (
        <div className="p-4 bg-white shadow rounded-2xl md:mb-0 mb-9 m-3">
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <input
                type="file"
                id="upload"
                className="hidden"
                disabled={isLoading || friendship?.status === "BLOCKED"}
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
                disabled={isLoading || friendship?.status === "BLOCKED"}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || friendship?.status === "BLOCKED"}
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
      )}
    </div>
  );
};

export default ChatWindow;
