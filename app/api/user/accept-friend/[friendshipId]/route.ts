import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../DB/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ friendshipId: string }> }
) {
  try {
    const params = await context.params;
    const { friendshipId } = params;

    if (!friendshipId) {
      return NextResponse.json(
        { error: "Friendship ID is required" },
        { status: 400 }
      );
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: parseInt(friendshipId) },
      data: { status: "ACCEPTED" },
    });

    return NextResponse.json(
      { message: "ยอมรับคำขอแล้ว", friendship: updatedFriendship },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /api/user/accept-friend/[friendshipId]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}