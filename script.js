document.addEventListener("DOMContentLoaded", () => {

    gsap.registerPlugin(ScrollTrigger);

    /* ==========================================================================
       1. BULLETPROOF LENIS SMOOTH SCROLL (SWIPE SENSITIVITY FIXED)
       ========================================================================== */
    // Checks if the device uses touch to interact (Phone/Tablet)
    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    const lenis = new Lenis({
        duration: isTouch ? 1.2 : 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: isTouch, // FIX: Enables Lenis physics on mobile to restrict momentum
        touchMultiplier: isTouch ? 0.6 : 1, // FIX: Makes swiping "heavier" so one fast swipe doesn't fly past everything
    });

    lenis.on('scroll', ScrollTrigger.update);
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
       3. PRECISION CUSTOM CURSOR (FULLY DISABLED ON PHONES)
       ========================================================================== */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    if (!isTouch) {
        const xDot = gsap.quickTo(cursorDot, "left", { duration: 0.1, ease: "power3" });
        const yDot = gsap.quickTo(cursorDot, "top", { duration: 0.1, ease: "power3" });
        const xRing = gsap.quickTo(cursorRing, "left", { duration: 0.3, ease: "power3" });
        const yRing = gsap.quickTo(cursorRing, "top", { duration: 0.3, ease: "power3" });

        window.addEventListener('mousemove', (e) => {
            xDot(e.clientX); yDot(e.clientY);
            xRing(e.clientX); yRing(e.clientY);
        });
    }

    /* ==========================================================================
       4. SECTION 1: CLIP-PATH HERO REVEAL & 3D GEOMETRY
       ========================================================================== */
    const heroImage = document.querySelector('.hero-image-container');
    const heroImgInner = document.querySelector('.hero-img');

    gsap.timeline({
        scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
            pin: true
        }
    })
        .to(heroImage, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", ease: "none" })
        .fromTo(heroImgInner, { scale: 1.5 }, { scale: 1, ease: "none" }, "<");

    // Three.js 3D Floating Geometry (LARGER & CIRCULAR ARRANGEMENT)
    const canvas = document.querySelector('#webgl-canvas');
    if (canvas && typeof THREE !== 'undefined') {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.4
        });

        const group = new THREE.Group();
        scene.add(group);

        // 5 Geometries (Made much larger)
        const cube = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), material);
        const oct = new THREE.Mesh(new THREE.OctahedronGeometry(1.5), material);
        const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4), material);
        const tet = new THREE.Mesh(new THREE.TetrahedronGeometry(1.3), material);
        const dodec = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6), material);

        // Circular Orbital Positions Around The Center Text
        if (isTouch) {
            cube.position.set(-1.8, 2.5, -5);   // Top Left
            oct.position.set(1.8, 2.2, -5);     // Top Right
            ico.position.set(2.0, -2.5, -6);    // Bottom Right
            tet.position.set(-2.0, -2.2, -6);   // Bottom Left
            dodec.position.set(0, 3.8, -7);     // Top Center High
        } else {
            cube.position.set(-4, 2.5, -5);     // Top Left
            oct.position.set(4, 2.5, -5);       // Top Right
            ico.position.set(3.5, -2.5, -6);    // Bottom Right
            tet.position.set(-3.5, -2.5, -6);   // Bottom Left
            dodec.position.set(0, 4.5, -7);     // Top Center High
        }

        group.add(cube, oct, ico, tet, dodec);
        camera.position.z = 5;

        // Animate 3D Shapes (Subtle, slow levitation)
        const clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            cube.rotation.x = elapsedTime * 0.05;
            cube.rotation.y = elapsedTime * 0.08;

            oct.rotation.x = elapsedTime * 0.08;
            oct.rotation.y = elapsedTime * 0.05;

            ico.rotation.x = elapsedTime * 0.03;
            ico.rotation.y = elapsedTime * 0.1;

            tet.rotation.x = elapsedTime * 0.06;
            tet.rotation.y = elapsedTime * 0.07;

            dodec.rotation.x = elapsedTime * 0.04;
            dodec.rotation.y = elapsedTime * 0.06;

            // Very subtle and slow floating sway
            group.position.y = Math.sin(elapsedTime * 0.5) * 0.1;
            group.rotation.y = Math.sin(elapsedTime * 0.2) * 0.05;

            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    /* ==========================================================================
       5. SECTION 2: STATEMENT PARALLAX
       ========================================================================== */
    const statementTexts = gsap.utils.toArray('.massive-text');

    gsap.to(statementTexts, {
        xPercent: (i) => i % 2 === 0 ? 20 : -20,
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
       6. SECTION 3: HORIZONTAL STICKY STACKING
       ========================================================================== */
    const stackContainer = document.querySelector('.stack-container');
    const cards = gsap.utils.toArray('.stack-card');

    function getScrollAmount() {
        return stackContainer.scrollWidth - document.documentElement.clientWidth;
    }

    const stackTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".horizontal-stack",
            start: "top top",
            end: () => `+=${getScrollAmount()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            snap: 1 / (cards.length - 1)
        }
    });

    stackTl.to(stackContainer, {
        x: () => -getScrollAmount(),
        ease: "none"
    });

    /* ==========================================================================
       7. SECTION 4: THEME INVERT & HACKER SCRAMBLE
       ========================================================================== */
    ScrollTrigger.create({
        trigger: ".invert-section",
        start: "top center",
        end: "bottom center",
        onEnter: () => document.body.classList.add('light-mode'),
        onLeaveBack: () => document.body.classList.remove('light-mode'),
    });

    const chars = "ABCDEFGHJKLMNOPQRSTUVXYZ023456789";

    document.querySelectorAll('[data-target]').forEach(el => {
        const targetText = el.getAttribute('data-target');

        ScrollTrigger.create({
            trigger: el,
            start: "top 80%",
            onEnter: () => {
                let iteration = 0;
                clearInterval(el.interval);

                el.interval = setInterval(() => {
                    el.innerText = targetText.split("")
                        .map((letter, index) => {
                            if (index < iteration) return targetText[index];
                            if (targetText[index] === " ") return " ";
                            return chars[Math.floor(Math.random() * chars.length)];
                        }).join("");

                    if (iteration >= targetText.length) clearInterval(el.interval);
                    iteration += 1 / 3;
                }, 30);
            }
        });
    });

    /* ==========================================================================
       8. SECTION 5: INFINITE PARALLAX GRID 
       ========================================================================== */
    gsap.fromTo('.col-down', { yPercent: -10 }, {
        yPercent: 10, ease: "none", scrollTrigger: {
            trigger: ".parallax-grid", start: "top bottom", end: "bottom top", scrub: true
        }
    });

    gsap.fromTo('.col-up', { yPercent: 10 }, {
        yPercent: -10, ease: "none", scrollTrigger: {
            trigger: ".parallax-grid", start: "top bottom", end: "bottom top", scrub: true
        }
    });

    ScrollTrigger.create({
        trigger: ".parallax-grid",
        start: "top center",
        onEnter: () => document.body.classList.remove('light-mode'),
        onLeaveBack: () => document.body.classList.add('light-mode'),
    });

});