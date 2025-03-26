"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import React, { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

interface SideBarProps {
  setPl: (value: boolean) => void;
  setSearchPanel: (value: boolean) => void;
  setHome: (value: boolean) => void;
}

const SideBarMobi = ({ setPl, setSearchPanel, setHome }: SideBarProps) => {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    session.update();
  }, []);

  useEffect(() => {
    if (!session.data?.user) {
      router.push("/login");
    }
  }, []);

  const hdllogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const goToHome = () => {
    setHome(true);
    setPl(false);
    setSearchPanel(false);
  };

  const goToNotifications = () => {
    setPl(true);
    setSearchPanel(false);
    setHome(false);
  };

  const goToFriend = () => {
    setPl(false);
    setSearchPanel(true);
    setHome(false);
  };

  return (
    <div className="block md:hidden">
      <aside
        id="default-sidebar"
        className="fixed bottom-0 left-0 z-40 w-full h-[40px] bg-gradient-to-r from-blue-500 to-purple-500 transition-transform translate-y-0"
        aria-label="Sidebar"
      >
        <div className="h-full px-4 py-2 flex justify-center items-center text-white">
          <ul className="flex space-x-4 items-center justify-center">
            <li>
              <Link
                href="/"
                onClick={goToHome}
                className="flex items-center text-center cursor-pointer p-2 text-white rounded-lg hover:bg-[#4e44e1] dark:hover:bg-[#6e6296] transition duration-300 group"
              >
                <Icon icon="ri:home-line" width="24" height="24" />
              </Link>
            </li>
            <li>
              <button
                onClick={goToNotifications}
                className="flex items-center text-center cursor-pointer p-2 text-white rounded-lg hover:bg-[#4e44e1] dark:hover:bg-[#6e6296] transition duration-300 group"
              >
                <Icon
                  icon="material-symbols:notifications-outline"
                  width="24"
                  height="24"
                  color="wihte"
                />
              </button>
            </li>
            <li>
              <button
                onClick={goToFriend}
                className="flex items-center p-2 text-white rounded-lg hover:bg-[#4e44e1] transition duration-300 group w-full text-left"
              >
                <Icon icon="fluent-mdl2:add-friend" width="24" height="24" />
              </button>
            </li>
            <li>
              <button className="flex items-center text-center cursor-pointer p-2 text-white rounded-lg hover:bg-[#4e44e1] dark:hover:bg-[#6e6296] transition duration-300 group">
                <Icon
                  icon="material-symbols:settings-outline"
                  width="24"
                  height="24"
                />
              </button>
            </li>
            <li className="w-full py-4 px-4 flex justify-center items-center">
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <div className="flex items-center gap-2">
                    {session.data?.user?.image ? (
                      <Image
                        src={session.data.user?.image}
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
                    <p>{session.data?.user?.name}</p>
                  </div>
                </DropdownTrigger>

                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem key="logout" color="danger" onClick={hdllogout}>
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default SideBarMobi;
