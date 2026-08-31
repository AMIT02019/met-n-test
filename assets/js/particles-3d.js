/**
 * MET-N-TEST - 3D Interactive Particle Matrix Engine
 * High performance HTML5 Canvas 3D particle lattice with mouse depth tracking
 */

(function () {
  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let particles = [];
  let mouse = { x: null, y: null, targetX: 0, targetY: 0, radius: 150 };
  let scrollY = 0;
  let animationFrameId;

  const PARTICLE_COUNT = window.innerWidth < 768 ? 45 : 95;
  const CONNECTION_DIST = window.innerWidth < 768 ? 90 : 135;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = canvas.parentElement.offsetWidth || window.innerWidth;
    height = canvas.parentElement.offsetHeight || window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    initParticles();
  }

  class Particle3D {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = (Math.random() - 0.5) * width * 1.2;
      this.y = (Math.random() - 0.5) * height * 1.2;
      this.z = initial ? Math.random() * 600 - 300 : 300;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.vz = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2.2 + 1.2;
      this.baseColor = Math.random() > 0.4 ? '56, 189, 248' : '6, 182, 212';
      this.alpha = Math.random() * 0.5 + 0.3;
    }

    update(rotX, rotY) {
      this.x += this.vx;
      this.y += this.vy;
      this.z += this.vz;

      // Wrap-around bounds in 3D
      if (this.z < -300) this.z = 300;
      if (this.z > 300) this.z = -300;
      if (this.x < -width * 0.7) this.x = width * 0.7;
      if (this.x > width * 0.7) this.x = -width * 0.7;
      if (this.y < -height * 0.7) this.y = height * 0.7;
      if (this.y > height * 0.7) this.y = -height * 0.7;

      // 3D Perspective Projection
      const fov = 400;
      const scale = fov / (fov + this.z);

      // Rotate with mouse parallax
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // 3D Rotation Matrix
      let rx = this.x * cosY + this.z * sinY;
      let rz = -this.x * sinY + this.z * cosY;
      let ry = this.y * cosX - rz * sinX;
      rz = this.y * sinX + rz * cosX;

      const projScale = fov / (fov + rz + 400);

      this.projX = width / 2 + rx * projScale;
      this.projY = height / 2 + ry * projScale;
      this.projScale = projScale;
      this.depthAlpha = Math.max(0.1, Math.min(1, (rz + 300) / 600));

      // Mouse interactive force
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.projX - mouse.x;
        const dy = this.projY - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 1.5;
          this.x += (dx / dist) * force * 3;
          this.y += (dy / dist) * force * 3;
        }
      }
    }

    draw() {
      const size = Math.max(0.5, this.radius * this.projScale * 1.6);
      ctx.beginPath();
      ctx.arc(this.projX, this.projY, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.baseColor}, ${this.alpha * this.depthAlpha})`;
      ctx.fill();

      // Soft glow for closer particles
      if (this.projScale > 0.8) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${this.baseColor}, 0.8)`;
      } else {
        ctx.shadowBlur = 0;
      }
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle3D());
    }
  }

  let curRotX = 0;
  let curRotY = 0;

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Smooth rotational parallax towards target
    curRotX += (mouse.targetY - curRotX) * 0.04;
    curRotY += (mouse.targetX - curRotY) * 0.04;

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update(curRotX, curRotY);
      particles[i].draw();
    }

    // Draw connecting lines with dynamic depth
    ctx.shadowBlur = 0;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];

        const dx = p1.projX - p2.projX;
        const dy = p1.projY - p2.projY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          const lineAlpha = (1 - dist / CONNECTION_DIST) * 0.22 * Math.min(p1.depthAlpha, p2.depthAlpha);
          ctx.beginPath();
          ctx.moveTo(p1.projX, p1.projY);
          ctx.lineTo(p2.projX, p2.projY);
          ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
          ctx.lineWidth = 0.85 * Math.min(p1.projScale, p2.projScale);
          ctx.stroke();
        }
      }
    }

    animationFrameId = requestAnimationFrame(render);
  }

  // Event Listeners
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    // Target rotation angles (-0.25 to 0.25 rad)
    mouse.targetX = ((e.clientX / window.innerWidth) - 0.5) * 0.4;
    mouse.targetY = ((e.clientY / window.innerHeight) - 0.5) * -0.4;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
    mouse.targetX = 0;
    mouse.targetY = 0;
  });

  window.addEventListener('scroll', () => {
    scrollY = window.pageYOffset || document.documentElement.scrollTop;
  }, { passive: true });

  // Init
  resize();
  render();
})();
