import { defineConfig, passthroughImageService } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";

export default defineConfig({
  output: "server",
  adapter: vercel(),
  image: {
    service: passthroughImageService(),
  },
  integrations: [react(), tailwind({ applyBaseStyles: false })],
});
