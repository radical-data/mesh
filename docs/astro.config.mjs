// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Mesh Docs",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/radical-data/mesh",
        },
      ],
      sidebar: [
        { label: "Getting Started", slug: "getting-started" },
        {
          label: "Understand",
          autogenerate: { directory: "understand" },
        },
      ],
    }),
  ],
});
