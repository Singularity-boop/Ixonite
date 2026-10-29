"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// One motion grammar for the file: tape seals, markers are set down,
// log entries are typed, stamps land. Content is visible without JS and
// with reduced motion; GSAP only animates *from* a hidden state.
export default function Motion({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Tamper tape runs across the sheet, then keeps scrolling slowly.
        gsap.utils.toArray<HTMLElement>("[data-tape]").forEach((tape) => {
          const track = tape.querySelector<HTMLElement>(".tape-inner");
          gsap.from(tape, {
            clipPath: "inset(0 100% 0 0)",
            duration: 1.1,
            ease: "expo.out",
            delay: tape.dataset.tape === "hero" ? 0.35 : 0,
            scrollTrigger: tape.dataset.tape === "hero" ? undefined : { trigger: tape, start: "top 90%" },
          });
          if (track) {
            gsap.to(track, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
          }
        });

        // Hero: the fields fill in like a form being completed.
        gsap.from("[data-fill]", {
          opacity: 0,
          y: 14,
          duration: 0.8,
          ease: "expo.out",
          stagger: 0.07,
        });

        // Exhibit markers are set down and settle.
        gsap.utils.toArray<HTMLElement>("[data-marker]").forEach((m, i) => {
          gsap.from(m, {
            y: -46,
            rotate: i % 2 ? 14 : -12,
            opacity: 0,
            duration: 0.9,
            ease: "back.out(2.2)",
            scrollTrigger: { trigger: m, start: "top 88%" },
          });
        });

        // Custody log: each entry is typed in, row by row.
        const rows = gsap.utils.toArray<HTMLElement>("[data-log-row]");
        if (rows.length) {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: rows[0].closest("table"), start: "top 75%" },
          });
          rows.forEach((row) => {
            const cells = row.querySelectorAll<HTMLElement>("[data-type]");
            const seal = row.querySelector<HTMLElement>("[data-seal]");
            cells.forEach((cell) => {
              const chars = Math.max(6, (cell.textContent ?? "").length);
              tl.from(
                cell,
                {
                  clipPath: "inset(0 100% 0 0)",
                  duration: Math.min(0.9, chars * 0.012),
                  ease: `steps(${Math.min(chars, 40)})`,
                },
                "<0.08",
              );
            });
            if (seal) tl.from(seal, { scale: 2.2, opacity: 0, rotate: -30, duration: 0.35, ease: "power4.in" }, ">-0.05");
          });
        }

        // Stamps land with a thud.
        gsap.utils.toArray<HTMLElement>("[data-stamp]").forEach((s) => {
          gsap.from(s, {
            scale: 1.9,
            opacity: 0,
            rotate: "-=14",
            duration: 0.45,
            ease: "power4.in",
            scrollTrigger: { trigger: s, start: "top 85%" },
          });
        });

        // The evidence bag drops in and its seal runs across.
        gsap.utils.toArray<HTMLElement>("[data-bag]").forEach((bag) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: bag, start: "top 80%" } });
          tl.from(bag, { y: 60, rotate: 4, opacity: 0, duration: 1, ease: "expo.out" }).from(
            bag.querySelector(".bag-seal"),
            { clipPath: "inset(0 100% 0 0)", duration: 0.7, ease: "expo.out" },
            "-=0.4",
          );
        });

        // Badges are clipped on one at a time.
        if (!document.querySelector("[data-badge]")) return;
        gsap.from("[data-badge]", {
          y: 40,
          rotate: (i: number) => (i % 2 ? 3 : -3),
          opacity: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: { trigger: "[data-badge]", start: "top 85%" },
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  return <div ref={scope}>{children}</div>;
}
