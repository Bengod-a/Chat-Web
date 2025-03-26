// import { createClient } from "@supabase/supabase-js";


// const bucketname = "filemessage"

// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_KEY!,)

// export async function uploadFileMessage(imag:File) {
//     const TimerStame = Date.now()
//     const name = `filemessage-${TimerStame}-${imag.name}`

//     const { data, error } = await supabase.storage.from(bucketname).upload(name, imag)
//     return supabase.storage.from(bucketname).getPublicUrl(name).data.publicUrl
// }

import { createClient } from "@supabase/supabase-js";

const bucketName = "filemessage";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function uploadFileMessage(image: File): Promise<string> {
  const timestamp = Date.now();
  const fileName = `filemessage-${timestamp}-${image.name}`;

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, image, {
        cacheControl: "3600", 
        upsert: false, 
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    if (!data) {
      throw new Error("No data returned from upload");
    }

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      throw new Error("Failed to generate public URL");
    }

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error in uploadFileMessage:", error);
    throw error; 
  }
}