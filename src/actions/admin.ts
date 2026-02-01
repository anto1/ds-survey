"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return password === process.env.ADMIN_PASSWORD;
}

export async function approveChannel(channelId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.channel.update({
      where: { id: channelId },
      data: { status: "approved" },
    });

    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error approving channel:", error);
    return { success: false, error: "Ошибка при одобрении канала" };
  }
}

export async function rejectChannel(channelId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.channel.delete({
      where: { id: channelId },
    });

    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Error rejecting channel:", error);
    return { success: false, error: "Ошибка при удалении канала" };
  }
}
