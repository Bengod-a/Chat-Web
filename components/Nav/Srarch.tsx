"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import ModalUser from "./ModalUser";
import Image from "next/image";

interface User {
  id: number;
  name?: string;
  email?: string;
  image?: string | null;
  enabled?: boolean;
}


const ChatPanel = () => {
  const session = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [friend, setFriend] = useState<User[]>([]);



  useEffect(() => {
    if (!session.data?.user) {
      router.push("/login");
    }
  }, []);

  const getUser = async () => {
    try {
      if (!search.trim()) return;

      const res = await fetch(
        `/api/user/getuser?search=${encodeURIComponent(search)}`
      );
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const data = await res.json();
      setUser(data.filter((u: User) => u.id !== session.data?.user.id));
    } catch (error) {
      console.error(error);
      setUser([]);
    }
  };

  useEffect(() => {
    getUser();
  }, [search]);

  console.log(friend);

  const handleUserClick = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    setIsOpen(true);
  };

  return (
    <div className="md:w-[250px] w-[190px] bg-white border-r h-screen p-4 border-white shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
        <Icon icon="material-symbols-light:search" width="24" height="24" />
          <h2 className="md:text-xl text-[15px] font-semibold">Search Frirnd</h2>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Icon
            icon="mdi:magnify"
            className="absolute left-3 top-2"
            width="20"
            height="20"
          />
          <input
            type="text"
            placeholder="ค้นหาผู้ใช้งาน [ชื่อ]"
            className="w-full p-1 border rounded-3xl pl-8 text-[14px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto h-[calc(100%-10rem)]">
        {user.length > 0 ? (
          user.map((u, i) => (
            <div
              key={i}
              onClick={() => handleUserClick(u)}
              className="rounded-md flex items-center py-2 px-4 text-sm  text-white shadow-md transition-all cursor-pointer"
            >
              {u.image ? (
                <img
                  src={u.image}
                  alt={u.name}
                  className="w-[40px] h-[40px] rounded-full mr-3"
                />
              ) : (
                <img
                  src="/man.svg"
                  alt={u.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
              )}

              <p className="text-black">{u.name}</p>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">No results found</div>
        )}
      </div>

      {selectedUser && (
        <ModalUser
          user={[selectedUser]}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      )}
    </div>
  );
};

export default ChatPanel;
