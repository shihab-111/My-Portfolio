import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./db.js";
import Site from "./models/Site.js";
import User from "./models/User.js";

const FIGMA =
  "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/";

const MARQUEE = [
  "hero-space-voyage-preview-eECLH3Yc",
  "hero-codenest-preview-Cgppc2qV",
  "hero-vex-ventures-preview-BczMFIiw",
  "hero-stellar-ai-v2-preview-DjvxjG3C",
  "hero-asme-preview-B_nGDnTP",
  "hero-transform-data-preview-Cx5OU29N",
  "hero-vitara-preview-Cjz2QYyU",
  "hero-terra-preview-BFjrCr7T",
  "hero-skyelite-preview-DHaZIgUv",
  "hero-aethera-preview-DknSlcTa",
  "hero-designpro-preview-D8c5_een",
  "hero-stellar-ai-preview-D3HL6bw1",
  "hero-xportfolio-preview-D4A8maiC",
  "hero-orbit-web3-preview-BXt4OttD",
  "hero-nexora-preview-cx5HmUgo",
  "hero-evr-ventures-preview-DZxeVFEX",
  "hero-planet-orbit-preview-DWAP8Z1P",
  "hero-new-era-preview-CocuDUm9",
  "hero-wealth-preview-B70idl_u",
  "hero-luminex-preview-CxOP7ce6",
  "hero-celestia-preview-0yO3jXO8",
].map((slug) => `https://motionsites.ai/assets/${slug}.gif`);

const CF = (file) =>
  `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2F${file}&w=1280&q=85`;

const CONTENT = {
  key: "default",
  meta: {
    pageTitle: "Jack — 3D Creator",
    description:
      "Portfolio of Jack, a 3D creator working in modelling, rendering, motion and brand design.",
  },
  theme: {
    background: "#0C0C0C",
    textColor: "#D7E2EA",
    surface: "#FFFFFF",
    gradientFrom: "#646973",
    gradientTo: "#BBCCD7",
  },
  nav: [
    { label: "About", href: "#about" },
    { label: "Price", href: "#price" },
    { label: "Projects", href: "#projects" },
    { label: "Contact", href: "#contact" },
  ],
  hero: {
    heading: "Hi, i'm jack",
    tagline:
      "a 3d creator driven by crafting striking and unforgettable projects",
    portraitUrl:
      "https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png",
    ctaLabel: "Contact Me",
    ctaHref: "#contact",
  },
  marquee: { images: MARQUEE, rowSplit: 11, speed: 0.3 },
  about: {
    heading: "About me",
    body: "With more than five years of experience in design, i focus on branding, web design, and user experience, i truly enjoy working with businesses that aim to stand out and present their best image. Let's build something incredible together!",
    ctaLabel: "Contact Me",
    decor: [
      { slot: "topLeft", url: `${FIGMA}moon_icon.11395d36.png`, alt: "" },
      { slot: "bottomLeft", url: `${FIGMA}p59_1.4659672e.png`, alt: "" },
      { slot: "topRight", url: `${FIGMA}lego_icon-1.703bb594.png`, alt: "" },
      { slot: "bottomRight", url: `${FIGMA}Group_134-1.2e04f3ce.png`, alt: "" },
    ],
  },
  services: {
    heading: "Services",
    items: [
      {
        number: "01",
        name: "3D Modeling",
        description:
          "Creation of detailed objects, characters, or environments tailored to specific client needs, ideal for games, products, and visualizations.",
        order: 0,
      },
      {
        number: "02",
        name: "Rendering",
        description:
          "High-quality, photorealistic renders that showcase designs with custom lighting, textures, and materials to bring concepts to life.",
        order: 1,
      },
      {
        number: "03",
        name: "Motion Design",
        description:
          "Dynamic animations and motion graphics that add energy and storytelling to brands, products, and digital experiences.",
        order: 2,
      },
      {
        number: "04",
        name: "Branding",
        description:
          "Crafting cohesive visual identities — from logos to full brand systems — that communicate a clear and memorable presence.",
        order: 3,
      },
      {
        number: "05",
        name: "Web Design",
        description:
          "Designing clean, modern, and conversion-focused websites with attention to layout, typography, and user experience.",
        order: 4,
      },
    ],
  },
  projects: {
    heading: "Project",
    items: [
      {
        number: "01",
        category: "Client",
        name: "Nextlevel Studio",
        liveUrl: "",
        col1: [
          CF("hf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png"),
          CF("hf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png"),
        ],
        col2: CF("hf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png"),
        order: 0,
        published: true,
      },
      {
        number: "02",
        category: "Personal",
        name: "Aura Brand Identity",
        liveUrl: "",
        col1: [
          CF("hf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png"),
          CF("hf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png"),
        ],
        col2: CF("hf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png"),
        order: 1,
        published: true,
      },
      {
        number: "03",
        category: "Client",
        name: "Solaris Digital",
        liveUrl: "",
        col1: [
          CF("hf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png"),
          CF("hf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png"),
        ],
        col2: CF("hf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png"),
        order: 2,
        published: true,
      },
    ],
  },
};

async function run() {
  await connectDB();
  console.log("Connected to MongoDB");

  await Site.findOneAndUpdate({ key: "default" }, CONTENT, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
  console.log("Site content seeded");

  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!email || !password) {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user.");
  } else {
    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`Admin user already exists: ${email}`);
    } else {
      await User.create({
        email,
        passwordHash: await User.hashPassword(password),
        name: "Admin",
      });
      console.log(`Admin user created: ${email}`);
      console.log("Sign in, then change this password from the Account tab.");
    }
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
