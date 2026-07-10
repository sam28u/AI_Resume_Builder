import { verifyToken } from "@/lib/auth/jwt";

export async function authenticate(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  const payload = await verifyToken(token);

  if (!payload?.userId) {
    throw new Error("Unauthorized");
  }

  return payload;
}