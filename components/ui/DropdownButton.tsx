import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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
      const res = await fetch(
        `/api/user/friendship/block/${selectedUser.friendshipId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.ok) {
        toast.success("บล็อกสำเร็จ");
        onFriendshipUpdate?.("BLOCKED");
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
      const res = await fetch(
        `/api/user/friendship/deletefriend/${selectedUser.friendshipId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.ok) {
        toast.success("ลบเพื่อนสำเร็จ");
        onFriendshipUpdate?.("DELETED");
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "ไม่สามารถลบเพื่อนได้");
      }
    } catch (error) {
      console.error("Error during delete:", error);
      toast.error("เกิดข้อผิดพลาดระหว่างการลบเพื่อน");
    }
    setIsOpen(false);
  };

  const createGroup = async (id: number) => {
    if (status !== "authenticated" || !session?.user?.id) {
      toast.error("กรุณาเข้าสู่ระบบก่อน");
      return;
    }

    try {
      const res = await fetch("/api/user/creategroup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`สร้างกลุ่ม "${data.name}" สำเร็จ`);
        router.push(`/group/${data.id}`);
      } else {
        toast.error(data.message || "เกิดข้อผิดพลาดในการสร้างกลุ่ม");
      }
    } catch (error) {
      console.error("Error during group creation:", error);
      toast.error("เกิดข้อผิดพลาดในการสร้างกลุ่ม");
    }
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
            <li
              onClick={() => {
                if (selectedUser.id) {
                  createGroup(selectedUser.id);
                } else {
                  toast.error("ไม่พบ ID ของผู้ใช้");
                }
              }}
              className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            >
              <Icon icon="fluent-mdl2:add-group" width="20" height="20" />
              สร้างกลุ่มกับคนนี้
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
              className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            >
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
