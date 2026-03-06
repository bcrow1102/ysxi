/* ============================================================
   Xi YS — Premium Residences | main.js
   ============================================================
   Timeline (every load — deterministic, no sessionStorage):
   0.0s  → html visibility restored SYNCHRONOUSLY
           body.intro-playing NOT set yet (overlay hidden by CSS)
   0.0s  → 5s hard fail-safe armed
   0.3s  → GSAP starts; body.intro-playing added; overlay fades in
           Diagonal-cross panels begin (~1.55s total)
   1.9s  → Hero wipe + logo reveal
   ~3.1s → body.intro-playing removed; overlay DOM removed
   ============================================================ */
ScrollTrigger.config({
    ignoreMobileResize: true
});

console.log('[HS] main.js loaded', location.href);
(function () {
    'use strict';

    gsap.registerPlugin(ScrollTrigger);

    var reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    var hsST = null;  /* horizontal-scroll ScrollTrigger handle */

    /* ── SYNCHRONOUS: restore visibility immediately on every load.
       html{visibility:hidden} in <head> prevents FOUC;
       we release it here before any async work. ── */
    document.documentElement.style.visibility = 'visible';

    /* ── helpers ── */
    function qs(s) { return document.querySelector(s); }
    function qsa(s) { return document.querySelectorAll(s); }

    /* Remove overlay element and body class cleanly. */
    function teardownOverlay() {
        document.body.classList.remove('intro-playing');
        var ol = document.getElementById('intro-overlay');
        if (ol) {
            ol.style.transition = 'opacity 0.35s ease';
            ol.style.opacity = '0';
            ol.style.pointerEvents = 'none';
            setTimeout(function () { if (ol && ol.parentNode) ol.remove(); }, 400);
        }
    }

    /* Reveal hero letters instantly (reduced-motion / fail-safe path) */
    function revealHeroInstant() {
        qsa('.hero-char').forEach(function (el) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
        var sub = qs('#hero-sub');
        var btns = qs('#hero-btns');
        if (sub) sub.style.opacity = '1';
        if (btns) btns.style.opacity = '1';
    }

    /* Expand hero instantly and clean up overlay (skip / fail-safe path) */
    function finalHeroInstant() {
        teardownOverlay();
        var il = qs('#hero-image-layer');
        var hc = qs('#hero-content');
        if (il) il.style.clipPath = 'polygon(0% 0%,110% 0%,110% 110%,0% 110%)';
        if (hc) { hc.style.transition = 'none'; hc.classList.add('visible'); }
        revealHeroInstant();
    }

    /* ── REDUCED MOTION: skip intro entirely ── */
    if (reduced) {
        window.addEventListener('DOMContentLoaded', function () {
            finalHeroInstant();
            qsa('.h-card').forEach(function (c) { gsap.set(c, { opacity: 1, y: 0 }); });
            requestAnimationFrame(function () { setupHS(); });
        });
        window.addEventListener('load', function () { setupHS(); });
        return;
    }

    /* ── HARD FAIL-SAFE (5000ms) ─────────────────────────────
       Only fires if GSAP never completes (CDN fail, script error, etc).
       5s > max intro duration (~3.1s), so this is a true no-op
       on the happy path because _introRevealDone is set true in
       onStart of the master timeline.
       ─────────────────────────────────────────────────────── */
    var _introRevealDone = false;
    (function armFailSafe() {
        function forceShow() {
            if (_introRevealDone) return;
            _introRevealDone = true;
            console.warn('[INTRO] fail-safe fired — GSAP may have failed');
            finalHeroInstant();
            qsa('.h-card').forEach(function (c) { gsap.set(c, { opacity: 1, y: 0 }); });
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                setTimeout(forceShow, 5000);
            });
        } else {
            setTimeout(forceShow, 5000);
        }
    }());

    /* ══════════════════════════════════════════
       STEP 1 — Blueprint cumulative light-draw

       TWO-LAYER SYSTEM:
         BASE  (.bp-base) — static, always visible, no glow.
         GLOW  (.bp-glow) — cumulative reveal via dashoffset.
                            Drawn portion STAYS as a glowing line.

       SINGLE PLAYHEAD:
         Only ONE path draws at any moment.
         The cursor advances only after the current path fully completes.
       ══════════════════════════════════════════ */
    function buildSVGTimeline() {
        /* Blueprint SVG visuals removed. Return empty timeline so the
           master sequence timing labels are unaffected. */
        return gsap.timeline();
    }




    /* ══════════════════════════════════════════
       STEP 2A — 4-image slide strip (REMOVED)
       Stub kept so no call sites break.
       ══════════════════════════════════════════ */
    function buildSlideTimeline() {
        /* Slide strip removed — return empty timeline so master
           sequence has zero dead-time for this phase. */
        return gsap.timeline();
    }

    /* ══════════════════════════════════════════
       STEP 2B — Dual diagonal panel transition
       ══════════════════════════════════════════ */
    function buildPanelTimeline() {
        var stage = qs('#transition-stage');
        var panelA = qs('#panel-a');
        var panelB = qs('#panel-b');
        if (!stage || !panelA || !panelB) return gsap.timeline();

        stage.style.visibility = 'visible';

        var A0 = 'polygon(0% 0%, 1% 0%, 1% 1%, 0% 1%)';
        var A1 = 'polygon(0% 0%, 65% 0%, 35% 100%, 0% 100%)';
        var A2 = 'polygon(0% 0%, 20% 0%, 5% 60%, 0% 100%)';
        var A3 = 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)';

        var B0 = 'polygon(99% 99%, 100% 99%, 100% 100%, 99% 100%)';
        var B1 = 'polygon(55% 0%, 100% 0%, 100% 100%, 25% 100%)';
        var B2 = 'polygon(80% 0%, 100% 0%, 100% 100%, 88% 50%)';
        var B3 = 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)';

        gsap.set(panelA, { clipPath: A0, rotation: -8, transformOrigin: '50% 50%' });
        gsap.set(panelB, { clipPath: B0, rotation: 8, transformOrigin: '50% 50%' });

        var tl = gsap.timeline();
        tl.to(panelA, { clipPath: A1, rotation: 0, duration: 0.7, ease: 'power2.out' }, 0)
            .to(panelB, { clipPath: B1, rotation: 0, duration: 0.7, ease: 'power2.out' }, 0.08);

        tl.addLabel('hold', 0.8);

        tl.to(panelA, { clipPath: A2, rotation: -10, duration: 0.38, ease: 'power2.in' }, 'hold+=0.35')
            .to(panelA, {
                clipPath: A3, rotation: -18, duration: 0.42, ease: 'power2.out',
                onComplete: function () { panelA.style.visibility = 'hidden'; }
            }, 'hold+=0.73');

        tl.to(panelB, { clipPath: B2, rotation: 10, duration: 0.38, ease: 'power2.in' }, 'hold+=0.4')
            .to(panelB, {
                clipPath: B3, rotation: 18, duration: 0.42, ease: 'power2.out',
                onComplete: function () { panelB.style.visibility = 'hidden'; }
            }, 'hold+=0.78');

        return tl; /* ~1.55s */
    }

    /* ══════════════════════════════════════════
       HERO WIPE — final polygon open (3 states)
       ══════════════════════════════════════════ */
    function buildHeroWipe() {
        var il = qs('#hero-image-layer');
        if (!il) return gsap.timeline();

        var s0 = 'polygon(0% 0%, 1% 0%, 1% 1%, 0% 1%)';
        var s1 = 'polygon(0% 0%, 62% 0%, 38% 100%, 0% 100%)';
        var s2 = 'polygon(0% 0%, 110% 0%, 110% 110%, 0% 110%)';

        gsap.set(il, { clipPath: s0 });

        return gsap.timeline()
            .to(il, { clipPath: s1, duration: 0.4, ease: 'power3.in' })
            .to(il, { clipPath: s2, duration: 0.4, ease: 'power3.out' });
    }

    /* ══════════════════════════════════════════
       HERO LOGO — letter-by-letter stagger
       ══════════════════════════════════════════ */
    function buildLogoReveal() {
        var chars = qsa('.hero-char');
        var sub = qs('#hero-sub');
        var btns = qs('#hero-btns');
        if (!chars.length) return gsap.timeline();

        var tl = gsap.timeline();

        tl.to(chars, {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.12,
            ease: 'power3.out'
        }, 0);

        tl.to([sub, btns], {
            opacity: 1,
            duration: 0.55,
            ease: 'power2.out',
            stagger: 0.15
        }, 0.6);

        return tl; /* ~1.2s */
    }

    /* ══════════════════════════════════════════
       MASTER INTRO SEQUENCE
       Deterministic on every load — no sessionStorage.
       Overlay is shown by adding body.intro-playing
       and torn down by teardownOverlay().
       ══════════════════════════════════════════ */
    function runIntro() {
        var hcontent = qs('#hero-content');

        var master = gsap.timeline({
            onStart: function () {
                /* Mark done so fail-safe is a no-op on the happy path */
                _introRevealDone = true;
                /* Show overlay + dark stage only while intro is actually playing */
                document.body.classList.add('intro-playing', 'stage-dark');
                console.log('[INTRO] started — intro-playing ON');
            },
            onComplete: function () {
                /* Logo stagger finished — nothing left to clean up */
                console.log('[INTRO] complete');
            }
        });

        /* 0.3s: diagonal panels start immediately */
        master.addLabel('panels', 0.3);
        master.add(buildPanelTimeline(), 'panels');   /* ~1.55s, ends ~1.85s */

        /* 1.9s: hero wipe begins — this is the handoff point.
           Tear down overlay HERE so the hero image is already
           opening when the overlay exits. Zero blank gap. */
        master.addLabel('hero', 1.9);
        master.add(function () {
            /* Remove overlay immediately as hero starts revealing */
            document.body.classList.remove('intro-playing', 'stage-dark');
            teardownOverlay();
            console.log('[INTRO] complete — overlay removed');
        }, 'hero');
        master.add(buildHeroWipe(), 'hero');          /* 0.8s: polygon wipe open */
        master.add(function () {
            if (hcontent) hcontent.classList.add('visible');
        }, 'hero+=0.1');                              /* text fades in right with image */
        master.add(buildLogoReveal(), 'hero+=0.25');  /* letters stagger in ~1.2s */
    }


    /* ══════════════════════════════════════════════════════
       setupHS — creates the "HS" horizontal-pin ScrollTrigger.
       Called from DOMContentLoaded (rAF) AND window.load.
       Idempotent: kills any prior HS ST before creating a new one.
       Card widths are CSS-driven (max(260px,30vw)), so scrollWidth
       is valid at DOMContentLoaded — no image-load dependency.
       ══════════════════════════════════════════════════════ */
    /* ══════════════════════════════════════════════════════
       setupHS — clean horizontal-pin ScrollTrigger.
       Spec: pin + scrub + horizontal translation on #detail.
       Called at DOMContentLoaded (rAF) and on window.load/resize.
       ══════════════════════════════════════════════════════ */
    function setupHS() {
        var section = document.querySelector('#detail');
        var hscroll = document.querySelector('.hscroll');
        var track = document.querySelector('.track');

        /* Step 1 — verify required elements */
        console.log('[HS] section:', section, '| hscroll:', hscroll, '| track:', track);
        if (!section || !hscroll || !track) {
            console.warn('[HS] ABORT — a required element is null');
            return;
        }

        /* Step 1 — force nowrap inline: belt-and-suspenders against any
           stale inline style from a prior run or cached page state.      */
        track.style.flexWrap = 'nowrap';
        track.style.display = 'flex';
        hscroll.style.height = '';        /* clear any wrapping mobile override */
        hscroll.style.overflow = '';

        /* Remove inline gap/padding overrides so CSS rules apply */
        track.style.gap = '';
        track.style.padding = '';

        /* Kill any existing HS trigger before rebuilding */
        var old = ScrollTrigger.getById('HS');
        if (old) old.kill();
        if (hsST) { hsST.kill(); hsST = null; }
        gsap.killTweensOf(track);
        gsap.set(track, { x: 0, clearProps: 'x' });


        /* Set overflow:hidden so GSAP pin works correctly on ALL breakpoints.
           (Native scroll is disabled — pin+scrub handles the movement.) */
        hscroll.style.overflowX = 'hidden';
        hscroll.style.overflowY = 'hidden';

        /* Step 2 — measure distance AFTER inline nowrap is applied.
           scrollWidth is CSS-driven (max(260px,30vw)) so no image-load wait. */
        var distance = track.scrollWidth - hscroll.clientWidth;
        console.log('[HS] track.scrollWidth:', track.scrollWidth,
            '| hscroll.clientWidth:', hscroll.clientWidth,
            '| distance:', distance);

        /* Step 4 — safety guard */
        if (distance <= 0) {
            console.warn('[HS] distance<=0 — check .h-card CSS width (must be max(260px,30vw))');
            return;
        }

        /* Step 2 — create the HS ScrollTrigger exactly per spec */
        hsST = gsap.to(track, {
            x: -distance,
            ease: 'none',
            scrollTrigger: {
                id: 'HS',
                trigger: '#detail',
                start: 'top top',
                end: '+=' + distance,
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onEnter: function () { document.body.classList.add('detail-stage-active'); },
                onEnterBack: function () { document.body.classList.add('detail-stage-active'); },
                onLeave: function () { document.body.classList.remove('detail-stage-active'); },
                onLeaveBack: function () { document.body.classList.remove('detail-stage-active'); }
            }
        });

        /* Step 5 — proof log */
        console.log('[HS] Created. ScrollTrigger.getAll():',
            ScrollTrigger.getAll().map(function (t) {
                return {
                    id: t.vars.id, pin: !!t.vars.pin,
                    trigger: t.vars.trigger, start: t.vars.start
                };
            })
        );
    }

    /* Alias: keeps any remaining legacy calls working */
    function initHorizontalScroll() { setupHS(); }

    function initCardReveal() {
        var cards = qsa('.h-card');
        if (!cards.length) return;

        /* Card reveal animation only — horizontal scroll is set up
           independently from window.load, not from this onComplete. */
        var tl = gsap.timeline({
            scrollTrigger: {
                trigger: '#detail',
                start: 'top 80%',
                once: true
            }
        });

        cards.forEach(function (card, i) {
            tl.to(card, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, i * 0.18);
        });
    }

    /* ── Resize ── */
    var rTimer;
    window.addEventListener('resize', function () {
        clearTimeout(rTimer);
        rTimer = setTimeout(function () {
            gsap.set(qs('.track'), { x: 0, clearProps: 'x' });
            setupHS(); /* idempotent: kills old ST before recreating */
        }, 250);
    });

    /* ── Buttons ── */
    function initButtons() {
        /* btn-call and btn-kakao are now <a> tags — no JS handler needed.
           Only the footer button uses JS navigation. */
        var bm = qs('#btn-main-line');
        if (bm) bm.addEventListener('click', function () { window.location.href = 'tel:01012345678'; });
    }

    /* ── BOOT ── */
    window.addEventListener('DOMContentLoaded', function () {
        runIntro();
        initButtons();
        initCardReveal();
        /* setupHS called directly here: card widths are CSS-defined
           (max(260px,30vw)), so scrollWidth is correct at DOMContentLoaded.
           Single rAF flushes GSAP clearProps from any prior run. */
        requestAnimationFrame(function () { setupHS(); });
    });

    /* window.load: handled by the self-contained initHS IIFE below;
       do NOT duplicate here or it races with initHS and kills the HS trigger. */

})();

