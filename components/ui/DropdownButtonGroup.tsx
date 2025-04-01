// import React, { useState, useEffect, useRef } from "react";
// import { Icon } from "@iconify/react";
// import { useSession } from "next-auth/react";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";
// import { io } from "socket.io-client";


// const socket = io("http://localhost:5000");

// interface Group {
//   id: number;
//   name: string;
//   image?: string;
//   members: { id: number; userId: number; role: string; user: any }[];
// }

// interface DropdownButtonProps {
//   setIsOpenGroup: (isOpen: boolean) => void;
//   selectedGroup: Group;
//   setSelectedGroup: Group | any
//   onFriendshipUpdate?: (newStatus: string) => void;
//   onGroupUpdate?: (updatedGroup: Group) => void;
// }

// const DropdownButtonGroup: React.FC<DropdownButtonProps> = ({
//   setIsOpenGroup,
//   selectedGroup,
//   setSelectedGroup,
//   onFriendshipUpdate,
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const { data: session } = useSession();
//   const router = useRouter();
//   const [image, setImage] = useState<File | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const toggleDropdown = () => setIsOpen((prev) => !prev);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = e.target.files?.[0];
//     if (selectedFile) {
//       setImage(selectedFile);
//     }
//   };

//   const createImageGroup = async () => {
//     if (!session?.user?.id) {
//       toast.error("กรุณาเข้าสู่ระบบ");
//       setIsOpen(false);
//       return;
//     }

//     if (!image) {
//       toast.error("กรุณาเลือกไฟล์รูปภาพ");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("image", image);

//     try {
//       const res = await fetch(`/api/user/createimagegroup/${selectedGroup.id}`, {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) {
//         throw new Error(`Error ${res.status}: ${await res.text()}`);
//       }

//       const data = await res.json();


//       socket.emit("changeImageGroup", {
//         groupId: selectedGroup.id,
//         image: data.data.image,
//       }); 


//       setImage(null);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//       setIsOpen(false);
//     } catch (error) {
//       console.error("Error uploading image:", error);
//       toast.error("เกิดข้อผิดพลาดในการเปลี่ยนรูปกลุ่ม");
//     }
//   };


//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);

//     const handleChangeImageGroup = (data: { groupId: number; image: string }) => {
//       if (data.groupId === selectedGroup.id) {
//         setSelectedGroup({ ...selectedGroup, image: data.image });
//       }
//     };
//     socket.on("changeImageGroup", handleChangeImageGroup);

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       socket.off("changeImageGroup", handleChangeImageGroup);
//     };
//   }, [selectedGroup, setSelectedGroup]);

//   return (
//     <div className="relative inline-block" ref={dropdownRef}>
//       <button onClick={toggleDropdown} className="cursor-pointer focus:outline-none">
//         <Icon icon="uil:ellipsis-v" width="24" height="24" color="white" />
//       </button>
//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
//           <ul className="py-1">
//             <li className="px-4 py-2 flex items-center gap-2 border-b border-gray-200"></li>
//             <li className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
//               <Icon icon="material-symbols:image-outline-rounded" width="24" height="24" />
//               <label htmlFor="group-image-upload" className="cursor-pointer">
//                 เปลี่ยนรูปกลุ่ม
//               </label>
//               <input
//                 id="group-image-upload"
//                 type="file"
//                 accept="image/*,image/png,image/jpeg,image/jpg"
//                 className="hidden"
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//               />
//               {image && (
//                 <button
//                   onClick={createImageGroup}
//                   className="ml-2 text-sm text-blue-500 hover:underline"
//                 >
//                   อัปโหลด
//                 </button>
//               )}
//             </li>
//             <li className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
//               <Icon icon="material-symbols-light:change-circle-outline" width="24" height="24" />
//               เปลี่ยนชื่อกลุ่ม
//             </li>
//             <li className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
//               <Icon icon="iconamoon:exit-thin" width="20" height="20" />
//               ออกจากกลุ่ม
//             </li>
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DropdownButtonGroup;


import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

interface Group {
  id: number;
  name: string;
  image?: string;
  members: { id: number; userId: number; role: string; user: any }[];
}

interface DropdownButtonProps {
  setIsOpenGroup: (isOpen: boolean) => void;
  selectedGroup: Group;
  setSelectedGroup: (group: Group) => void; 
  onFriendshipUpdate?: (newStatus: string) => void;
  onGroupUpdate?: (updatedGroup: Group) => void;
}

const DropdownButtonGroup: React.FC<DropdownButtonProps> = ({
  setIsOpenGroup,
  selectedGroup,
  setSelectedGroup,
  onFriendshipUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

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

    setImage(selectedFile);
  };

  const createImageGroup = async () => {
    if (!session?.user?.id) {
      toast.error("กรุณาเข้าสู่ระบบ");
      setIsOpen(false);
      return;
    }

    if (!image) {
      toast.error("กรุณาเลือกไฟล์รูปภาพ");
      setImage(null); 
      setIsOpen(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await fetch(`/api/user/createimagegroup/${selectedGroup.id}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();

      socket.emit("changeImageGroup", {
        groupId: selectedGroup.id,
        image: data.data.image,
      });

      toast.success("เปลี่ยนรูปกลุ่มสำเร็จ");
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsOpen(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("เกิดข้อผิดพลาดในการเปลี่ยนรูปกลุ่ม");
      setImage(null); 
      setIsOpen(false);
    }
  };

  useEffect(() => {
    socket.emit("join_chat", selectedGroup.id);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const handleChangeImageGroup = (data: { groupId: number; image: string }) => {
      if (data.groupId === selectedGroup.id) {
        setSelectedGroup({ ...selectedGroup, image: data.image });
      }
    };
    socket.on("changeImageGroup", handleChangeImageGroup);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      socket.off("changeImageGroup", handleChangeImageGroup);
    };
  }, [selectedGroup, setSelectedGroup,  selectedGroup.image]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button onClick={toggleDropdown} className="cursor-pointer focus:outline-none">
        <Icon icon="uil:ellipsis-v" width="24" height="24" color="white" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
          <ul className="py-1">
            <li className="px-4 py-2 flex items-center gap-2 border-b border-gray-200"></li>
            <li className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
              <Icon icon="material-symbols:image-outline-rounded" width="24" height="24" />
              <label htmlFor="group-image-upload" className="cursor-pointer">
                เปลี่ยนรูปกลุ่ม
              </label>
              <input
                id="group-image-upload"
                type="file"
                accept="image/*,image/png,image/jpeg,image/jpg"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              {image && (
                <button
                  onClick={createImageGroup}
                  className="ml-2 text-sm text-blue-500 hover:underline"
                >
                  อัปโหลด
                </button>
              )}
            </li>
            <li className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
              <Icon icon="material-symbols-light:change-circle-outline" width="24" height="24" />
              เปลี่ยนชื่อกลุ่ม
            </li>
            <li className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
              <Icon icon="iconamoon:exit-thin" width="20" height="20" />
              ออกจากกลุ่ม
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownButtonGroup;