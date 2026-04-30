import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MERKAMAX",
    short_name: "MERKAMAX",
    description: "Supermercado y logística MERKAMAX",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#FFD700",
    orientation: "portrait-primary",
    lang: "es",
    categories: ["shopping", "food"]
  };
}
