/**
 * MET-N-TEST - Modern 3D Scroll & Interaction Controller
 * Handles 3D on-scroll card reveals, sticky 3D stack physics, mouse tilt,
 * live estimators, animated counters, and contact modals.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  /* ==========================================================================
     0. 3D Interactive Particle Constellation Engine (Hero Background)
     ========================================================================== */
  const heroCanvas = document.getElementById('hero-particle-canvas');
  if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let width = (heroCanvas.width = heroCanvas.offsetWidth);
    let height = (heroCanvas.height = heroCanvas.offsetHeight);

    let mouse = { x: width / 2, y: height / 2, active: false };

    window.addEventListener('resize', () => {
      if (!heroCanvas) return;
      width = heroCanvas.width = heroCanvas.offsetWidth;
      height = heroCanvas.height = heroCanvas.offsetHeight;
    });

    const heroEl = document.getElementById('hero');
    if (heroEl) {
      heroEl.addEventListener('mousemove', (e) => {
        const rect = heroEl.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
      });

      heroEl.addEventListener('mouseleave', () => {
        mouse.active = false;
      });
    }

    const particleCount = Math.min(65, Math.floor(width / 22));
    const particles = [];

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 2 + 1;
        this.isGold = Math.random() > 0.4;
        this.color = this.isGold ? '212, 162, 76' : '100, 180, 255';
        this.baseAlpha = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Gentle cursor gravity
        if (mouse.active) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180 && dist > 10) {
            const force = (180 - dist) / 180 * 0.02;
            this.x += (dx / dist) * force * 15;
            this.y += (dy / dist) * force * 15;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.baseAlpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animateParticles() {
      if (!heroCanvas) return;
      ctx.clearRect(0, 0, width, height);

      // Connect near particles with delicate glowing lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(212, 162, 76, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }

  /* ==========================================================================
     1. Universal 3D On-Scroll Reveal Engine (Trigger on Every Section)
     ========================================================================== */
  const revealElements = document.querySelectorAll(
    '.card-3d-reveal, .card-3d-reveal-left, .card-3d-reveal-right, .scroll-reveal-up, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale'
  );

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, {
    root: null,
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ==========================================================================
     2. Cartier WAW 2025 Luxury Panoramic 3D Spatial Scroller Engine
     ========================================================================== */
  const cartierScrollTrack = document.querySelector('.cartier-scroll-track');
  const cartierHorizontalTrack = document.getElementById('cartier-track');
  const cartierHorizontalCards = document.querySelectorAll('.cartier-horizontal-card');
  const cartierNavBtns = document.querySelectorAll('.cartier-nav-btn');
  const cartierStepLabel = document.getElementById('cartier-step-label');
  const cartierProgressBar = document.getElementById('cartier-progress-bar');

  const stepLabels = [
    '01 / 04 — ISO Certification & Systems',
    '02 / 04 — Third-Party Inspection (TPI)',
    '03 / 04 — Strategic Sourcing & Vetting',
    '04 / 04 — Corporate Training & 5S Kaizen'
  ];

  if (cartierScrollTrack && cartierHorizontalTrack && cartierHorizontalCards.length > 0) {
    let targetProgress = 0;
    let smoothProgress = 0;

    function getCardCenters() {
      const cardWidth = cartierHorizontalCards[0].offsetWidth;
      const windowWidth = window.innerWidth;
      const firstCardLeft = cartierHorizontalCards[0].offsetLeft;
      const lastCardLeft = cartierHorizontalCards[cartierHorizontalCards.length - 1].offsetLeft;
      
      // Calculate total translation needed to center first card at start and last card at end
      const startX = (windowWidth / 2) - (firstCardLeft + cardWidth / 2);
      const endX = (windowWidth / 2) - (lastCardLeft + cardWidth / 2);
      return { startX, endX, totalDist: startX - endX };
    }

    function onScrollCartier() {
      const rect = cartierScrollTrack.getBoundingClientRect();
      const scrollDist = -rect.top;
      const maxScroll = cartierScrollTrack.offsetHeight - window.innerHeight;
      targetProgress = Math.max(0, Math.min(1, maxScroll > 0 ? scrollDist / maxScroll : 0));
    }

    window.addEventListener('scroll', onScrollCartier, { passive: true });
    window.addEventListener('resize', onScrollCartier, { passive: true });
    onScrollCartier();

    // 60FPS Cartier Damped Momentum Loop
    function cartierSpatialLoop() {
      smoothProgress += (targetProgress - smoothProgress) * 0.09;

      const { startX, endX } = getCardCenters();
      const currentTrackX = startX + (endX - startX) * smoothProgress;
      const screenCenter = window.innerWidth / 2;

      // Translate the entire panoramic horizontal deck
      cartierHorizontalTrack.style.transform = `translateX(${currentTrackX}px)`;

      let closestIdx = 0;
      let minDistance = Infinity;

      // Calculate 3D turntable perspective, depth, scale, and parallax for each card
      cartierHorizontalCards.forEach((card, idx) => {
        const cardWidth = card.offsetWidth;
        const cardCenter = card.offsetLeft + currentTrackX + cardWidth / 2;
        const distFromCenter = cardCenter - screenCenter;
        const absDist = Math.abs(distFromCenter);

        if (absDist < minDistance) {
          minDistance = absDist;
          closestIdx = idx;
        }

        // Normalized distance factor from center (-1 to 1)
        const u = Math.max(-1.5, Math.min(1.5, distFromCenter / (window.innerWidth * 0.55)));
        const absU = Math.abs(u);

        // Cartier 3D spatial rotation and scale curve
        const rotateY = u * -18; // 3D Turntable rotation
        const scale = 1 - Math.min(0.18, absU * 0.16);
        const translateZ = Math.max(0, (1 - absU) * 40);
        const opacity = Math.max(0.35, 1 - absU * 0.55);
        const brightness = Math.max(0.45, 1 - absU * 0.50);
        const blur = Math.min(4, absU * 3.5);

        card.style.transform = `perspective(1600px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
        card.style.opacity = `${opacity}`;
        card.style.filter = `brightness(${brightness}) blur(${blur}px)`;

        // Image Parallax within active card
        const img = card.querySelector('.card-parallax-img');
        if (img) {
          img.style.transform = `scale(1.08) translateX(${u * 25}px)`;
        }

        if (absU < 0.35) {
          card.classList.add('is-active');
        } else {
          card.classList.remove('is-active');
        }
      });

      // Update Nav Pills & Telemetry
      cartierNavBtns.forEach((btn, idx) => {
        if (idx === closestIdx) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      if (cartierStepLabel) {
        cartierStepLabel.textContent = stepLabels[closestIdx];
      }

      if (cartierProgressBar) {
        cartierProgressBar.style.width = `${Math.max(25, (closestIdx + 1) * 25)}%`;
      }

      requestAnimationFrame(cartierSpatialLoop);
    }

    requestAnimationFrame(cartierSpatialLoop);

    // Interactive Navigation Buttons: Smooth Jump to Center Card
    cartierNavBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const step = parseInt(btn.getAttribute('data-step') || '0', 10);
        const stepFrac = step / (cartierHorizontalCards.length - 1);
        const rect = cartierScrollTrack.getBoundingClientRect();
        const absoluteTop = window.scrollY + rect.top;
        const maxScroll = cartierScrollTrack.offsetHeight - window.innerHeight;
        const scrollToY = absoluteTop + stepFrac * maxScroll;

        window.scrollTo({
          top: scrollToY,
          behavior: 'smooth'
        });
      });
    });

    // Touch and Drag Inertia Support
    let isDragging = false;
    let dragStartX = 0;
    let dragStartProgress = 0;

    cartierHorizontalTrack.addEventListener('mousedown', (e) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartProgress = targetProgress;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX;
      const windowWidth = window.innerWidth;
      const progressDelta = -deltaX / (windowWidth * 1.5);
      targetProgress = Math.max(0, Math.min(1, dragStartProgress + progressDelta));
      
      const rect = cartierScrollTrack.getBoundingClientRect();
      const absoluteTop = window.scrollY + rect.top;
      const maxScroll = cartierScrollTrack.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: absoluteTop + targetProgress * maxScroll,
        behavior: 'auto'
      });
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  /* ==========================================================================
     3. 3D Interactive Mouse Tilt Effect
     ========================================================================== */
  const tiltCards = document.querySelectorAll('.tilt-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  /* ==========================================================================
     4. Animated Statistics Counter
     ========================================================================== */
  const counterElements = document.querySelectorAll('[data-counter-target]');
  let countersAnimated = false;

  function triggerCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    counterElements.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-counter-target'));
      const suffix = counter.getAttribute('data-counter-suffix') || '';
      const prefix = counter.getAttribute('data-counter-prefix') || '';
      const isDecimal = target % 1 !== 0;
      const duration = 2000;
      const startTime = performance.now();

      function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentVal = easeProgress * target;

        if (isDecimal) {
          counter.textContent = prefix + currentVal.toFixed(1) + suffix;
        } else {
          counter.textContent = prefix + Math.floor(currentVal) + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          counter.textContent = prefix + (isDecimal ? target.toFixed(1) : target) + suffix;
        }
      }

      requestAnimationFrame(updateNumber);
    });
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        triggerCounters();
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.getElementById('stats-section');
  if (statsSection) {
    counterObserver.observe(statsSection);
  }

  /* ==========================================================================
     5. Interactive ISO & Inspection Cost/Roadmap Estimator
     ========================================================================== */
  const estimatorService = document.getElementById('est-service');
  const estimatorSize = document.getElementById('est-size');
  const estimatorIndustry = document.getElementById('est-industry');
  
  const estTimeline = document.getElementById('est-result-timeline');
  const estPhases = document.getElementById('est-result-phases');
  const estDeliverables = document.getElementById('est-result-deliverables');

  // Finvvritti Chip & Slider Controls
  const standardChips = document.querySelectorAll('#estimator-standard-chips button');
  const paceChips = document.querySelectorAll('#estimator-pace-chips button');
  const teamSlider = document.getElementById('estimator-team-slider');
  const sliderTeamVal = document.getElementById('slider-team-val');
  const calcDuration = document.getElementById('calc-duration');

  let selectedStandard = 'iso9001';
  let selectedPace = 'standard';
  let selectedSizeIndex = 2; // 25-50 members

  const teamSizes = [
    '1 - 25 Members',
    '25 - 50 Members',
    '50 - 250 Members',
    '250+ Enterprise'
  ];

  function updateFinvvrittiEstimator() {
    if (!calcDuration) return;

    let baseWeeks = 5;
    if (selectedStandard === 'iatf16949') baseWeeks = 10;
    else if (selectedStandard === 'ims') baseWeeks = 8;
    else if (selectedStandard === 'tpi') baseWeeks = 1;
    else if (selectedStandard === 'iso14001' || selectedStandard === 'iso45001') baseWeeks = 6;

    if (selectedSizeIndex === 1) baseWeeks = Math.max(1, baseWeeks - 1);
    if (selectedSizeIndex === 3) baseWeeks += 2;
    if (selectedSizeIndex === 4) baseWeeks += 4;

    if (selectedPace === 'express') {
      baseWeeks = Math.max(1, Math.round(baseWeeks * 0.6));
    }

    if (selectedStandard === 'tpi') {
      calcDuration.textContent = '24 - 48 Hours';
    } else {
      calcDuration.textContent = `${baseWeeks} - ${baseWeeks + 2} Weeks`;
    }
  }

  if (standardChips.length > 0) {
    standardChips.forEach(btn => {
      btn.addEventListener('click', () => {
        standardChips.forEach(b => {
          b.className = 'px-3 py-2 rounded-xl text-xs font-bold border border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#d4a24c] text-center';
        });
        btn.className = 'px-3 py-2 rounded-xl text-xs font-bold border border-[#d4a24c] bg-[#d4a24c] text-[#0a2540] text-center';
        selectedStandard = btn.getAttribute('data-val');
        updateFinvvrittiEstimator();
      });
    });
  }

  if (paceChips.length > 0) {
    paceChips.forEach(btn => {
      btn.addEventListener('click', () => {
        paceChips.forEach(b => {
          b.className = 'px-4 py-2.5 rounded-xl text-xs font-bold border border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#d4a24c] text-center';
        });
        btn.className = 'px-4 py-2.5 rounded-xl text-xs font-bold border border-[#d4a24c] bg-[#d4a24c] text-[#0a2540] text-center';
        selectedPace = btn.getAttribute('data-pace');
        updateFinvvrittiEstimator();
      });
    });
  }

  if (teamSlider && sliderTeamVal) {
    teamSlider.addEventListener('input', (e) => {
      selectedSizeIndex = parseInt(e.target.value);
      sliderTeamVal.textContent = teamSizes[selectedSizeIndex - 1] || '25 - 50 Members';
      updateFinvvrittiEstimator();
    });
  }

  updateFinvvrittiEstimator();

  function calculateRoadmap() {
    if (!estimatorService || !estimatorSize || !estimatorIndustry) return;

    const service = estimatorService.value;
    const size = estimatorSize.value;

    let weeks = '4 - 8 Weeks';
    let phaseCount = '4 Key Milestones';
    let deliverables = 'Full Documentation, Gap Analysis & Audit Readiness Certificate';

    if (service === 'iso-9001' || service === 'iso-14001' || service === 'iso-45001') {
      if (size === 'small') weeks = '3 - 6 Weeks';
      else if (size === 'medium') weeks = '6 - 10 Weeks';
      else weeks = '10 - 16 Weeks';
      phaseCount = '4 Stages (Gap Audit → Process Design → Training → Certification)';
      deliverables = 'SOPs, Internal Auditor Certifications, Quality Manual & Stage 1/2 Support';
    } else if (service === 'iatf') {
      weeks = size === 'small' ? '8 - 12 Weeks' : '14 - 20 Weeks';
      phaseCount = '5 Stages (Core Tools APQP/FMEA/PPAP/MSA/SPC Implementation)';
      deliverables = 'Automotive Standard Compliance Package & Full Audit Defense';
    } else if (service === 'tpi') {
      weeks = '24 - 48 Hours Dispatch';
      phaseCount = 'On-Demand / Milestone-Based';
      deliverables = 'NABL-Aligned Witness Testing, Dimensional & Metallurgical Reports';
    } else if (service === 'sourcing') {
      weeks = '2 - 4 Weeks per Commodity';
      phaseCount = '3 Stages (Supplier Assessment → Sample Testing → Contract Terms)';
      deliverables = 'Verified Vendor Dossier, Cost Reduction Matrix & Quality SLA';
    } else if (service === 'training') {
      weeks = '2 - 5 Days Intensive';
      phaseCount = 'Hands-on Workshops & Assessment';
      deliverables = 'Certified Internal Auditor Credentials & 5S Implementation Toolkits';
    }

    if (estTimeline) estTimeline.textContent = weeks;
    if (estPhases) estPhases.textContent = phaseCount;
    if (estDeliverables) estDeliverables.textContent = deliverables;
  }

  [estimatorService, estimatorSize, estimatorIndustry].forEach(el => {
    if (el) el.addEventListener('change', calculateRoadmap);
  });
  calculateRoadmap();

  /* ==========================================================================
     6. Navigation Spy & Back to Top
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function scrollSpy() {
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', scrollSpy, { passive: true });

  // Back to Top Button with Circular Progress
  const progressWrap = document.querySelector('.progress-wrap');
  const progressPath = document.querySelector('.progress-wrap path');

  if (progressWrap && progressPath) {
    const pathLength = progressPath.getTotalLength();
    progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
    progressPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
    progressPath.style.strokeDashoffset = pathLength;
    progressPath.getBoundingClientRect();
    progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';

    function updateProgress() {
      const scroll = window.scrollY || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = pathLength - (scroll * pathLength / height);
      progressPath.style.strokeDashoffset = progress;

      if (scroll > 300) {
        progressWrap.classList.add('active-progress');
      } else {
        progressWrap.classList.remove('active-progress');
      }
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    progressWrap.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================================================
     6.1 Header Scrolled State
     ========================================================================== */
  const navbarPill = document.getElementById('navbar-pill');
  if (navbarPill) {
    function handleHeaderScroll() {
      if (window.scrollY > 30) {
        navbarPill.classList.add('scrolled');
      } else {
        navbarPill.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();
  }

  /* ==========================================================================
     7. Mobile Navigation Drawer
     ========================================================================== */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function toggleDrawer(open) {
    if (!mobileDrawer) return;
    if (open) {
      mobileDrawer.classList.remove('translate-x-full');
      document.body.style.overflow = 'hidden';
    } else {
      mobileDrawer.classList.add('translate-x-full');
      document.body.style.overflow = '';
    }
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => toggleDrawer(true));
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', () => toggleDrawer(false));
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => toggleDrawer(false));
  });

  /* ==========================================================================
     8. Modal Handlers (Quick Consultation / Quote)
     ========================================================================== */
  const quoteModal = document.getElementById('quote-modal');
  const openModalBtns = document.querySelectorAll('.open-quote-modal');
  const closeModalBtns = document.querySelectorAll('.close-quote-modal');

  function toggleModal(show) {
    if (!quoteModal) return;
    if (show) {
      quoteModal.classList.remove('hidden');
      quoteModal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    } else {
      quoteModal.classList.add('hidden');
      quoteModal.classList.remove('flex');
      document.body.style.overflow = '';
    }
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleModal(true);
    });
  });

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleModal(false);
    });
  });

  if (quoteModal) {
    quoteModal.addEventListener('click', (e) => {
      if (e.target === quoteModal) toggleModal(false);
    });
  }

  /* ==========================================================================
     9. Contact & Consultation Form Submissions
     ========================================================================== */
  const contactForms = document.querySelectorAll('.ajax-contact-form');
  const toastSuccess = document.getElementById('toast-success');

  contactForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Submit';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="inline-block animate-spin mr-2">⟳</span> Processing...';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '✓ Request Received!';
        }
        form.reset();

        // Show Success Toast
        if (toastSuccess) {
          toastSuccess.classList.remove('hidden', 'opacity-0');
          toastSuccess.classList.add('opacity-100');

          setTimeout(() => {
            toastSuccess.classList.add('opacity-0');
            setTimeout(() => toastSuccess.classList.add('hidden'), 300);
            if (submitBtn) submitBtn.innerHTML = originalText;
            toggleModal(false);
          }, 3500);
        }
      }, 1000);
    });
  });
});
