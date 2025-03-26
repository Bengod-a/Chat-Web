"use client"; // ใช้เฉพาะ Client Component

import { createContext, useContext, useState,  } from "react";

type User = {
  id: number;
  name: string;
  unreadMessageCount: number;
};

type ChatContextType = {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  handleUserClick: (user: User) => void;
};

export const ChatContext = createContext<ChatContextType | undefined>(undefined);


export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  const handleUserClick = (user: User) => {
    setIsLoadingChat(true);

    setFriends((prevFriends) =>
      prevFriends.map((f) =>
        f.id === user.id ? { ...f, unreadMessageCount: 0 } : f
      )
    );

    setTimeout(() => {
      setSelectedUser(user);
      setIsOpen(true);
      setIsLoadingChat(false);
    }, 500);
  };

  return (
    <ChatContext.Provider value={{ selectedUser, setSelectedUser, handleUserClick }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
};
