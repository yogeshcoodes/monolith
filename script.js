document.addEventListener("DOMContentLoaded", () => {

    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    /* ==========================================================================
       1. BULLETPROOF LENIS SMOOTH SCROLL
       ========================================================================== */
    const lenis = new Lenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    // Sync GSAP ticker with Lenis
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    /* ==========================================================================
       2. GLOBAL SCROLL PROGRESS BAR
       ========================================================================== */
    const progressBar = document.querySelector('.progress-bar');
    lenis.on('scroll', (e) => {
        progressBar.style.width = `${e.progress * 100}%`;
    });

    /* ==========================================================================
       3. PRECISION CUSTOM CURSOR
       ========================================================================== */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    // quickTo is highly performant and won't bug out
    const xDot = gsap.quickTo(cursorDot, "left", { duration: 0.1, ease: "power3" });
    const yDot = gsap.quickTo(cursorDot, "top", { duration: 0.1, ease: "power3" });
    const xRing = gsap.quickTo(cursorRing, "left", { duration: 0.3, ease: "power3" });
    const yRing = gsap.quickTo(cursorRing, "top", { duration: 0.3, ease: "power3" });

    window.addEventListener('mousemove', (e) => {
        xDot(e.clientX); yDot(e.clientY);
        xRing(e.clientX); yRing(e.clientY);
    });

    /* ==========================================================================
       4. SECTION 1: CLIP-PATH HERO REVEAL
       ========================================================================== */
    const heroImage = document.querySelector('.hero-image-container');
    const heroImgInner = document.querySelector('.hero-img');

    const heroTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: 1.2, // Smooth interpolation
            pin: true   // Pins the hero while it opens
        }
    });

    // Tear the image open from a completely invisible slit to full screen
    heroTl.to(heroImage, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: "none"
    })
        // Scale the image slightly inside the mask for extreme depth
        .fromTo(heroImgInner,
            { scale: 1.5 },
            { scale: 1, ease: "none" },
            "<" // Sync with previous animation
        );

    /* ==========================================================================
       5. SECTION 2: STATEMENT PARALLAX
       ========================================================================== */
    const statementTexts = gsap.utils.toArray('.massive-text');

    gsap.to(statementTexts, {
        xPercent: (i) => i % 2 === 0 ? 20 : -20, // Alternates left/right movement
        opacity: 1,
        ease: "none",
        scrollTrigger: {
            trigger: ".statement-section",
            start: "top bottom",
            end: "bottom top",
            scrub: 1
        }
    });

    /* ==========================================================================
       6. SECTION 3: HORIZONTAL STICKY STACKING WITH AUTO SNAP
       ========================================================================== */
    const stackContainer = document.querySelector('.stack-container');
    const cards = gsap.utils.toArray('.stack-card');
    const amountToScroll = 100 * (cards.length - 1);

    gsap.to(stackContainer, {
        xPercent: -amountToScroll,
        ease: "none",
        scrollTrigger: {
            trigger: ".horizontal-stack",
            start: "top top",
            end: () => `+=${amountToScroll * 10}`, // Length of the pin
            scrub: 1,
            pin: true,
            snap: 1 / (cards.length - 1) // Handles the requested Carousel Auto-Scroll effect
        }
    });

    // Inside the pinned section, make the cards stack using parallax logic
    cards.forEach((card, i) => {
        gsap.to(card, {
            xPercent: i * 100, // Counter-acts the container movement
            ease: "none",
            scrollTrigger: {
                trigger: ".horizontal-stack",
                start: "top top",
                end: () => `+=${amountToScroll * 10}`,
                scrub: 1
            }
        });
    });

    /* ==========================================================================
       7. SECTION 4: THEME INVERT & HACKER SCRAMBLE
       ========================================================================== */
    // Invert the entire body color when this section hits the center
    ScrollTrigger.create({
        trigger: ".invert-section",
        start: "top center",
        end: "bottom center",
        onEnter: () => document.body.classList.add('light-mode'),
        onLeaveBack: () => document.body.classList.remove('light-mode'),
    });

    // Custom Text Scramble Function (Zero external libraries)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    const scrambleElements = document.querySelectorAll('[data-target]');

    scrambleElements.forEach(el => {
        const targetText = el.getAttribute('data-target');

        ScrollTrigger.create({
            trigger: el,
            start: "top 80%",
            onEnter: () => scrambleText(el, targetText)
        });
    });

    function scrambleText(element, targetText) {
        let iteration = 0;
        clearInterval(element.interval);

        element.interval = setInterval(() => {
            element.innerText = targetText.split("")
                .map((letter, index) => {
                    if (index < iteration) return targetText[index];
                    if (targetText[index] === " ") return " ";
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join("");

            if (iteration >= targetText.length) {
                clearInterval(element.interval);
            }
            iteration += 1 / 3; // Controls speed of decode
        }, 30);
    }

    /* ==========================================================================
       8. SECTION 5: INFINITE PARALLAX GRID
       ========================================================================== */
    // The middle column goes UP, the outer columns go DOWN
    gsap.fromTo('.col-down',
        { yPercent: -20 },
        {
            yPercent: 20, ease: "none", scrollTrigger: {
                trigger: ".parallax-grid",
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        }
    );

    gsap.fromTo('.col-up',
        { yPercent: 20 },
        {
            yPercent: -20, ease: "none", scrollTrigger: {
                trigger: ".parallax-grid",
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        }
    );

    // Fix inversion going into the footer
    ScrollTrigger.create({
        trigger: ".parallax-grid",
        start: "top center",
        onEnter: () => document.body.classList.remove('light-mode'),
        onLeaveBack: () => document.body.classList.add('light-mode'),
    });

    /* ==========================================================================
       9. SECTION 6: MASSIVE FOOTER REVEAL
       ========================================================================== */
    gsap.from('.footer-reveal', {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
            trigger: ".massive-footer",
            start: "top bottom",
            end: "bottom bottom",
            scrub: true
        }
    });

});