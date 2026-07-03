export const showDemoData = process.env.NEXT_PUBLIC_SHOW_DEMO_DATA === "true";

export function liveDataModeLabel() {
  return showDemoData ? "Demo data enabled" : "Live mode";
}
