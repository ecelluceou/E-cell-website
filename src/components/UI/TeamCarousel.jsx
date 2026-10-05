import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { DEFAULT_TEAM } from "../../data/defaultTeam";


const LinkedinIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);
const InstagramIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);
import { Autoplay, EffectCreative, Pagination, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/effect-creative";
import "swiper/css/pagination";

export default function TeamCarousel() {
  const [teamMembers, setTeamMembers] = useState(DEFAULT_TEAM);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("team_members")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!cancelled && !error && data && data.length > 0) setTeamMembers(data);
      });
    return () => { cancelled = true; };
  }, []);

  const css = `
    .team-carousel-container {
      width: 100%;
      height: 480px;
      padding-bottom: 60px !important;
      position: relative;
    }
    
    .team-carousel-container .swiper-slide {
      background-position: center;
      background-size: cover;
      border-radius: 40px;
      clip-path: inset(0 round 40px); /* Strict clipping to fix WebKit 3D backdrop-filter bug */
      -webkit-clip-path: inset(0 round 40px);
      overflow: hidden;
      border: 1px solid var(--glass-border);
      background: var(--nav-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      
      /* Hardware acceleration fixes */
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
    }

    .swiper-slide-shadow {
      display: none !important;
    }

    .team-carousel-container .swiper-pagination-bullet {
      background-color: var(--brand-primary) !important;
      width: 10px;
      height: 10px;
      transition: all 0.3s ease;
    }
    
    .team-carousel-container .swiper-pagination-bullet-active {
      width: 24px;
      border-radius: 5px;
    }
    
    .nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--brand-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(228, 71, 46, 0.4);
      transition: all 0.3s ease;
    }
    
    .nav-btn:hover {
      transform: translateY(-50%) scale(1.1);
      background: var(--brand-secondary);
    }
    
    .nav-btn.swiper-button-disabled {
      opacity: 0;
      pointer-events: none;
    }
    
    .nav-prev { left: -25px; }
    .nav-next { right: -25px; }
    
    @media (max-width: 768px) {
      .team-card-inner {
        flex-direction: column !important;
      }
      .team-img-wrapper {
        flex: 0 0 200px !important;
      }
      .team-role {
        position: relative !important;
        bottom: 0 !important;
        right: 0 !important;
        margin-top: 1.5rem;
        text-align: right;
      }
    }
  `;

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
      <style>{css}</style>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Swiper
          spaceBetween={40}
          autoplay={{
            delay: 4000,
            disableOnInteraction: true,
          }}
          effect="creative"
          grabCursor={true}
          slidesPerView={1}
          centeredSlides={true}
          loop={true}
          pagination={{
            clickable: true,
          }}
          creativeEffect={{
            prev: {
              shadow: false,
              translate: ["-20%", 0, -400],
              opacity: 0,
            },
            next: {
              shadow: false,
              translate: ["100%", 0, 0],
            },
          }}
          navigation={{
            prevEl: '.custom-nav-prev',
            nextEl: '.custom-nav-next',
          }}
          modules={[EffectCreative, Pagination, Autoplay, Navigation]}
          className="team-carousel-container"
        >
          {teamMembers.map((member, index) => (
            <SwiperSlide key={member.id || index}>
              <div style={{ display: 'flex', height: '100%', width: '100%' }}>
                
                {/* Left side: Image */}
                <div style={{ width: '40%', height: '100%', position: 'relative' }}>
                  <img
                    src={member.image}
                    alt={member.name}
                    loading="lazy"
                    decoding="async"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to right, transparent 60%, var(--nav-bg) 100%)' }} />
                </div>
                
                {/* Right side: Content */}
                <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '60%', position: 'relative' }}>
                  
                  {/* Name */}
                  <h2 style={{ 
                    fontFamily: 'var(--font-heading)', 
                    fontSize: 'clamp(2rem, 4vw, 3.5rem)', 
                    color: 'var(--text-primary)', 
                    margin: '0 0 1rem 0',
                    lineHeight: '1.1',
                    textTransform: 'uppercase'
                  }}>
                    {member.name}
                  </h2>
                  
                  {/* Quote */}
                  <p style={{ 
                    fontSize: '1.25rem', 
                    color: 'var(--text-secondary)', 
                    fontStyle: 'italic', 
                    lineHeight: '1.6',
                    position: 'relative',
                    paddingLeft: '1rem',
                    borderLeft: '3px solid var(--brand-primary)',
                    maxWidth: '85%'
                  }}>
                    "{member.quote}"
                  </p>
                  
                  {/* Bottom Row: Socials & Role */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', position: 'relative', zIndex: 20, flexWrap: 'wrap', gap: '1rem' }}>
                    
                    {/* Social Handles */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {member.instagram && (
                        <a href={member.instagram} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--brand-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}>
                          <InstagramIcon size={24} />
                        </a>
                      )}
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--brand-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}>
                          <LinkedinIcon size={24} />
                        </a>
                      )}
                    </div>
                    
                    {/* Role */}
                    <div style={{
                      color: 'var(--brand-primary)',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      textAlign: 'right'
                    }}>
                      {member.role}
                    </div>
                  </div>
                  
                </div>
              </div>
            </SwiperSlide>
          ))}

          {/* Invisible Click Zones for Navigation */}
          <div className="custom-nav-prev" style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '15%', zIndex: 10, cursor: 'pointer' }} />
          <div className="custom-nav-next" style={{ position: 'absolute', top: 0, right: 0, bottom: '25%', width: '15%', zIndex: 10, cursor: 'pointer' }} />
          
        </Swiper>
      </motion.div>
    </div>
  );
}
