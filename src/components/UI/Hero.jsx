import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Probe WebGL availability before attempting to create a renderer.
// Some browsers/devices expose the API but fail context creation — that's
// handled separately inside the try-catch below.
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export default function Hero() {
  const containerRef = useRef(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const heroCards = [
    "We inspire students to explore ideas, experiment fearlessly, build solutions, and create impact.",
    "Our incubator program provides the resources, mentorship, and funding needed to accelerate your startup.",
    "Join a thriving community of builders, visionaries, and leaders who are shaping the future of technology."
  ];

  const indicatorColors = [
    "228,71,46",
    "22,140,131",
    "229,169,0"
  ];


  useEffect(() => {
    if (!containerRef.current) return;

    // Fast-path: no WebGL API at all → CSS fallback immediately
    if (!isWebGLAvailable()) {
      setWebglFailed(true);
      return;
    }

    const container = containerRef.current;
    let cancelled = false;

    // Cleanup handles collected inside the async init so the return()
    // can call them regardless of how far init got before an error.
    let cleanupFn = null;

    (async () => {
      let THREE;
      try {
        THREE = await import('three');
      } catch {
        if (!cancelled) setWebglFailed(true);
        return;
      }

      if (cancelled) return;

      let scene, camera, renderer, geometry, material, points, animationFrameId;

      try {
        scene    = new THREE.Scene();
        camera   = new THREE.PerspectiveCamera(
          60,
          container.clientWidth / container.clientHeight,
          0.1,
          1000
        );
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: 'low-power',
        });

        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

        // Clear any stale canvas from HMR re-mounts
        while (container.firstChild) container.removeChild(container.firstChild);
        container.appendChild(renderer.domElement);

        // Particle field
        const count     = 1500;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) {
          positions[i] = (Math.random() - 0.5) * 25;
        }

        geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        material = new THREE.PointsMaterial({
          size:       0.025,
          color:      0xE4472E,   // E-Cell Vermilion
          transparent: true,
          opacity:    0.25,
          blending:   THREE.AdditiveBlending,
        });

        points = new THREE.Points(geometry, material);
        scene.add(points);
        camera.position.z = 10;

        // Mouse parallax — throttled to one update per rAF
        let mouseX = 0, mouseY = 0, throttled = false;
        const onMouseMove = (e) => {
          if (throttled) return;
          throttled = true;
          mouseX =  (e.clientX / window.innerWidth  - 0.5) * 2;
          mouseY =  (e.clientY / window.innerHeight - 0.5) * 2;
          requestAnimationFrame(() => { throttled = false; });
        };
        document.addEventListener('mousemove', onMouseMove, { passive: true });

        const onResize = () => {
          if (!container) return;
          camera.aspect = container.clientWidth / container.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(container.clientWidth, container.clientHeight);
        };
        window.addEventListener('resize', onResize);

        const tick = () => {
          if (cancelled) return;
          animationFrameId = requestAnimationFrame(tick);
          points.rotation.y += 0.0005;
          points.rotation.x += 0.0002;
          points.position.x += (mouseX * 0.5 - points.position.x) * 0.05;
          points.position.y += (-mouseY * 0.5 - points.position.y) * 0.05;
          renderer.render(scene, camera);
        };
        tick();

        cleanupFn = () => {
          cancelAnimationFrame(animationFrameId);
          window.removeEventListener('resize', onResize);
          document.removeEventListener('mousemove', onMouseMove);
          geometry?.dispose();
          material?.dispose();
          renderer?.dispose();
          if (container && renderer?.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
        };

      } catch (err) {
        // WebGL context creation failed at runtime (GPU lost, too many contexts, etc.)
        console.warn('Hero: WebGL context failed, using CSS fallback.', err?.message ?? err);
        if (!cancelled) setWebglFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      cleanupFn?.();
    };
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      aria-labelledby="hero-title"
      role="region"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(6.5rem, 14vw, 8.5rem) clamp(1rem, 5vw, 3rem) 4rem',
        overflow: 'hidden',
        pointerEvents: 'none',
        boxSizing: 'border-box'
      }}
    >

      {/* Background layer — Three.js canvas OR CSS gradient fallback */}
      {webglFailed ? (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            zIndex: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 80% 60% at 30% 40%, rgba(228,71,46,0.08) 0%, transparent 70%), ' +
                        'radial-gradient(ellipse 60% 40% at 70% 60%, rgba(49,87,164,0.06) 0%, transparent 70%)',
          }}
        />
      ) : (
        <div
          ref={containerRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'auto' }}
        />
      )}

      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
        gap: '2.5rem',
        alignItems: 'center',
        fontFamily: 'var(--font-body)',
        pointerEvents: 'none'
      }}>

        <div style={{ pointerEvents: 'none' }}>

          <div style={{ marginBottom: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative', display: 'flex', width: '10px', height: '10px' }}>
              <span style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: '#E4472E', opacity: 0.75 }}></span>
              <span style={{ position: 'relative', width: '10px', height: '10px', borderRadius: '50%', background: '#E4472E' }}></span>
            </div>
            <span style={{ fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--ecell-saffron)' }}>Ideas Igniting · BPHC</span>
          </div>

          <h1 id="hero-title" className="serif"
            style={{
              color: 'var(--text-primary)',
              fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              marginBottom: '2rem',
              pointerEvents: 'auto'
            }}>
            Innovation<br/>
            <span style={{ color: 'transparent', WebkitTextStroke: '1px var(--text-muted)' }}>
              from chaos.
            </span>
          </h1>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', pointerEvents: 'auto' }}>
            <button
              className="btn-glow"
              style={{
                background: 'linear-gradient(135deg, var(--brand-primary) 0%, #C53821 100%)',
                color: 'white',
                padding: '16px 36px',
                fontWeight: 800,
                borderRadius: '9999px',
                fontSize: '0.85rem',
                letterSpacing: '0.06em',
                cursor: 'pointer',
                boxShadow: '0 0 30px rgba(228,71,46,0.3)',
                border: '1px solid rgba(228,71,46,0.4)',
                fontFamily: 'var(--font-body)'
              }}>
              EXPLORE INITIATIVES
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--glass-border)' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.2rem', color: 'var(--text-secondary)' }}>Est. BPHC 2018 </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ecell-saffron)' }}>Entrepreneurship Cell</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ pointerEvents: 'auto' }}>
          <div style={{
            padding: 'clamp(1.5rem, 3vw, 2rem)',
            borderRadius: '24px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{ minHeight: '80px', display: 'flex', alignItems: 'center' }}>
              <motion.p 
                key={activeCardIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', lineHeight: 1.6, fontWeight: 300, color: 'var(--text-secondary)', margin: 0 }}
              >
                {heroCards[activeCardIndex]}
              </motion.p>
            </div>
            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem' }}>
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCardIndex(idx)}
                  style={{ 
                    height: '4px', 
                    width: activeCardIndex === idx ? '32px' : '10px', 
                    borderRadius: '9999px', 
                    backgroundColor: `rgba(${indicatorColors[idx]}, ${activeCardIndex === idx ? '0.8' : '0.4'})`,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'width 0.3s ease, background-color 0.3s ease',
                    padding: 0,
                    outlineOffset: '2px'
                  }}
                  aria-label={`Show card ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
