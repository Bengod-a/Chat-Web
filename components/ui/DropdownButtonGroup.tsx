import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Group {
  id: number;
  name: string;
  members: { id: number; userId: number; role: string; user: any }[];
}

interface DropdownButtonProps {
  setIsOpenGroup: (isOpen: boolean) => void;
  selectedGroup: Group; 
  onFriendshipUpdate?: (newStatus: string) => void;
}

const DropdownButtonGroup: React.FC<DropdownButtonProps> = ({
  setIsOpenGroup,
  selectedGroup, 
  onFriendshipUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
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
            <li className="px-4 py-2 flex items-center gap-2 border-b border-gray-200"></li>
            <li className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
              <Icon
                icon="material-symbols:image-outline-rounded"
                width="24"
                height="24"
              />
              เปลี่ยนรูปกลุ่ม
            </li>
            <li className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
              <Icon
                icon="material-symbols-light:change-circle-outline"
                width="24"
                height="24"
              />
              เปลี่ยนชื่อกลุ่ม
            </li>
            <li
              className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            >
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