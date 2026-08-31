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
     0. Apple-Style 3D On-Scroll Video Playback & Scrubbing Engine
     ========================================================================== */
  const heroContainer = document.getElementById('hero');
  const heroVideo = document.getElementById('hero-scroll-video');
  const heroScrollHint = document.getElementById('hero-scroll-hint');
  const progressFill = document.getElementById('video-progress-fill');
  const timecodeEl = document.getElementById('video-timecode');

  if (heroVideo && heroContainer) {
    let videoDuration = 7.07; // exact duration of b44e9b5e8363fa925601c248e90fc6e7.mp4
    let targetProgress = 0;
    let smoothProgress = 0;
    let isReady = false;

    // Ensure video is properly configured for background scrubbing
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.playsInline = true;
    heroVideo.pause();

    function initVideo() {
      if (heroVideo.duration && !isNaN(heroVideo.duration) && heroVideo.duration > 0) {
        videoDuration = heroVideo.duration;
      }
      isReady = true;
    }

    heroVideo.addEventListener('loadedmetadata', initVideo);
    heroVideo.addEventListener('durationchange', initVideo);
    heroVideo.addEventListener('canplay', initVideo);
    heroVideo.addEventListener('loadeddata', () => {
      initVideo();
      try {
        heroVideo.currentTime = 0.001;
      } catch (e) {}
    });

    if (heroVideo.readyState >= 2) {
      initVideo();
    } else {
      heroVideo.load();
    }

    // Scroll listener updates the target progress immediately
    function onScrollUpdate() {
      const rect = heroContainer.getBoundingClientRect();
      const scrollDist = -rect.top;
      const maxScroll = heroContainer.offsetHeight - window.innerHeight;
      targetProgress = Math.max(0, Math.min(1, maxScroll > 0 ? scrollDist / maxScroll : 0));
    }

    window.addEventListener('scroll', onScrollUpdate, { passive: true });
    window.addEventListener('resize', onScrollUpdate, { passive: true });
    onScrollUpdate();

    // 60FPS / 120FPS Damped Physics Animation Loop
    function smoothScrubLoop() {
      // Damped spring interpolation: smooths out wheel tick quantization
      smoothProgress += (targetProgress - smoothProgress) * 0.12;

      if (Math.abs(targetProgress - smoothProgress) < 0.0001) {
        smoothProgress = targetProgress;
      }

      const targetTime = smoothProgress * Math.max(0, videoDuration - 0.02);

      // Perform seek smoothly if not currently blocked
      if (isReady && Math.abs(heroVideo.currentTime - targetTime) > 0.01) {
        try {
          if ('fastSeek' in heroVideo) {
            heroVideo.fastSeek(targetTime);
          } else {
            heroVideo.currentTime = targetTime;
          }
        } catch (err) {
          heroVideo.currentTime = targetTime;
        }
      }

      // Update Scrubber Progress Bar & Timecode Pill
      if (progressFill) {
        progressFill.style.width = `${smoothProgress * 100}%`;
      }
      if (timecodeEl) {
        const displayTime = heroVideo.currentTime || targetTime || 0;
        timecodeEl.textContent = `${displayTime.toFixed(1)}s / ${videoDuration.toFixed(1)}s`;
      }

      // Fade out indicator at the bottom of the section
      if (heroScrollHint) {
        if (smoothProgress > 0.95) {
          heroScrollHint.style.opacity = '0';
          heroScrollHint.style.transform = 'translateX(-50%) translateY(20px)';
        } else {
          heroScrollHint.style.opacity = '1';
          heroScrollHint.style.transform = 'translateX(-50%) translateY(0)';
        }
      }

      requestAnimationFrame(smoothScrubLoop);
    }

    requestAnimationFrame(smoothScrubLoop);
  }

  /* ==========================================================================
     1. 3D On-Scroll Card Reveal Engine
     ========================================================================== */
  const revealElements = document.querySelectorAll('.card-3d-reveal, .card-3d-reveal-left, .card-3d-reveal-right');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, {
    root: null,
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ==========================================================================
     2. 3D Stacking Cards Scroll Physics
     ========================================================================== */
  const stackCards = document.querySelectorAll('.stack-card');
  
  function updateCardStack() {
    const windowHeight = window.innerHeight;

    stackCards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const cardTop = rect.top;
      
      // Calculate how far the card is pinned
      if (cardTop <= 110) {
        const nextCard = stackCards[index + 1];
        if (nextCard) {
          const nextRect = nextCard.getBoundingClientRect();
          const progress = Math.max(0, Math.min(1, (110 - nextRect.top + windowHeight * 0.7) / (windowHeight * 0.7)));
          
          const scale = 1 - (progress * 0.05);
          const translateY = progress * -10;
          const rotateX = progress * 4;
          const brightness = 1 - (progress * 0.25);

          card.style.transform = `scale(${scale}) translateY(${translateY}px) rotateX(${rotateX}deg)`;
          card.style.filter = `brightness(${brightness})`;
        }
      } else {
        card.style.transform = 'scale(1) translateY(0) rotateX(0deg)';
        card.style.filter = 'brightness(1)';
      }
    });
  }

  if (window.innerWidth > 768 && stackCards.length > 0) {
    window.addEventListener('scroll', updateCardStack, { passive: true });
    updateCardStack();
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
