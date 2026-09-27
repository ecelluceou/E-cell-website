import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Compass, Rocket, Users, Target, TrendingUp, Cpu, ArrowUpRight, ArrowDown } from 'lucide-react';
import TextReveal3DGSAP from '../components/TextReveal3DGSAP';

export default function Home() {
  return (
    <div className="home-page" style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: 'var(--color-chalk, #f3f3f3)',
      fontFamily: 'var(--font-aeonik, "Inter", sans-serif)',
      position: 'relative',
      overflowX: 'hidden',
      paddingTop: '80px'
    }}>
      {/* 
        ========================================================================
        HERO SECTION (Exact Hyperstudio Layout)
        ========================================================================
      */}
      <section style={{
        position: 'relative',
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Full-width Dot-Matrix Background Graphic for Hero Only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.2 }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none'
          }}
        >
          <img
            src="/hero-bg.jpg"
            alt="E-Cell Dot-Matrix Wireframe Hands"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: 0.25, // Soft opacity
              display: 'block'
            }}
          />
        </motion.div>

        {/* Constrained Content Container */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: 'clamp(6vh, 12vh, 12vh) 1rem clamp(2rem, 3.5rem, 3.5rem) 1rem',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          minHeight: 'calc(100vh - 80px)'
        }}>
          {/* Top Content Stack: Headline + Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: '900px'
            }}
          >
            {/* Headline Display Block */}
            <h1 style={{
              fontFamily: '"Space Grotesk", var(--font-aeonik, sans-serif)', // Creative, modern tech font
              fontWeight: 500, // Slightly bolder for gradient visibility
              fontSize: 'clamp(42px, 6vw, 72px)', // Slightly larger for impact
              lineHeight: 1.05,
              letterSpacing: '-1.5px',
              margin: '0 0 3rem 0',
              maxWidth: '850px',
              // Gradient Text Styles
              background: 'linear-gradient(135deg, #ffffff 0%, #b4c6fc 50%, #6366f1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent', // Fallback
              textShadow: '0 10px 30px rgba(99, 102, 241, 0.15)' // Subtle glow
            }}>
              Where Ideas Meet Execution<br />
              <span style={{ 
                background: 'linear-gradient(135deg, #f3f3f3 0%, #888888 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>E-CELL UCEOU</span>
            </h1>

            {/* Subtle Scroll Indicator */}
            <a
              href="#manifesto"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--color-smoke, #9c9c9c)',
                fontFamily: 'var(--font-input, monospace)',
                fontSize: '13px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
                pointerEvents: 'auto'
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = 'var(--color-chalk, #f3f3f3)'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = 'var(--color-smoke, #9c9c9c)'; }}
            >
              SCROLL TO EXPLORE <ArrowDown size={14} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* 
        ========================================================================
        3D TEXT REVEAL SECTION (GSAP)
        ========================================================================
      */}
      <section className="home-3d-text-section" style={{
        padding: 'clamp(80px, 20vw, 240px) 1.5rem',
        maxWidth: '1000px',
        margin: '0 auto',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <TextReveal3DGSAP text={['IDEATE', 'INNOVATE', 'ITERATE']} />
      </section>

      {/* 
        ========================================================================
        MANIFESTO SECTION
        ========================================================================
      */}
      <section id="manifesto" className="home-manifesto-section" style={{
        width: '100%',
        padding: 'clamp(40px, 8vw, 80px) 1rem',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            maxWidth: '1000px',
            width: '100%',
            padding: 'clamp(40px, 8vw, 80px) clamp(20px, 4vw, 40px)',
            textAlign: 'center',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 'clamp(20px, 4vw, 40px)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <h2 style={{
            fontFamily: 'var(--font-aeonik, "Inter", sans-serif)',
            fontSize: 'var(--text-heading-sm, 26px)',
            fontWeight: 400,
            color: 'var(--color-chalk, #f3f3f3)',
            marginBottom: '1.5rem',
            letterSpacing: '-0.2px'
          }}>
            Why E-Cell UCEOU?
          </h2>
          <p style={{
            fontFamily: 'var(--font-aeonik, "Inter", sans-serif)',
            fontSize: 'var(--text-body, 17px)',
            fontWeight: 400,
            color: 'var(--color-smoke, #9c9c9c)',
            lineHeight: 1.7,
            margin: '0 auto 2.5rem auto',
            maxWidth: '680px' // Keep text line-length readable inside the wide block
          }}>
            We believe that university campuses are the ultimate launchpad for breakthrough ventures. 
            By stripping away friction and providing direct mentorship, seed networks, and technical 
            validation, we empower students to turn raw hypotheses into resilient companies.
          </p>
          <Link
            to="/initiatives"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              color: 'var(--color-chalk, #f3f3f3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '14px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              letterSpacing: '0.05em'
            }}
            onMouseOver={(e) => { 
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; 
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => { 
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; 
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            READ INITIATIVES <ArrowUpRight size={14} />
          </Link>
        </motion.div>
      </section>

      {/* 
        ========================================================================
        HOW WE HELP / STARTUP JOURNEY (6 Blocks)
        ========================================================================
      */}
      <section className="home-acceleration-section" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(48px, 8vw, 100px) 1rem'
      }}>
        <div style={{
          marginBottom: '3rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          borderBottom: '1px solid var(--color-graphite, #212121)',
          paddingBottom: '1.5rem'
        }}>
          <h3 style={{
            fontFamily: 'var(--font-aeonik, "Inter", sans-serif)',
            fontSize: '14px',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-smoke, #9c9c9c)',
            margin: 0
          }}>
            STARTUP ACCELERATION
          </h3>
          <span style={{
            fontFamily: 'var(--font-input, monospace)',
            fontSize: '13px',
            color: 'var(--color-smoke, #9c9c9c)'
          }}>
            [ 01 — 06 ]
          </span>
        </div>

        {/* 6-Block Grid Frame (Uses 1px gap hack for perfect borders regardless of wrap) */}
        <div className="home-acceleration-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
          backgroundColor: 'var(--color-graphite, #212121)',
          gap: '1px',
          border: '1px solid var(--color-graphite, #212121)'
        }}>
          {/* Cell 1: Idea Validation */}
          <div style={{
            padding: 'clamp(24px, 5vw, 48px)',
            backgroundColor: '#000000' // Matches page background
          }}>
            <Target size={32} strokeWidth={1.5} color="var(--color-compass-gold, #6f6759)" style={{ marginBottom: '1.5rem' }} />
            <h4 style={{
              fontSize: '14px',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-chalk, #f3f3f3)',
              margin: '0 0 1rem 0'
            }}>
              IDEA VALIDATION
            </h4>
            <p style={{
              fontSize: '14px',
              fontWeight: 400,
              color: 'var(--color-smoke, #9c9c9c)',
              lineHeight: 1.5,
              margin: 0
            }}>
              Pitch your ideas to peers and faculty mentors to get early, honest feedback and test your core hypotheses before you start building.
            </p>
          </div>

          {/* Cell 2: Mentorship */}
          <div style={{
            padding: 'clamp(24px, 5vw, 48px)',
            backgroundColor: '#000000'
          }}>
            <Compass size={32} strokeWidth={1.5} color="var(--color-compass-gold, #6f6759)" style={{ marginBottom: '1.5rem' }} />
            <h4 style={{
              fontSize: '14px',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-chalk, #f3f3f3)',
              margin: '0 0 1rem 0'
            }}>
              MENTORSHIP & ADVISORY
            </h4>
            <p style={{
              fontSize: '14px',
              fontWeight: 400,
              color: 'var(--color-smoke, #9c9c9c)',
              lineHeight: 1.5,
              margin: 0
            }}>
              Connect with our growing network of university alumni and professors who can guide you through the crucial early stages of your startup.
            </p>
          </div>

          {/* Cell 3: Talent */}
          <div style={{
            padding: 'clamp(24px, 5vw, 48px)',
            backgroundColor: '#000000'
          }}>
            <Users size={32} strokeWidth={1.5} color="var(--color-compass-gold, #6f6759)" style={{ marginBottom: '1.5rem' }} />
            <h4 style={{
              fontSize: '14px',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-chalk, #f3f3f3)',
              margin: '0 0 1rem 0'
            }}>
              CO-FOUNDER MATCHING
            </h4>
            <p style={{
              fontSize: '14px',
              fontWeight: 400,
              color: 'var(--color-smoke, #9c9c9c)',
              lineHeight: 1.5,
              margin: 0
            }}>
              Meet passionate students across campus—from engineering to design to business—to form a well-rounded and capable founding team.
            </p>
          </div>

          {/* Cell 4: Infrastructure */}
          <div style={{
            padding: 'clamp(24px, 5vw, 48px)',
            backgroundColor: '#000000'
          }}>
            <Cpu size={32} strokeWidth={1.5} color="var(--color-compass-gold, #6f6759)" style={{ marginBottom: '1.5rem' }} />
            <h4 style={{
              fontSize: '14px',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-chalk, #f3f3f3)',
              margin: '0 0 1rem 0'
            }}>
              WORKSPACE & RESOURCES
            </h4>
            <p style={{
              fontSize: '14px',
              fontWeight: 400,
              color: 'var(--color-smoke, #9c9c9c)',
              lineHeight: 1.5,
              margin: 0
            }}>
              A dedicated, collaborative environment on campus where you can brainstorm, work together, and build your initial prototypes.
            </p>
          </div>

          {/* Cell 5: Workshops */}
          <div style={{
            padding: 'clamp(24px, 5vw, 48px)',
            backgroundColor: '#000000'
          }}>
            <TrendingUp size={32} strokeWidth={1.5} color="var(--color-compass-gold, #6f6759)" style={{ marginBottom: '1.5rem' }} />
            <h4 style={{
              fontSize: '14px',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-chalk, #f3f3f3)',
              margin: '0 0 1rem 0'
            }}>
              WORKSHOPS & BOOTCAMPS
            </h4>
            <p style={{
              fontSize: '14px',
              fontWeight: 400,
              color: 'var(--color-smoke, #9c9c9c)',
              lineHeight: 1.5,
              margin: 0
            }}>
              Learn the fundamentals of entrepreneurship through our foundational bootcamps, guest lectures, and practical skill-building sessions.
            </p>
          </div>

          {/* Cell 6: Funding */}
          <div style={{
            padding: 'clamp(24px, 5vw, 48px)',
            backgroundColor: '#000000'
          }}>
            <Rocket size={32} strokeWidth={1.5} color="var(--color-compass-gold, #6f6759)" style={{ marginBottom: '1.5rem' }} />
            <h4 style={{
              fontSize: '14px',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-chalk, #f3f3f3)',
              margin: '0 0 1rem 0'
            }}>
              EARLY SUPPORT & GUIDANCE
            </h4>
            <p style={{
              fontSize: '14px',
              fontWeight: 400,
              color: 'var(--color-smoke, #9c9c9c)',
              lineHeight: 1.5,
              margin: 0
            }}>
              Get strategic guidance on participating in B-plan competitions and navigating external incubation programs to take your very first steps.
            </p>
          </div>
        </div>
      </section>

      {/* 1px Hairline Section Divider Line */}
      <div style={{
        width: '100%',
        height: '1px',
        backgroundColor: 'var(--color-graphite, #212121)'
      }} />

      {/* 
        ========================================================================
        FOOTER (Creative & Bold)
        ========================================================================
      */}
      <footer className="home-footer" style={{
        width: '100%',
        padding: 'clamp(40px, 8vw, 80px) 1rem 20px 1rem',
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        <div style={{
          maxWidth: '1200px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
          gap: 'clamp(24px, 4vw, 40px)',
          marginBottom: '60px',
          paddingBottom: '40px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Brand & Vision */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '20px', marginBottom: '1rem', fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '-0.5px' }}>E-CELL UCEOU</h4>
            <p style={{ color: '#9c9c9c', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
              Building the next generation of exceptional founders. 
              Where raw ideas meet flawless execution.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '13px', marginBottom: '1.2rem', fontFamily: 'var(--font-input, monospace)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Explore</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#9c9c9c' }}>
              <Link to="/initiatives" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#9c9c9c'}>Initiatives</Link>
              <Link to="/events" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#9c9c9c'}>Events</Link>
              <Link to="/team" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#9c9c9c'}>Team</Link>
            </div>
          </div>
          
          {/* Contact & Socials */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '13px', marginBottom: '1.2rem', fontFamily: 'var(--font-input, monospace)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Connect</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#9c9c9c' }}>
              <a href="mailto:edcell@uceou.edu" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#9c9c9c'}>edcell@uceou.edu</a>
              <a href="https://www.instagram.com/ecell_uceou" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#9c9c9c'}>Instagram ↗</a>
              <a href="https://whatsapp.com/channel/0029Vb8TGWbJUM2WbnFyKj0I" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#9c9c9c'}>WhatsApp Channel ↗</a>
            </div>
          </div>
        </div>

        {/* Massive Typography Marquee/Sign-off */}
        <div style={{ 
          width: '100%', 
          overflow: 'hidden', 
          display: 'flex', 
          marginBottom: '20px'
        }}>
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
            style={{ display: 'flex', width: 'max-content' }}
          >
            {[...Array(4)].map((_, i) => (
              <h1 key={i} style={{
                fontSize: 'clamp(50px, 15vw, 250px)',
                fontWeight: 900,
                fontFamily: '"Space Grotesk", sans-serif',
                color: 'rgba(255, 255, 255, 0.18)',
                margin: 0,
                paddingRight: '80px', // Space between repeated phrases
                lineHeight: 0.85,
                letterSpacing: '-0.03em',
                whiteSpace: 'nowrap',
                userSelect: 'none'
              }}>
                ENTREPRENEURSHIP CELL
              </h1>
            ))}
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          width: '100%', 
          maxWidth: '1200px',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.3)',
          fontFamily: 'var(--font-input, monospace)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span>© 2026 E-CELL UCEOU</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span>
              website designed & developed by{' '}
              <a 
                href="https://www.linkedin.com/in/ronith-vardhan-rachakonda-10a248382" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '2px', transition: 'color 0.2s ease' }} 
                onMouseOver={(e) => e.target.style.color = '#fff'} 
                onMouseOut={(e) => e.target.style.color = 'inherit'}
              >
                Ronith vardhan
              </a>
            </span>
          </div>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.3)'} onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            Back to Top ↑
          </a>
        </div>
      </footer>
    </div>
  );
}
