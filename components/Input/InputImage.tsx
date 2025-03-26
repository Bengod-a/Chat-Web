import Image from "next/image";
import React, { useState } from "react";

type Props = {
  onFileChange:(file:File | null) => void
};

const InputImage = ({onFileChange}:Props) => {
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      const ImgUrl = URL.createObjectURL(selectedFile);
      setFilePreview(ImgUrl);
      onFileChange(selectedFile);
    }
  };
  return (
    <div>
      <div>
        <label className="block text-gray-400">Your Profile</label>
        <input
          className="w-full p-2 rounded-2xl bg-gray-800 text-white outline-none border border-black focus:border-purple-300 transition-all duration-300"
          type="file"
          name="image"
          accept="image/*png,image/jpeg,image/jpg"
          onChange={handleFileChange}
        />
      </div>
    {
      filePreview && (
        <div className="w-[100px] h-[100px] relative overflow-hidden p-2 mt-2 mx-auto rounded-full">
          <Image 
          src={filePreview}
          alt="Profile"
          fill
          className="object-cover"
          />
        </div>
      )
    }
    </div>
  );
};

export default InputImage;
