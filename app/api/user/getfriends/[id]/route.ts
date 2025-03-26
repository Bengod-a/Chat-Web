import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../DB/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: parseInt(id) }, { user2Id: parseInt(id) }],
        status: {
          in: ["ACCEPTED", "BLOCKED", 'PENDING'],
        },
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            status: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            status: true,
          },
        },
      },
    });

    // สร้าง array ของเพื่อน พร้อมระบุว่าเป็นคำขอที่ส่งมาหรือส่งไป
    const friends = friendships
      .map((f) => {
        const isRequestor = f.user1Id === parseInt(id); // ถ้า user1Id == id แปลว่าเป็นคนส่งคำขอ
        const friend = isRequestor ? f.user2 : f.user1; // ถ้าเป็นคนส่งคำขอ ให้เลือก user2 (ผู้รับ), ถ้าไม่ใช่ให้เลือก user1 (ผู้ส่งคำขอ)
        return {
          ...friend,
          friendshipStatus: f.status,
          friendshipId: f.id, // เพิ่ม friendshipId เพื่อใช้ในการยอมรับคำขอ
          isRequestor, // ระบุว่าเป็นผู้ส่งคำขอหรือไม่ (true = ส่งไป, false = รับมา)
        };
      })
      .filter((friend) => friend !== null);

    return NextResponse.json(friends.length > 0 ? friends : [], {
      status: 200,
    });
  } catch (error) {
    console.error("Error in GET /api/user/getcontact/[id]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
