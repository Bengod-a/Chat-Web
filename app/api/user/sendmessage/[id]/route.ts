import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import prisma from "../../../../../DB/prisma";
import { uploadFileMessage } from "../../../../../DB/uploadFileMessage";

interface MessageResponse {
  message: string;
  data?: {
    id: number;
    senderId: number;
    receiverId: number;
    content?: string | null;
    file?: string | null;
    createdAt: Date;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<MessageResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const senderId = Number(session.user.id);
    const formData = await request.formData();
    const content = formData.get("content")?.toString() || null;
    const receiverId = Number(formData.get("recipientId"));
    const file = formData.get("file") as File | null;

    if (isNaN(receiverId)) {
      return NextResponse.json({ message: "Invalid receiver ID" }, { status: 400 });
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    

    if (!receiver) {
      return NextResponse.json({ message: "Receiver not found" }, { status: 404 });
    }

    let fileUrl: string | null = null;
    if (file) {
      fileUrl = await uploadFileMessage(file); 
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        file: fileUrl,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Message sent successfully",
      data: {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId || 0,
        content: message.content,
        file: message.file,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    console.error("Message sending error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};