const isProductionBuild = process.env.NODE_ENV === "production";

export const showDemoData =
  !isProductionBuild &&
  process.env.NEXT_PUBLIC_ENABLE_DEMO_DATA !== "false" &&
  process.env.NEXT_PUBLIC_HIDE_SEEDED_ADMIN_DATA !== "true";

export function liveDataModeLabel() {
  return showDemoData ? "Working mode" : "Live mode";
}
