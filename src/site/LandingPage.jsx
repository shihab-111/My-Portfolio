import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { api } from "../api.js";
import {
  FadeIn,
  Magnet,
  AnimatedText,
  Img,
  ContactButton,
  LiveProjectButton,
} from "./components.jsx";

/* ------------------------------ sections ------------------------------ */

function HeroSection({ nav, hero }) {
  return (
    <section className="jc-hero">
      <FadeIn as="nav" className="jc-nav" delay={0} y={-20}>
        {nav.map((link) => (
          <a key={link._id || link.label} href={link.href || "#"}>
            {link.label}
          </a>
        ))}
      </FadeIn>

      <div style={{ overflow: "hidden" }}>
        <FadeIn as="h1" className="jc-hero-title hero-heading" delay={0.15} y={40}>
          {hero.heading}
        </FadeIn>
      </div>

      <div className="jc-hero-bottom">
        <FadeIn as="p" className="jc-hero-copy" delay={0.35} y={20}>
          {hero.tagline}
        </FadeIn>
        <FadeIn delay={0.5} y={20}>
          <ContactButton label={hero.ctaLabel} href={hero.ctaHref} />
        </FadeIn>
      </div>

      {hero.portraitUrl ? (
        <FadeIn className="jc-portrait-wrap" delay={0.6} y={30}>
          <div className="jc-portrait-inner">
            <Magnet padding={150} strength={3}>
              <Img src={hero.portraitUrl} alt="" />
            </Magnet>
          </div>
        </FadeIn>
      ) : null}
    </section>
  );
}

function MarqueeSection({ marquee }) {
  const sectionRef = useRef(null);
  const [offset, setOffset] = useState(0);

  const speed = marquee.speed ?? 0.3;

  useEffect(() => {
    const onScroll = () => {
      const node = sectionRef.current;
      if (!node) return;
      setOffset((window.scrollY - node.offsetTop + window.innerHeight) * speed);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  const images = marquee.images || [];
  if (!images.length) return null;

  const split = Math.min(marquee.rowSplit ?? 11, images.length);
  const rowOne = images.slice(0, split);
  const rowTwo = images.slice(split);
  const triple = (arr) => [...arr, ...arr, ...arr];

  return (
    <section ref={sectionRef} className="jc-marquee">
      <div className="jc-marquee-rows">
        <div
          className="jc-marquee-row"
          style={{ transform: `translateX(${offset - 200}px)` }}
        >
          {triple(rowOne).map((src, i) => (
            <Img key={`a-${i}`} src={src} alt="" loading="lazy" />
          ))}
        </div>
        {rowTwo.length ? (
          <div
            className="jc-marquee-row"
            style={{ transform: `translateX(${-(offset - 200)}px)` }}
          >
            {triple(rowTwo).map((src, i) => (
              <Img key={`b-${i}`} src={src} alt="" loading="lazy" />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

const DECOR_MOTION = {
  topLeft: { delay: 0.1, x: -80 },
  bottomLeft: { delay: 0.25, x: -80 },
  topRight: { delay: 0.15, x: 80 },
  bottomRight: { delay: 0.3, x: 80 },
};

function AboutSection({ about }) {
  return (
    <section id="about" className="jc-about">
      {(about.decor || [])
        .filter((d) => d.url)
        .map((d) => {
          const motionProps = DECOR_MOTION[d.slot] || { delay: 0.1, x: -80 };
          return (
            <FadeIn
              key={d._id || d.slot}
              className={`jc-about-deco jc-deco-${d.slot}`}
              delay={motionProps.delay}
              x={motionProps.x}
              y={0}
              duration={0.9}
            >
              <Img src={d.url} alt={d.alt || ""} />
            </FadeIn>
          );
        })}

      <div className="jc-about-stack">
        <FadeIn as="h2" className="jc-section-title hero-heading" delay={0} y={40}>
          {about.heading}
        </FadeIn>
        <AnimatedText text={about.body || ""} className="jc-about-copy" />
      </div>

      <FadeIn className="jc-about-button" delay={0.2} y={20}>
        <ContactButton label={about.ctaLabel} />
      </FadeIn>
    </section>
  );
}

function ServicesSection({ services }) {
  return (
    <section id="price" className="jc-services">
      <FadeIn as="h2" className="jc-section-title jc-services-title" delay={0} y={40}>
        {services.heading}
      </FadeIn>
      <div className="jc-services-list">
        {(services.items || []).map((service, i) => (
          <FadeIn key={service._id || i} className="jc-service" delay={i * 0.1}>
            <span className="jc-service-num">{service.number}</span>
            <div className="jc-service-body">
              <h3 className="jc-service-name">{service.name}</h3>
              <p className="jc-service-desc">{service.description}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project, index, total, progress }) {
  const targetScale = 1 - (total - 1 - index) * 0.03;
  const scale = useTransform(progress, [index / total, 1], [1, targetScale]);

  return (
    <div className="jc-project-slot">
      <motion.div
        className="jc-card"
        style={{ scale, "--stack-offset": `${index * 28}px` }}
      >
        <div className="jc-card-top">
          <div className="jc-card-meta">
            <span className="jc-card-num">{project.number}</span>
            <div>
              <div className="jc-card-label">{project.category}</div>
              <h3 className="jc-card-name">{project.name}</h3>
            </div>
          </div>
          <LiveProjectButton href={project.liveUrl} />
        </div>

        <div className="jc-card-grid">
          <div className="jc-card-col1">
            <Img src={project.col1?.[0]} alt="" loading="lazy" />
            <Img src={project.col1?.[1]} alt="" loading="lazy" />
          </div>
          <div className="jc-card-col2">
            <Img src={project.col2} alt="" loading="lazy" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ProjectsSection({ projects }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const items = projects.items || [];

  return (
    <section id="projects" ref={ref} className="jc-projects">
      <FadeIn as="h2" className="jc-section-title hero-heading" delay={0} y={40}>
        {projects.heading}
      </FadeIn>
      {items.map((project, i) => (
        <ProjectCard
          key={project._id || i}
          project={project}
          index={i}
          total={items.length}
          progress={scrollYProgress}
        />
      ))}
    </section>
  );
}

/* -------------------------------- page -------------------------------- */

export default function LandingPage() {
  const [site, setSite] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getSite().then(setSite).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (site?.meta?.pageTitle) document.title = site.meta.pageTitle;
  }, [site]);

  if (error) {
    return (
      <div className="jc-status">
        <strong>The site content didn't load.</strong>
        <span>{error}</span>
      </div>
    );
  }

  if (!site) {
    return <div className="jc-status">Loading…</div>;
  }

  const theme = site.theme || {};
  const cssVars = {
    "--bg": theme.background,
    "--text": theme.textColor,
    "--surface": theme.surface,
    "--grad-from": theme.gradientFrom,
    "--grad-to": theme.gradientTo,
  };

  return (
    <main className="jc-root" style={cssVars}>
      <HeroSection nav={site.nav || []} hero={site.hero || {}} />
      <MarqueeSection marquee={site.marquee || {}} />
      <AboutSection about={site.about || {}} />
      <ServicesSection services={site.services || {}} />
      <ProjectsSection projects={site.projects || {}} />
    </main>
  );
}
