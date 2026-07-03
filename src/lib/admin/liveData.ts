export const showDemoData = process.env.NEXT_PUBLIC_HIDE_SEEDED_ADMIN_DATA !== "true";

export function liveDataModeLabel() {
  return showDemoData ? "Working mode" : "Live mode";
}
