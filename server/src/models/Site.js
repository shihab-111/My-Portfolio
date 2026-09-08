import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * The entire public site lives in ONE document (key: "default").
 * That keeps the public page a single query, and lets the admin add or
 * remove list items without any schema migration.
 */

const NavLinkSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    href: { type: String, default: "#", trim: true },
  },
  { _id: true }
);

const DecorSchema = new Schema(
  {
    slot: {
      type: String,
      enum: ["topLeft", "bottomLeft", "topRight", "bottomRight"],
      required: true,
    },
    url: { type: String, default: "", trim: true },
    alt: { type: String, default: "", trim: true },
  },
  { _id: true }
);

const ServiceSchema = new Schema(
  {
    number: { type: String, default: "", trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const ProjectSchema = new Schema(
  {
    number: { type: String, default: "", trim: true },
    category: { type: String, default: "", trim: true },
    name: { type: String, required: true, trim: true },
    liveUrl: { type: String, default: "", trim: true },
    // Two stacked images in the narrow left column
    col1: {
      type: [String],
      default: ["", ""],
      validate: {
        validator: (v) => v.length <= 2,
        message: "col1 holds at most 2 images",
      },
    },
    // One tall image in the wide right column
    col2: { type: String, default: "", trim: true },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { _id: true }
);

const SiteSchema = new Schema(
  {
    key: { type: String, default: "default", unique: true, index: true },

    meta: {
      pageTitle: { type: String, default: "Jack — 3D Creator" },
      description: { type: String, default: "" },
      favicon: { type: String, default: "" },
    },

    theme: {
      background: { type: String, default: "#0C0C0C" },
      textColor: { type: String, default: "#D7E2EA" },
      surface: { type: String, default: "#FFFFFF" },
      gradientFrom: { type: String, default: "#646973" },
      gradientTo: { type: String, default: "#BBCCD7" },
    },

    nav: { type: [NavLinkSchema], default: [] },

    hero: {
      heading: { type: String, default: "Hi, i'm jack" },
      tagline: { type: String, default: "" },
      portraitUrl: { type: String, default: "" },
      ctaLabel: { type: String, default: "Contact Me" },
      ctaHref: { type: String, default: "#contact" },
    },

    marquee: {
      images: { type: [String], default: [] },
      // How many of the images belong to the top row; the rest go to row two.
      rowSplit: { type: Number, default: 11, min: 0 },
      speed: { type: Number, default: 0.3 },
    },

    about: {
      heading: { type: String, default: "About me" },
      body: { type: String, default: "" },
      ctaLabel: { type: String, default: "Contact Me" },
      decor: { type: [DecorSchema], default: [] },
    },

    services: {
      heading: { type: String, default: "Services" },
      items: { type: [ServiceSchema], default: [] },
    },

    projects: {
      heading: { type: String, default: "Project" },
      items: { type: [ProjectSchema], default: [] },
    },
  },
  { timestamps: true, minimize: false }
);

/** Returns the singleton, creating it from defaults on first run. */
SiteSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ key: "default" });
  if (!doc) doc = await this.create({ key: "default" });
  return doc;
};

export default mongoose.model("Site", SiteSchema);
