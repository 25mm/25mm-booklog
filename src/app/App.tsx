import { useState, useEffect, useRef, useCallback, type RefObject } from "react";
import { motion } from "motion/react";
import bookListData from "@/imports/book-list.json";
import bookReadIcon from "@/imports/book-read.gif";
import buttonMay from "@/imports/button-may.svg";

const coverImageModules = import.meta.glob<string>("@/imports/book-*.jpg", {
  eager: true,
  import: "default",
});

const coverImages: Record<number, string> = {};
for (const [path, url] of Object.entries(coverImageModules)) {
  const match = path.match(/book-(\d+)\.jpg$/);
  if (match) coverImages[Number(match[1])] = url;
}

const INFINITE_SCROLL_COPIES = 3;

const books = bookListData.map((b) => ({
  title: b.title,
  author: b.author,
  height: Math.round(Number(b.height) * 1.5),
  date: b.dateFinished
    ? new Date(b.dateFinished).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null,
  review: b.review || null,
  coverUrl: coverImages[b.id] ?? null,
}));

const maxBookHeight = Math.max(...books.map((b) => b.height));

// Tooltip height budget — must match pt-[Xpx] on the inner flex row below
const TOOLTIP_CLEARANCE = 220;

function BookCard({ title, author, height, shelfHeight, date, review, coverUrl, blurred, onEnter, onLeave }: { title: string; author: string; height: number; shelfHeight: number; date: string | null; review: string | null; coverUrl: string | null; blurred: boolean; onEnter: () => void; onLeave: () => void; }) {
  const [detailsVisible, setDetailsVisible] = useState(false);

  const showDetails = () => {
    setDetailsVisible(true);
    onEnter();
  };

  const hideDetails = () => {
    setDetailsVisible(false);
    onLeave();
  };

  const toggleDetails = () => {
    if (detailsVisible) {
      hideDetails();
    } else {
      showDetails();
    }
  };

  return (
    <div
      className={`flex flex-col gap-3 shrink-0 w-[120px] md:w-[204px] cursor-pointer outline-none transition-[filter] duration-200 focus-visible:ring-1 focus-visible:ring-black/50 ${blurred ? "blur-[3px]" : "blur-0"}`}
      role="button"
      tabIndex={0}
      aria-label={`Show details for ${title} by ${author}`}
      aria-expanded={detailsVisible}
      onMouseEnter={showDetails}
      onMouseLeave={hideDetails}
      onFocus={showDetails}
      onBlur={hideDetails}
      onClick={toggleDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleDetails();
        }
      }}
    >
      {/* Fixed-height shelf container — images sit at the bottom so baselines align */}
      <div className="flex flex-col justify-end" style={{ height: `${shelfHeight}px` }}>
        {/* Relative wrapper so tooltip is positioned above the image, not the container */}
        <div className="relative">
          {detailsVisible && (
            <div role="tooltip" className="absolute bottom-full left-0 mb-3 z-10 w-[200px] -translate-y-[10px]">
              {review && <p className="font-['EB_Garamond',serif] text-[15px] text-black leading-[1.2]">{review}</p>}
              {date && (
                <div className="flex items-center gap-[3px] mt-2">
                  <img src={bookReadIcon} alt="completed" className="h-[24px] w-auto" />
                  <p className="font-['EB_Garamond',serif] text-[11px] font-medium tracking-[0.04em] uppercase text-black/50">{date}</p>
                </div>
              )}
            </div>
          )}
          {coverUrl ? (
            <motion.img
              src={coverUrl}
              alt={title}
              className="w-full h-auto rounded-[4px]"
              animate={{
                y: detailsVisible ? -10 : 0,
                filter: detailsVisible ? "drop-shadow(0 10px 8px rgba(0,0,0,0.3))" : "drop-shadow(0 0px 0px rgba(0,0,0,0))",
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 28,
                mass: 0.8,
              }}
            />
          ) : (
            <motion.div
              aria-label={title}
              className="w-full rounded-[4px] bg-black/10"
              style={{ height: `${height}px` }}
              animate={{
                y: detailsVisible ? -10 : 0,
                boxShadow: detailsVisible ? "0 10px 8px rgba(0,0,0,0.3)" : "0 0px 0px rgba(0,0,0,0)",
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 28,
                mass: 0.8,
              }}
            />
          )}
        </div>
      </div>

      {/* Book metadata below cover */}
      <div className="flex flex-col gap-1 font-['EB_Garamond',serif] text-[12px] text-black leading-normal">
        <div className="flex flex-col gap-0">
          <p className="font-normal text-[15px] leading-[1.2]">{title}</p>
          <p className="italic font-normal text-[15px] leading-[1.2]">{author}</p>
        </div>
      </div>
    </div>
  );
}

