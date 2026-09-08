import { useRef, useState, useEffect, useMemo, useLayoutEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/** Fade-and-slide entrance, played once when the element scrolls into view. */
export function FadeIn({
  children,
  as = "div",
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  className,
  style,
}) {
  const MotionTag = useMemo(
    () =>
      typeof motion[as] !== "undefined"
        ? motion[as]
        : motion.create
        ? motion.create(as)
        : motion.div,
    [as]
  );

  return (
    <MotionTag
      className={className}
      style={style}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Scales a single line of text so it spans its container exactly.
 *
 * The hero heading used to use a fixed vw font size, which only fitted the
 * one name it was designed around. This measures the rendered text instead,
 * so any heading fills the width without overflowing or leaving a gap.
 *
 * Returns [headingRef, textRef] — put the first on the block element and the
 * second on an inline span wrapping the text.
 */
export function useFitText(text) {
  const headingRef = useRef(null);
  const textRef = useRef(null);

  useLayoutEffect(() => {
    const heading = headingRef.current;
    const span = textRef.current;
    if (!heading || !span) return;

    const fit = () => {
      const available = heading.clientWidth;
      if (!available) return;

      // Measure at a known size, then scale by the ratio. One reflow, no loop.
      const PROBE = 100;
      heading.style.fontSize = `${PROBE}px`;
      const width = span.getBoundingClientRect().width;
      if (!width) return;

            // 1 = full width. Lower it to shrink the heading.
      const FILL = 0.85;
      heading.style.fontSize = `${(available / width) * PROBE * FILL}px`;
    };

    fit();

    const observer = new ResizeObserver(fit);
    observer.observe(heading);

    // Kanit loads asynchronously; the first measurement uses fallback metrics.
    if (document.fonts?.ready) document.fonts.ready.then(fit);

    return () => observer.disconnect();
  }, [text]);

  return [headingRef, textRef];
}

/** Pulls its child toward the cursor or finger while it's nearby. */
export function Magnet({
  children,
  padding = 150,
  strength = 3,
  activeTransition = "transform 0.3s ease-out",
  inactiveTransition = "transform 0.6s ease-in-out",
  className,
  style,
}) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Disabled only for people who've asked for reduced motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const apply = (clientX, clientY) => {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const dx = clientX - (rect.left + rect.width / 2);
      const dy = clientY - (rect.top + rect.height / 2);

      const near =
        Math.abs(dx) < rect.width / 2 + padding &&
        Math.abs(dy) < rect.height / 2 + padding;

      setActive(near);
      setOffset(near ? { x: dx / strength, y: dy / strength } : { x: 0, y: 0 });
    };

    const handleMouse = (e) => apply(e.clientX, e.clientY);

    const handleTouch = (e) => {
      const touch = e.touches[0];
      if (touch) apply(touch.clientX, touch.clientY);
    };

    // Spring back when the finger lifts, since there's no "cursor moved away".
    const handleEnd = () => {
      setActive(false);
      setOffset({ x: 0, y: 0 });
    };

    window.addEventListener("mousemove", handleMouse, { passive: true });
    window.addEventListener("touchstart", handleTouch, { passive: true });
    window.addEventListener("touchmove", handleTouch, { passive: true });
    window.addEventListener("touchend", handleEnd, { passive: true });
    window.addEventListener("touchcancel", handleEnd, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("touchstart", handleTouch);
      window.removeEventListener("touchmove", handleTouch);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
    };
  }, [padding, strength]);

  return (
    <div ref={ref} className={className} style={style}>
      <div
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          transition: active ? activeTransition : inactiveTransition,
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function AnimatedChar({ char, progress, range }) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ opacity: 0.2 }}>{char}</span>
      <motion.span
        aria-hidden="true"
        style={{ position: "absolute", left: 0, top: 0, opacity }}
      >
        {char}
      </motion.span>
    </span>
  );
}

/** Reveals text one character at a time as the block scrolls through. */
export function AnimatedText({ text = "", className, style }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.2"],
  });

  const total = Math.max(text.length, 1);
  let index = -1;
  const words = text.split(" ");

  return (
    <p ref={ref} className={className} style={style}>
      {words.map((word, wi) => {
        const chars = word.split("").map((char) => {
          index += 1;
          return { char, start: index / total, end: (index + 1) / total, key: index };
        });
        index += 1; // the space between words
        return (
          <span key={wi}>
            <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
              {chars.map((c) => (
                <AnimatedChar
                  key={c.key}
                  char={c.char}
                  progress={scrollYProgress}
                  range={[c.start, c.end]}
                />
              ))}
            </span>
            {wi < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </p>
  );
}

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="270">
      <rect width="420" height="270" fill="#1c1a22"/>
      <circle cx="210" cy="135" r="46" fill="none" stroke="#4a4553" stroke-width="2"/>
      <path d="M190 148l16-20 12 15 9-10 13 15z" fill="#4a4553"/>
    </svg>`
  );

/** Falls back to an inline placeholder when a remote image can't load. */
export function Img({ src, alt = "", ...rest }) {
  const handleError = (e) => {
    if (e.currentTarget.dataset.failed) return;
    e.currentTarget.dataset.failed = "true";
    e.currentTarget.classList.add("jc-img-failed");
    e.currentTarget.src = PLACEHOLDER;
  };
  return <img src={src || PLACEHOLDER} alt={alt} onError={handleError} {...rest} />;
}

export function ContactButton({ label = "Contact Me", href = "#contact" }) {
  return (
    <a className="jc-contact-btn" href={href}>
      {label}
    </a>
  );
}

export function LiveProjectButton({ href }) {
  if (!href) {
    return (
      <button type="button" className="jc-live-btn">
        Live Project
      </button>
    );
  }
  return (
    <a className="jc-live-btn" href={href} target="_blank" rel="noreferrer">
      Live Project
    </a>
  );
}