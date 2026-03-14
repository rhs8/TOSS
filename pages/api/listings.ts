import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { getDemoUser } from "@/lib/demo-auth";
import { addCommitmentMonths } from "@/lib/rules";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const user = await getDemoUser();
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    const existingListings = await prisma.listing.count({ where: { ownerId: user.id } });
    let commitmentEnd = user.commitmentEnd;
    if (existingListings === 0) {
      commitmentEnd = addCommitmentMonths(new Date(), 6);
      await prisma.user.update({
        where: { id: user.id },
        data: { commitmentEnd },
      });
    }
    const listing = await prisma.listing.create({
      data: {
        title,
        description: body.description?.trim() || null,
        category: body.category?.trim() || null,
        ownerId: user.id,
      },
    });
    return res.status(200).json(listing);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to create listing" });
  }
}
