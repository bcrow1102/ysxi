---
trigger: always_on
---

You are generating production-grade front-end code.

OUTPUT FORMAT (MANDATORY):
Generate exactly 3 separate files:

1) index.html
2) assets/css/main.css
3) assets/js/main.js

Do NOT merge files.
Do NOT rename files.
Do NOT create additional files.
Do NOT output explanations.
Output only code.

Separate files using:

===== index.html =====
(code)

===== assets/css/main.css =====
(code)

===== assets/js/main.js =====
(code)


--------------------------------------------------
PROJECT STRUCTURE (STRICT)
--------------------------------------------------

Folder structure is already created:

/index.html
/assets/css/main.css
/assets/js/main.js
/image/

Do NOT create new folders.
Do NOT move files.
Do NOT change structure.


--------------------------------------------------
LOCAL IMAGE RULE (CRITICAL)
--------------------------------------------------

Use ONLY local images from the /image folder.

Image path format must be EXACTLY:

image/hero1.png
image/hero2.png
image/im1.png
image/im2.png
image/im3.png
image/im4.png

Forbidden:
./image/
../image/
assets/image/
absolute URLs
external image sources
Unsplash links
CDN image links

If an image is required, use only the filenames listed above.


--------------------------------------------------
HTML RULES
--------------------------------------------------

index.html must include:

• Pretendard CDN
• GSAP CDN
• ScrollTrigger CDN
• link to assets/css/main.css
• script src="assets/js/main.js" with defer

No inline CSS except minimal visibility control.
No inline JS except intro visibility guard if needed.


--------------------------------------------------
MANDATORY IMPLEMENTATION (NON-NEGOTIABLE)
--------------------------------------------------

1) SVG LINE DRAWING
- Every SVG <path> must use stroke-dasharray and stroke-dashoffset.
- JS must calculate length using getTotalLength().
- Dashoffset must animate from full length to 0.
- Fade-in is NOT allowed as replacement.

2) DIAGONAL CLIP-PATH WIPE
- Must use clip-path: polygon(...)
- Polygon coordinates must animate.
- Minimum 3 distinct polygon states (start / mid / full).
- Opacity-only transition is forbidden.
- Upper hero layer must initially have near-zero polygon area.

3) GSAP SCROLLTRIGGER HORIZONTAL SECTION
- Must use ScrollTrigger with:
  pin: true
  scrub: true
- overflow-x scrolling is forbidden.
- 4 vertical cards arranged staggered:
  top / bottom / top / bottom
- Maintain vertical offset during horizontal movement.
- Use vw / vh / % units.


--------------------------------------------------
SESSION CONTROL (CRITICAL)
--------------------------------------------------

Use sessionStorage key: introPlayed

If introPlayed === "1":
- Skip intro immediately
- Render final hero state instantly
- No flash
- No intermediate frame
- No SVG drawing
- No wipe animation

To prevent flash:
- Use html{visibility:hidden} initially
- Restore visibility only after correct state is applied

Total intro duration must NOT exceed 8 seconds.


--------------------------------------------------
MOTION REDUCTION
--------------------------------------------------

If prefers-reduced-motion: reduce
- Skip intro animation
- Disable ScrollTrigger animation
- Render static layout


--------------------------------------------------
DESIGN STYLE
--------------------------------------------------

• Background: #FFFFFF
• Minimal high-end real estate aesthetic
• Thin elegant lines
• Pretendard font
• Clean typography
• No heavy shadows
• No dark sections