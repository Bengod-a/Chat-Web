"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Loader from "../loadeing/Loader";

interface SideBarProps {
  setPl: (value: boolean) => void;
  setSearchPanel: (value: boolean) => void;
  setHome: (value: boolean) => void;
}

interface User {
  id: number;
  name?: string;
  email?: string;
  image?: string | null;
  enabled?: boolean;
  friendshipStatus?: "PENDING" | "ACCEPTED" | "BLOCKED";
  friendshipId?: number;
  isRequestor?: boolean;
}

const SideBar = ({ setPl, setSearchPanel, setHome }: SideBarProps) => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [friend, setFriend] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    update();
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const getFriends = async () => {
    try {
      if (!session?.user?.id) return;

      const res = await fetch(`/api/user/getfriends/${session?.user?.id}`);
      if (!res.ok) {
        throw new Error(`Fetch failed with status: ${res.status}`);
      }
      const data = await res.json();
      setFriend(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
      setFriend([]);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      getFriends();
    }
  }, [status, session?.user?.id]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const goToHome = () => {
    setLoading(true);
    setHome(true);
    setPl(false);
    setSearchPanel(false);
    setTimeout(() => setLoading(false), 500);
  };

  const goToNotifications = () => {
    setLoading(true);
    setPl(true);
    setSearchPanel(false);
    setHome(false);
    setTimeout(() => setLoading(false), 500);
  };

  const goToFriend = () => {
    setLoading(true);
    setPl(false);
    setSearchPanel(true);
    setHome(false);
    setTimeout(() => setLoading(false), 500);
  };

  if (status === "loading") {
    return <Loader />;
  }

  

  return (
    <div className="w-64 h-screen hidden md:block shadow">
      {loading ? (
        <Loader />
      ) : (
        <aside
          id="default-sidebar"
          className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform translate-x-0"
          aria-label="Sidebar"
        >
          <h1 className="text-2xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 pl-4 py-4">
            Ben Message
          </h1>
          <div className="h-full px-4 py-6 overflow-y-auto bg-gradient-to-r from-blue-500 to-purple-500 flex flex-col justify-between">
            <ul className="space-y-4 mt-12 font-medium">
              <li>
                <Link
                  href="/"
                  onClick={goToHome}
                  className="flex items-center p-2 text-white rounded-lg hover:bg-[#4e44e1] transition duration-300 group"
                >
                  <Icon icon="ri:home-line" width="24" height="24" />
                  <span className="ml-2 text-[15px]">Home</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={goToNotifications}
                  className="flex items-center p-2 text-white rounded-lg hover:bg-[#4e44e1] transition duration-300 group w-full text-left"
                >
                  <div className="relative inline-block">
                    <Icon
                      icon="material-symbols:notifications-outline"
                      width="24"
                      height="24"
                      color="white"
                    />
                    {friend.filter((u) => u.friendshipStatus === "PENDING" && u.isRequestor === false).length >= 1 &&  (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        { friend.filter((u) => u.friendshipStatus === "PENDING").length}
                      </span>
                    )}
                  </div>
                  <span className="ml-2 text-[15px]">Notifications</span>
                </button>
              </li>
              <li>
                <button
                  onClick={goToFriend}
                  className="flex items-center p-2 text-white rounded-lg hover:bg-[#4e44e1] transition duration-300 group w-full text-left"
                >
                  <Icon icon="fluent-mdl2:add-friend" width="24" height="24" />
                  <span className="ml-2 text-[15px]">Friend</span>
                </button>
              </li>
              <li>
                <button className="flex items-center p-2 text-white rounded-lg hover:bg-[#4e44e1] transition duration-300 group w-full text-left">
                  <Icon
                    icon="material-symbols:settings-outline"
                    width="24"
                    height="24"
                  />
                  <span className="ml-2 text-[15px]">Settings</span>
                </button>
              </li>
              <li>
                <button className="flex items-center p-2 text-white rounded-lg hover:bg-[#4e44e1] transition duration-300 group w-full text-left">
                  <Icon
                    icon="material-symbols:help-outline"
                    width="24"
                    height="24"
                  />
                  <span className="ml-2 text-[15px]">Help & Support</span>
                </button>
              </li>
            </ul>

            <footer className="mb-12">
              <div className="h-[1px] w-full bg-gray-100"></div>
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <Image
                      src="/man.svg"
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                  <p className="text-white text-[16px]">
                    {session?.user?.name}
                  </p>
                </div>
                <button onClick={handleLogout}>
                  <Icon
                    icon="ic:sharp-log-out"
                    width="20"
                    height="20"
                    color="white"
                  />
                </button>
              </div>
            </footer>
          </div>
        </aside>
      )}
    </div>
  );
};

export default SideBar;
