"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import ChatWindow from "./ChatWindow";
import io from "socket.io-client";
import { useChat } from "../../app/context/GlobalContext";
import toast from "react-hot-toast";
import ChatWindowGroup from "./ChatWindowGroup";

const socket = io("http://localhost:5000", { autoConnect: true });

interface User {
  id: number;
  name?: string;
  email?: string;
  image?: string | null;
  enabled?: boolean;
  lastMessageTime?: string;
  messageCount?: number;
  friendshipStatus: string;
  friendshipId: number;
  unreadMessageCount?: number;
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

interface GroupMember {
  id: number;
  userId: number;
  role: string;
  user: User;
}

interface Group {
  id: number;
  name: string;
  members: GroupMember[];
}

const ChatPanel = () => {
  const session = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenGroup, setIsOpenGroup] = useState(false);
  const { selectedUser, setSelectedUser } = useChat() as any;
  const [friend, setFriend] = useState<User[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const friendRef = useRef<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

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
      console.error("Failed to fetch users:", error);
      setUser([]);
    }
  };

  const getFriendsWithLastMessage = async () => {
    try {
      if (!session?.data?.user?.id) return;
      setIsLoadingFriends(true);
      const res = await fetch(`/api/user/getfriends/${session.data?.user.id}`);
      if (!res.ok) throw new Error(`Fetch failed with status: ${res.status}`);
      const friendsList = await res.json();

      const friendsWithMessages = await Promise.all(
        friendsList.map(async (f: User) => {
          const msgRes = await fetch(`/api/user/getMessages/${f.id}`);
          const messages = msgRes.ok ? await msgRes.json() : [];
          const lastMessage =
            messages.length > 0
              ? messages.reduce((latest: any, current: any) =>
                  new Date(current.createdAt) > new Date(latest.createdAt)
                    ? current
                    : latest
                )
              : null;
          return {
            ...f,
            lastMessageTime: lastMessage?.createdAt,
            messageCount: messages.length,
            unreadMessageCount: 0,
          };
        })
      );

      const sortedFriends = friendsWithMessages.sort((a, b) => {
        const timeA = a.lastMessageTime
          ? new Date(a.lastMessageTime).getTime()
          : 0;
        const timeB = b.lastMessageTime
          ? new Date(b.lastMessageTime).getTime()
          : 0;
        return timeB - timeA;
      });

      setFriend(sortedFriends);
      friendRef.current = sortedFriends;

      sortedFriends.forEach((f) => {
        const chatId =
          session.data!.user.id < f.id
            ? `${session.data!.user.id}-${f.id}`
            : `${f.id}-${session.data!.user.id}`;
        socket.emit("join_chat", chatId);
      });
    } catch (error) {
      console.error(error);
      setFriend([]);
      friendRef.current = [];
    } finally {
      setIsLoadingFriends(false);
    }
  };

  useEffect(() => {
    if (session.status === "authenticated" && session?.data?.user?.id) {
      getFriendsWithLastMessage();

      socket.on("connect", () => {});

      socket.on("receive_message", (msg: any) => {
        const [userId1, userId2] = msg.chatId.split("-").map(Number);
        const friendId = userId1 === session.data?.user.id ? userId2 : userId1;

        if (selectedUser?.id !== friendId) {
          setFriend((prevFriends) => {
            const friendExists = prevFriends.some((f) => f.id === friendId);
            if (!friendExists) {
              return prevFriends;
            }

            const updatedFriends = prevFriends.map((f) =>
              f.id === friendId
                ? {
                    ...f,
                    messageCount: (f.messageCount || 0) + 1,
                    lastMessageTime: msg.time,
                    unreadMessageCount: (f.unreadMessageCount || 0) + 1,
                  }
                : f
            );
            return updatedFriends.sort((a, b) => {
              const timeA = a.lastMessageTime
                ? new Date(a.lastMessageTime).getTime()
                : 0;
              const timeB = b.lastMessageTime
                ? new Date(b.lastMessageTime).getTime()
                : 0;
              return timeB - timeA;
            });
          });
        } else {
          setFriend((prevFriends) => {
            const updatedFriends = prevFriends.map((f) =>
              f.id === friendId
                ? {
                    ...f,
                    messageCount: (f.messageCount || 0) + 1,
                    lastMessageTime: msg.time,
                  }
                : f
            );
            return updatedFriends.sort((a, b) => {
              const timeA = a.lastMessageTime
                ? new Date(a.lastMessageTime).getTime()
                : 0;
              const timeB = b.lastMessageTime
                ? new Date(b.lastMessageTime).getTime()
                : 0;
              return timeB - timeA;
            });
          });
        }
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });

      return () => {
        socket.off("receive_message");
        socket.off("connect");
        socket.off("connect_error");
      };
    }
  }, [session.status, session?.data?.user?.id, selectedUser?.id]);

  useEffect(() => {
    if (session.status === "loading") return;
    if (session.status === "unauthenticated") {
      router.push("/login");
    }
  }, [session.status, router]);

  useEffect(() => {
    getUser();
  }, [search]);

  const handleUserClick = (selectedUser: User) => {
    setIsLoadingChat(true);
    setFriend((prevFriends) =>
      prevFriends.map((f) =>
        f.id === selectedUser.id ? { ...f, unreadMessageCount: 0 } : f
      )
    );
    setTimeout(() => {
      setSelectedUser(selectedUser);
      setIsOpen(true);
      setIsLoadingChat(false);
    }, 0);
  };

  const handleGroup = (selectedGroup: Group) => { // แก้ parameter ให้รับ Group
    setIsLoadingChat(true);
    setTimeout(() => {
      setSelectedGroup(selectedGroup);
      setSelectedUser(null); // รีเซ็ต selectedUser
      setIsOpenGroup(true);
      setIsOpen(false); // ปิด ChatWindow
      setIsLoadingChat(false);
    }, 0);
  };

  const getGroup = async () => {
    try {
      const res = await fetch("/api/user/getGroup", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setGroups(data);
      } else {
        toast.error(data.message || "ไม่สามารถดึงข้อมูลกลุ่มได้");
      }
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลกลุ่ม");
    }
  };

  useEffect(() => {
    getGroup();
  }, []);

  return (
    <div className="flex h-screen w-full gap-2">
      <div className="bg-white border-r md:w-[350px] w-[190px] h-screen p-4 border-white shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon icon="ep:chat-dot-round" width="24" height="24" />
            <h2 className="md:text-xl text-[15px] font-semibold">My Chat</h2>
          </div>
        </div>

        <div className="space-y-2 overflow-y-auto">
          {groups.length > 0 &&
            groups.map((g, i) => (
              <div
                key={i}
                onClick={() => handleGroup(g as any)}
                className="rounded-md flex items-center py-2 px-4 text-[8px] md:text-sm text-white shadow-md transition-all cursor-pointer bg-gradient-to-r from-blue-500 to-purple-500"
              >
                <div className="w-[30px] h-[30px] md:w-[40px] md:h-[40px] rounded-full mr-3">
                  <Icon
                    icon="fluent-mdl2:group"
                    width="100%"
                    height="100%"
                    color="white"
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-white text-[8px] md:text-sm">
                    {g.name || "Unknown"}
                  </p>
                  <div className="flex gap-2"></div>
                </div>
              </div>
            ))}

          {friend.length > 0 ? (
            friend
              .filter((u) => u.friendshipStatus !== "PENDING")
              .map((f, i) => (
                <div
                  key={i}
                  onClick={() => handleUserClick(f)}
                  className="rounded-md flex items-center py-2 px-4 text-[8px] md:text-sm text-white shadow-md transition-all cursor-pointer bg-gradient-to-r from-blue-500 to-purple-500"
                >
                  <div className="w-[30px] h-[30px] md:w-[40px] md:h-[40px] rounded-full mr-3">
                    {f.image ? (
                      <img
                        src={f.image}
                        alt="Profile"
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <img
                        src="/man.svg"
                        alt="Profile"
                        className="w-full h-full rounded-full"
                      />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-white text-[8px] md:text-sm">
                      {f.name || "Unknown"}
                    </p>
                    {f.lastMessageTime && (
                      <span className="text-gray-200 text-[8px] md:text-sm">
                        {new Date(f.lastMessageTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                    <div className="flex gap-2">
                      {f.unreadMessageCount && f.unreadMessageCount > 0 ? (
                        <span className="bg-red-500 text-white text-[8px] md:text-sm rounded-full px-2">
                          {f.unreadMessageCount} ใหม่
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center text-gray-500">No friends found</div>
          )}
        </div>
      </div>

      <div className="w-full bg-gray-100">
        {isOpen && selectedUser ? (
          <ChatWindow
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            selectedUser={selectedUser}
          />
        ) : isOpenGroup && selectedGroup ? (
          <ChatWindowGroup
            isOpenGroup={isOpenGroup}
            setIsOpenGroup={setIsOpenGroup}
            selectedGroup={selectedGroup} 
          />
        ) : (
          <div className="text-gray-500 mx-auto my-auto flex items-center justify-center h-full">
            Select a user to chat
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;
