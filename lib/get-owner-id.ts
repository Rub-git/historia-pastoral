import { prisma } from '@/lib/db';

/**
 * Gets the owner's userId for data access.
 * If the user is a team member, returns the teamOwnerId.
 * If the user is the owner, returns their own id.
 */
export async function getOwnerUserId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, teamOwnerId: true },
  });

  if (!user) {
    return userId;
  }

  // If user is part of a team, use the owner's id
  if (user.teamOwnerId) {
    return user.teamOwnerId;
  }

  // Otherwise, use their own id
  return userId;
}
