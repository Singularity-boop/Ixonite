# Ixonite design system

The site is a chain-of-custody evidence file. A pentest is evidence work, so every surface is built from forms, exhibit tags, seals and typed log entries. Light paper ground: buyers read this at a desk, often next to a printed report.

## Color (roles are strict)

| Token | Value | Role |
|---|---|---|
| `--paper` | `#f2f3ef` | Page ground, form sheets |
| `--paper-2` | `#e8eae4` | Secondary form fields, table heads |
| `--rule` / `--rule-strong` | `#a9b6c4` / `#6f8196` | Form rules and field borders |
| `--ink` | `#121316` | Text, 2px sheet borders, the dark finding band |
| `--ink-2` | `#444a54` | Secondary text, field labels |
| `--marker` / `--marker-deep` | `#ffc20e` / `#e0a800` | **Only** exhibit markers and the primary action |
| `--seal` / `--seal-deep` | `#cf2a1f` / `#a51d14` | **Only** tamper tape, stamps, critical severity, form errors |
| `--kraft` / `--kraft-ink` | `#b98c5c` / `#2b1d0e` | **Only** the evidence-bag band that holds the sample report |

State is a mark, not a hue: seals, stamps ("Retested", "Received"), tape. Never signal state by color alone.

## Type

- Display: Big Shoulders 800–900, uppercase, line-height 0.88. Classes `.d-xl` (hero), `.d-lg` (section heads), `.d-md`.
- Body: Public Sans 17px / 1.55, measure ≤ 58ch for ledes.
- Typed: Courier Prime, for form entries, inputs, custody log, HTTP evidence. Data and entries only, never decoration.
- Field labels: Public Sans 700, 0.68–0.8rem, uppercase, tracking 0.06–0.08em. They sit inside fields, never as eyebrows above headings.

## Components

- `.sheet` + `.field`: 12-column form sheet, 2px ink outer border, 1px `--rule-strong` inner rules, `.field-cap` caption bottom-right.
- `.btn` (2px ink border, square corners), `.btn-primary` (marker yellow, soft drop shadow). Hover inverts to ink.
- `.input` / `.select` / `.textarea`: white, 2px ink border, square, typed face; focus = 4px marker ring; invalid = seal border plus `.err` text.
- `.marker`: yellow evidence tent (trapezoid), letters A–D identify exhibits.
- `.tape`: red tamper tape, dashed white edges, -1.4° in the hero, scrolling text.
- `.stamp`: seal-red bordered rubber stamp, rotated -9°, multiply blend.
- `.log`: custody table, collapses to stacked rows under 720px.
- `.badge`: team ID badge with lanyard slot, grayscale photo, LinkedIn link.

## Motion (GSAP, `app/components/Motion.tsx`)

One grammar: tape seals across (clip-path, expo.out), hero fields fill in, markers are set down (back.out), log entries type in (steps easing), stamps land (power4.in), evidence bag drops and seals. Everything is visible without JS and under `prefers-reduced-motion`.

## Layout

Max sheet width 1320px, gutter `clamp(16px, 4vw, 48px)`, sections `clamp(72px, 10vw, 140px)` vertical padding. Square corners everywhere.
