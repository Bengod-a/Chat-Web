import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../DB/prisma";
import { authOptions } from "../../../../../../lib/auth";
import { getServerSession } from "next-auth";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ friendshipId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const params = await context.params;
    const { friendshipId } = params;
    const friendshipIdNum = parseInt(friendshipId, 10);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isNaN(friendshipIdNum)) {
      return NextResponse.json({ error: "Invalid friendship ID" }, { status: 400 });
    }

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipIdNum },
    });

    if (!friendship) {
      return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
    }

    if (friendship.user1Id !== session.user.id && friendship.user2Id !== session.user.id) {
      return NextResponse.json({ error: "You are not part of this friendship" }, { status: 403 });
    }

    if (friendship.status === "ACCEPTED") {
      return NextResponse.json({ error: "Already ACCEPTED" }, { status: 400 });
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipIdNum },
      data: {
        status: "ACCEPTED",
        blockedById: session.user.id,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ data: updatedFriendship }, { status: 200 });
  } catch (error) {
    console.error( error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}