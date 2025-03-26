"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import ModalFirend from "../Nav/ModalFirend";
import toast from "react-hot-toast";

interface User {
  id: number;
  name?: string;
  email?: string;
  image?: string | null;
  status?: string;
  enabled?: boolean;
  friendshipStatus?: "PENDING" | "ACCEPTED" | "BLOCKED";
  friendshipId?: number;
  isRequestor?: boolean;
}

const Notifications = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.id) {
      getUser();
    }
  }, [status, router, session?.user?.id]);

  const getUser = async () => {
    try {
      if (!session?.user?.id) return;

      const res = await fetch(`/api/user/getcontact/${session.user.id}`);
      if (!res.ok) {
        throw new Error(`Fetch failed with status: ${res.status}`);
      }
      const data = await res.json();
      setUser(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setUser([]);
    }
  };

  const handleAcceptFriend = async (friendshipId: number) => {
    try {
      const res = await fetch(`/api/user/accept-friend/${friendshipId}`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(`${res.status}`);
      }
      const data = await res.json();
      toast.success("ยอมรับคำขอแล้ว", data);
      await getUser();
    } catch (error) {
      console.error(error);
    } 
  };

  const handleUserClick = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    setIsOpen(true);
  };



  return (
    <div className="md:w-[250px] w-[190px] bg-white border-r h-screen p-4 border-white shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon icon="ep:chat-dot-round" width="24" height="24" />
          <h2 className="md:text-xl text-[15px] font-semibold">
            My Notifications
          </h2>
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto h-[calc(100%-10rem)]">
        {user.length > 0 ? (
          user
            .filter((u) => !u.isRequestor)
            .map((u, i) => (
              <div
                key={i}
                className="rounded-md flex items-center py-2 gap-2 px-4 text-sm text-white shadow-md transition-all"
              >
                {u.image ? (
                  <div onClick={() => handleUserClick(u)}>
                    <img
                      src={u.image}
                      alt={u.name || "User"}
                      className="w-[40px] h-[40px] rounded-full mr-3"
                    />
                  </div>
                ) : (
                  <div onClick={() => handleUserClick(u)}>
                    <img
                      src="/man.svg"
                      alt={u.name || "User"}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  </div>
                )}
                <div className="flex justify-between items-center w-full z-50">
                  <div className="flex flex-col">
                    <p
                      className="text-black cursor-pointer"
                      onClick={() => handleUserClick(u)}
                    >
                      {u.name || "Unnamed User"}
                    </p>
                    {u.friendshipStatus && (
                      <span className="text-xs text-gray-500">
                        {u.friendshipStatus === "PENDING" &&
                          `Status: รอดำเนินการ`}
                      </span>
                    )}
                  </div>
                  {u.friendshipId && (
                    <button
                      onClick={() => handleAcceptFriend(u.friendshipId!)}
                      className="cursor-pointer"
                    >
                      <Icon
                        icon="fluent-mdl2:accept"
                        width="24"
                        height="24"
                        color="green"
                      />
                    </button>
                  )}
                </div>
              </div>
            ))
        ) : (
          <div className="text-center text-gray-500">No pending requests</div>
        )}

        {selectedUser && (
          <ModalFirend
            user={[selectedUser]}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          />
        )}
      </div>
    </div>
  );
};

export default Notifications;
