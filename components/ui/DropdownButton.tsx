import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface User {
  id: number;
  name?: string;
  email?: string;
  image?: string | null;
  friendshipStatus: string;
  friendshipId?: number;
}

interface DropdownButtonProps {
  selectedUser: User;
  onFriendshipUpdate?: (newStatus: string) => void;
}

const DropdownButton: React.FC<DropdownButtonProps> = ({
  selectedUser,
  onFriendshipUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };


  const handleBlock = async () => {
    if (status !== "authenticated" || !session?.user?.id) {
      toast.error("กรุณาเข้าสู่ระบบก่อน");
      setIsOpen(false);
      return;
    }
  
    if (!selectedUser.friendshipId) {
      toast.error("ไม่พบ Friendship ID");
      setIsOpen(false);
      return;
    }
  
    try {
      const res = await fetch(`/api/user/friendship/block/${selectedUser.friendshipId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
  
      if (res.ok) {
        toast.success("บล็อกสำเร็จ");
        onFriendshipUpdate?.("BLOCKED");
        window.location.reload();
      } else {
        const errorData = await res.json();
        toast.error(`ไม่สามารถบล็อกได้: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error during block:", error);
      toast.error("เกิดข้อผิดพลาดระหว่างการบล็อก");
    }
    setIsOpen(false);
  };
  const handleDelete = async () => {
    if (status !== "authenticated" || !session?.user?.id) {
      toast.error("กรุณาเข้าสู่ระบบก่อน");
      setIsOpen(false);
      return;
    }
  
    if (!selectedUser.friendshipId) {
      toast.error("ไม่พบ Friendship ID");
      setIsOpen(false);
      return;
    }
  
    try {
      const res = await fetch(`/api/user/friendship/deletefriend/${selectedUser.friendshipId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
  
      if (res.ok) {
        window.location.reload();
      } else {
        const errorData = await res.json();
        toast.error(`${errorData.error}`);
      }
    } catch (error) {
      console.error(error);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="cursor-pointer focus:outline-none"
      >
        <span>
          <Icon icon="uil:ellipsis-v" width="24" height="24" color="white" />
        </span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
          <ul className="py-1">
            <li className="px-4 py-2 flex items-center gap-2 border-b border-gray-200">
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
              <span className="text-gray-800">
                {selectedUser.name || "Unknown"}
              </span>
            </li>
            <li className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
              <Icon icon="uil:user" width="20" height="20" />
              โปรไฟล์
            </li>
            {selectedUser.friendshipStatus === "ACCEPTED" && (
              <li
                onClick={handleBlock}
                className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              >
                <Icon
                  icon="material-symbols-light:block"
                  width="20"
                  height="20"
                />
                บล็อก
              </li>
            )}
            <li 
            onClick={handleDelete}
            className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
              <Icon icon="uil:user-minus" width="20" height="20" />
              ลบเพื่อน
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownButton;