/* ================================================================
   SELF-CONTAINED HS INIT — matchMedia split.
   Desktop (≥768px): GSAP pin + scrub horizontal scroll.
   Mobile  (≤767px): no HS; CSS block layout handles vertical stack.
   ================================================================ */
(function () {
    if (!window.gsap || !window.ScrollTrigger) {
        console.warn('[HS] gsap/ScrollTrigger missing');
        return;
    }
    gsap.registerPlugin(ScrollTrigger);

    function initHS() {
        var detail = document.querySelector('#detail');
        var track = document.querySelector('#detail .track');
        var viewport = document.querySelector('#detail .hscroll') || detail;

        if (!detail || !track || !viewport) {
            console.warn('[HS] missing elements');
            return;
        }

        /* ── MOBILE (≤767px): kill HS + restore vertical layout ── */
        if (window.innerWidth <= 767) {
            console.log('[HS] MOBILE mode: kill HS + vertical stack');

            var old = ScrollTrigger.getById('HS');
            if (old) old.kill(true);

            gsap.set(track, { clearProps: 'transform' });

            /* Clear all inline styles that forced horizontal mode */
            track.style.display = '';
            track.style.flexWrap = '';
            viewport.style.overflow = '';
            viewport.style.overflowX = '';
            viewport.style.overflowY = '';
            Array.prototype.forEach.call(track.children, function (el) {
                el.style.flex = '';
            });

            return;
        }

        /* ── DESKTOP (≥768px): create HS pin + scrub ── */
        console.log('[HS] DESKTOP mode: create pin+scrub');

        /* Force nowrap inline (belt-and-suspenders) */
        track.style.display = 'flex';
        track.style.flexWrap = 'nowrap';
        Array.prototype.forEach.call(track.children, function (el) {
            el.style.flex = '0 0 auto';
        });

        /* Disable native overflow so GSAP pin works */
        viewport.style.overflowX = 'hidden';
        viewport.style.overflowY = 'hidden';

        /* Kill any prior HS trigger */
        var old = ScrollTrigger.getById('HS');
        if (old) old.kill(true);

        gsap.set(track, { x: 0 });

        /* Measure */
        var total = track.scrollWidth;
        var vw = viewport.clientWidth;
        var distance = Math.max(0, total - vw);

        console.log('[HS] distance', { total: total, vw: vw, distance: distance });

        if (distance <= 1) {
            console.warn('[HS] distance too small — HS not created');
            ScrollTrigger.refresh();
            return;
        }

        gsap.to(track, {
            x: -distance,
            ease: 'none',
            overwrite: true,
            scrollTrigger: {
                id: 'HS',
                trigger: detail,
                start: 'top top',
                end: function () { return '+=' + distance; },
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onEnter: function () { document.body.classList.add('detail-stage-active'); },
                onEnterBack: function () { document.body.classList.add('detail-stage-active'); },
                onLeave: function () { document.body.classList.remove('detail-stage-active'); },
                onLeaveBack: function () { document.body.classList.remove('detail-stage-active'); }
            }
        });

        ScrollTrigger.refresh();
        console.log('[HS] HS exists?', !!ScrollTrigger.getById('HS'));
    }

    /* Boot */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            requestAnimationFrame(initHS);
        });
    } else {
        requestAnimationFrame(initHS);
    }

    window.addEventListener('load', function () { initHS(); });

    /* Resize: debounce via rAF */
    var raf = 0;
    window.addEventListener('resize', function () {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(initHS);
    });
}());

