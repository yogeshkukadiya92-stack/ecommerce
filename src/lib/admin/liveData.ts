const hideSeededAdminData =
  process.env.NEXT_PUBLIC_HIDE_SEEDED_ADMIN_DATA === "true" ||
  process.env.NEXT_PUBLIC_DISABLE_ADMIN_SAMPLE_DATA === "true";

export const showDemoData = !hideSeededAdminData;

export function liveDataModeLabel() {
  return showDemoData ? "Working mode" : "Live mode";
}
