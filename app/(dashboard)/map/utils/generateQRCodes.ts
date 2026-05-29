/**
 * Generates a deep-link URL for a QR code that points to a specific room
 * inside a building on the ENSIAS Hub map.
 *
 * Usage:
 *   generateRoomQRUrl("administration", "admin-directeur-office")
 *   // → "https://ensias-hub.vercel.app/map?entry=administration&room=admin-directeur-office"
 */
export function generateRoomQRUrl(
  buildingId: string,
  roomId: string,
  baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ensias-hub.vercel.app",
): string {
  const url = new URL(`${baseUrl}/map`);
  url.searchParams.set("entry", buildingId);
  url.searchParams.set("room", roomId);
  return url.toString();
}
