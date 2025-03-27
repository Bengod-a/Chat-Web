import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import prisma from "../../../../../DB/prisma";
import { uploadFileMessage } from "../../../../../DB/uploadFileMessage";

export async function POST(request: NextRequest, context: any) {
  try {
    const { params } = context;
    const session = await getServerSession(authOptions);
    if (!session?.user.id) {
      return NextResponse.json(
        { message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const senderId = Number(session.user.id);
    const formData = await request.formData();
    const content = formData.get("content")?.toString() || null;
    const groupIdInput = params.id;
    const file = formData.get("file") as File | null;

    const groupId = Number(groupIdInput);
    if (isNaN(groupId)) {
      return NextResponse.json(
        { status: 400 }
      );
    }

    const groupExists = await prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!groupExists) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    let fileUrl: string | null = null;
    if (file) {
      fileUrl = await uploadFileMessage(file);
      if (!fileUrl) {
        return NextResponse.json(
          { message: "Failed to upload file" },
          { status: 500 }
        );
      }
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId: null,
        groupId,
        file: fileUrl,
        createdAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Message sent success",
        data: {
          id: message.id,
          senderId: message.senderId,
          receiverId: message.receiverId,
          groupId: message.groupId,
          content: message.content,
          file: message.file,
          createdAt: message.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
  }
}