function BooklogTitle() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [tapped, setTapped] = useState(false);

  const tooltipText = "All the books I bought and did (or didn't) read in 2026.";
  const tooltipClass = "font-['EB_Garamond',serif] text-[15px] text-black w-[160px] leading-snug";

  return (
    <span
      className="relative cursor-default text-[20px] text-black"
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
      onMouseLeave={() => setPos(null)}
      onTouchStart={(e) => {
        e.preventDefault();
        setTapped((t) => !t);
      }}
    >
      <span className={`transition-[filter] duration-200 ${pos || tapped ? "blur-[3px]" : "blur-0"}`}>
        Booklog <span style={{ fontVariantCaps: "small-caps" }}>2026</span>
      </span>

      {/* Desktop: follows cursor */}
      {pos && (
        <span
          className={`fixed z-50 pointer-events-none hidden md:block ${tooltipClass}`}
          style={{ left: pos.x + 14, top: pos.y + 14 }}
        >
          {tooltipText}
        </span>
      )}

      {/* Mobile: appears below title on tap */}
      {tapped && (
        <span
          className={`absolute left-0 top-full mt-2 z-50 block md:hidden ${tooltipClass}`}
        >
          {tooltipText}
        </span>
      )}
    </span>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

function useVerticalWheelScroll(
  containerRef: RefObject<HTMLElement | null>,
  scrollRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    const containerEl = containerRef.current;
    const scrollEl = scrollRef.current;
    if (!containerEl || !scrollEl) return;

    const onWheel = (event: WheelEvent) => {
      const { deltaX, deltaY } = event;
      if (Math.abs(deltaX) > Math.abs(deltaY)) return;

      const delta = deltaY;
      if (delta === 0) return;

      event.preventDefault();
      scrollEl.scrollLeft += delta;
    };

    containerEl.addEventListener("wheel", onWheel, { passive: false });
    return () => containerEl.removeEventListener("wheel", onWheel);
  }, [containerRef, scrollRef]);
}

function useInfiniteHorizontalScroll(
  scrollRef: RefObject<HTMLDivElement | null>,
  segmentRef: RefObject<HTMLDivElement | null>,
) {
  const isAdjustingRef = useRef(false);

  const centerScroll = useCallback(() => {
    const scrollEl = scrollRef.current;
    const segmentEl = segmentRef.current;
    if (!scrollEl || !segmentEl) return;

    isAdjustingRef.current = true;
    scrollEl.scrollLeft = segmentEl.offsetLeft;
    requestAnimationFrame(() => {
      isAdjustingRef.current = false;
    });
  }, [scrollRef, segmentRef]);

  useEffect(() => {
    centerScroll();
    window.addEventListener("resize", centerScroll);
    return () => window.removeEventListener("resize", centerScroll);
  }, [centerScroll]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    const segmentEl = segmentRef.current;
    if (!scrollEl || !segmentEl) return;

    const onScroll = () => {
      if (isAdjustingRef.current) return;

      const segmentWidth = segmentEl.offsetWidth;
      if (segmentWidth <= 0) return;

      const segmentStart = segmentEl.offsetLeft;
      const segmentEnd = segmentStart + segmentWidth;

      if (scrollEl.scrollLeft < segmentStart - segmentWidth / 2) {
        isAdjustingRef.current = true;
        scrollEl.scrollLeft += segmentWidth;
        requestAnimationFrame(() => {
          isAdjustingRef.current = false;
        });
      } else if (scrollEl.scrollLeft > segmentEnd - segmentWidth / 2) {
        isAdjustingRef.current = true;
        scrollEl.scrollLeft -= segmentWidth;
        requestAnimationFrame(() => {
          isAdjustingRef.current = false;
        });
      }
    };

    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, [scrollRef, segmentRef]);
}

export default function App() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const segmentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const shelfHeight = isMobile ? Math.round(maxBookHeight * 0.59) : maxBookHeight;

  useVerticalWheelScroll(containerRef, scrollRef);
  useInfiniteHorizontalScroll(scrollRef, segmentRef);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full font-['EB_Garamond',serif] flex flex-col overflow-hidden"
      style={{ backgroundColor: "#E6E3DD" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 font-normal shrink-0">
        <BooklogTitle />
        <a
          href="https://www.maychiang.info"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-60 transition-opacity"
        >
          <img src={buttonMay} alt="made by may" className="h-[24px] w-auto" />
        </a>
      </div>

      {/* Spacer pushes scroll strip to bottom */}
      <div className="flex-1" />

      {/*
        Horizontal scroll container.
        overflow-x:auto forces overflow-y:auto per CSS spec, which would clip
        the tooltip that floats above the image. The fix: give the inner flex
        row padding-top equal to TOOLTIP_CLEARANCE so the tooltip renders
        *within* the container's content area rather than above it.
      */}
      <div ref={scrollRef} className="overflow-x-auto shrink-0 overscroll-x-contain">
        <div className="flex w-max pb-8" style={{ paddingTop: TOOLTIP_CLEARANCE }}>
          {Array.from({ length: INFINITE_SCROLL_COPIES }, (_, copyIndex) => (
            <div
              key={copyIndex}
              ref={copyIndex === 1 ? segmentRef : undefined}
              className="flex gap-[24px] items-start shrink-0 px-5"
            >
              {books.map((book, bookIndex) => (
                <BookCard
                  key={`${copyIndex}-${bookIndex}`}
                  {...book}
                  shelfHeight={shelfHeight}
                  blurred={hoveredIndex !== null && hoveredIndex !== bookIndex}
                  onEnter={() => setHoveredIndex(bookIndex)}
                  onLeave={() => setHoveredIndex(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
