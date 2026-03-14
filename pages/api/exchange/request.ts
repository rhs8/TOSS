import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { getDemoUser } from "@/lib/demo-auth";
import { getWeekStart, isWithinCommitment } from "@/lib/rules";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const user = await getDemoUser();
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const listingId = body?.listingId;
    if (!listingId) {
      return res.status(400).json({ error: "Listing ID required" });
    }
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { owner: true },
    });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (!listing.isActive) return res.status(400).json({ error: "Item is not available" });
    if (listing.ownerId === user.id) return res.status(400).json({ error: "You can't request your own item" });
    const myListings = await prisma.listing.count({ where: { ownerId: user.id } });
    if (myListings === 0) {
      return res.status(403).json({
        error: "List an item first. You can't receive until you've put something up.",
      });
    }
    if (!isWithinCommitment(user.commitmentEnd)) {
      return res.status(403).json({
        error: "Your commitment period has ended. Contact support to renew.",
      });
    }
    const weekStart = getWeekStart(new Date());
    const thisWeekExchange = await prisma.exchange.findFirst({
      where: { receiverId: user.id, weekStart, status: "active" },
    });
    if (thisWeekExchange) {
      return res.status(403).json({
        error: "You already have an active exchange this week. One per week.",
      });
    }
    await prisma.exchange.create({
      data: {
        listingId: listing.id,
        receiverId: user.id,
        lenderId: listing.ownerId,
        weekStart,
        status: "active",
      },
    });
    await prisma.listing.update({
      where: { id: listing.id },
      data: { isActive: false },
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to request" });
  }
}
