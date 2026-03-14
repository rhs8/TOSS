/**
 * Hackathon demo: use a single demo user for all actions.
 * Replace with real auth (NextAuth, Clerk, etc.) for production.
 */
export const DEMO_USER_ID = "demo-user-1";

export async function getDemoUser() {
  const { prisma } = await import("@/lib/db");
  let user = await prisma.user.findUnique({ where: { id: DEMO_USER_ID } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: DEMO_USER_ID,
        email: "demo@toss.local",
        name: "Demo User",
        commitmentEnd: new Date(0), // not yet committed
        cardOnFile: false,
      },
    });
  }
  return user;
}