/* ================================================================
   CARD MODAL — reads dataset attributes from .h-card, no DOM cloning.
   data-modal-img / data-modal-title / data-modal-desc / data-modal-points
   Open:  .is-open + aria-hidden="false" + .modal-open on <html>
   Close: Escape key or [data-close] click
   ================================================================ */
(function () {
    var modal = document.getElementById('card-modal');
    if (!modal) return;

    var mbody = modal.querySelector('.modal-body');

    function openModal(card) {
        var img = card.dataset.modalImg || '';
        var title = card.dataset.modalTitle || '';
        var desc = card.dataset.modalDesc || '';
        var category = card.dataset.modalCategory || '';
        var points = (card.dataset.modalPoints || '').split('|').map(function (s) { return s.trim(); }).filter(Boolean);

        mbody.innerHTML =
            '<div class="modal-media">' +
            '<img class="modal-img" src="' + img + '" alt="' + title + '">' +
            '</div>' +
            '<div class="modal-content">' +
            (category ? '<span class="modal-category">Category: ' + category + '</span>' : '') +
            (points.length ? '<ul class="modal-points">' + points.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>' : '') +
            '</div>';

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add('modal-open');
    }

    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.documentElement.classList.remove('modal-open');
        mbody.innerHTML = '';
    }

    /* Backdrop + close button */
    modal.addEventListener('click', function (e) {
        if (e.target.hasAttribute('data-close') || e.target.closest('[data-close]')) {
            closeModal();
        }
    });

    /* Card click — only .h-card inside #detail */
    document.addEventListener('click', function (e) {
        var card = e.target.closest('#detail .h-card');
        if (!card) return;
        openModal(card);
    });

    /* Escape key */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
            closeModal();
        }
    });
}());
/* LOCATION ACCORDION */

document.querySelectorAll('.js-loc-card').forEach(card => {

    const btn = card.querySelector('.loc-trigger')

    btn.addEventListener('click', () => {

        const isOpen = card.classList.contains('is-open')

        document.querySelectorAll('.js-loc-card')
            .forEach(c => c.classList.remove('is-open'))

        if (!isOpen) {
            card.classList.add('is-open')
        }

    })

})