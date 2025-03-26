"use client";

import { useEffect, useState } from "react";

const Loader = () => {
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false); 
    }, 1000);

    return () => clearTimeout(timer); 
  }, []);

  if (loading) {
    return (
      <div className="bg-black z-50 fixed inset-0 flex items-center justify-center">
        <div className="loader"></div> 
      </div>
    );
  }

  return null; 
};

export default Loader;