import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface User {
  id: number;
  name?: string;
  email?: string;
  image?: string | null;
  enabled?: boolean;
}

interface ModalUserProps {
  user: User[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ModalUser: React.FC<ModalUserProps> = ({ user, isOpen, setIsOpen }) => {

    
  const addfriend = async (userId: number) => {
    try {
      const res = await fetch("/api/user/addfriend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("คำขอเพื่อนส่งเรียบร้อย");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            className="relative w-full max-w-[28rem] rounded-lg bg-white shadow-lg overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 max-h-[300px] overflow-y-auto">
              {user.length > 0 ? (
                user.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center p-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      {u.image ? (
                        <img
                          src={u.image}
                          alt={u.name}
                          className="w-[60px] h-[60px] rounded-full mr-3"
                        />
                      ) : (
                        <img
                          src="/man.svg"
                          alt={u.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      )}
                      <div>
                        <p className="text-[18px] font-medium">{u.name}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No users found</p>
              )}
            </div>

            {user.map((u: any, i) => (
              <div key={i} className="p-4 text-right">
                <button
                  onClick={() => addfriend(u.id)}
                  className="px-4 py-2 text-sm text-white hover:text-gray-200 bg-gray-800 rounded-4xl"
                >
                  เพิ่มเพื่อน
                </button>
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalUser;
