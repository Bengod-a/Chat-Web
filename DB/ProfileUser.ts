import { createClient } from "@supabase/supabase-js";


const bucketname = "profileuser"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_KEY!,)

export async function uploadProfile(imag:File) {
    const TimerStame = Date.now()
    const name = `Profile-${TimerStame}-${imag.name}`

    const { data, error } = await supabase.storage.from(bucketname).upload(name, imag)
    return supabase.storage.from(bucketname).getPublicUrl(name).data.publicUrl
}