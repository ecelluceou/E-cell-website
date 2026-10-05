import React from 'react';
import { motion } from 'framer-motion';
import { Badge, Award, Ticket, Lightbulb, Users, Rocket, Brain, Wrench, Trophy, ChevronRight } from 'lucide-react';
import { RadialBackground } from '../components/UI/RadialBackground';
import { SparklesCore } from '../components/UI/Sparkles';
import { HoverEffect } from '../components/UI/card-hover-effect';
import { CursorImageTrail } from '../components/UI/CursorImageTrail';

const benefits = [
  {
    icon: <Badge size={28} color="#168C83" />,
    title: "1. Official E-Cell Member Badge",
    description: "Every registered member gets an official E-Cell UCEOU membership badge — giving you a recognizable identity as part of the community.",
    color: "rgba(22,140,131,0.1)"
  },
  {
    icon: <Award size={28} className="text-[#E5A900]" />,
    title: "2. Digital Membership Certificate",
    description: "An official E-Cell UCEOU Digital Membership Certificate with your name, membership number and academic year.",
    color: "rgba(229,169,0,0.1)"
  },
  {
    icon: <Ticket size={28} className="text-[#168C83]" />,
    title: "3. Priority Event Access",
    description: "Members get early/priority registration for selected E-Cell events, workshops, founder sessions, competitions and special programs.",
    color: "rgba(22,140,131,0.1)"
  },
  {
    icon: <Lightbulb size={28} className="text-[#3157A4]" />,
    title: "4. Opportunity Drops",
    description: "Access to hackathons, startup competitions, internships, fellowships, and workshops. Basically: opportunities worth knowing about before you miss them.",
    color: "rgba(49,87,164,0.1)"
  },
  {
    icon: <Users size={28} className="text-[#E86F61]" />,
    title: "5. E-Cell Member Community",
    description: "Meet like-minded people, find teammates, developers/designers, discover potential co-founders, and connect with students who want to build.",
    color: "rgba(232,111,97,0.1)"
  },
  {
    icon: <Rocket size={28} color="#168C83" />,
    title: "6. Startup Idea Showcase",
    description: "Got a startup idea? The most promising ideas may be selected and showcased on the official website. Your idea could be the next one we put on the map.",
    color: "rgba(22,140,131,0.1)"
  },
  {
    icon: <Brain size={28} className="text-[#E5A900]" />,
    title: "7. Member-Only Sessions",
    description: "Exclusive interactions with founders, alumni, and industry professionals. Topics cover startup building, pitching, AI, marketing, and product development.",
    color: "rgba(229,169,0,0.1)"
  },
  {
    icon: <Wrench size={28} className="text-[#3157A4]" />,
    title: "8. Startup Toolkit",
    description: "Pitch-deck templates, Business Model Canvas, idea-validation frameworks, startup guides, and AI tools to move from “I have an idea” → “I'm building it.”",
    color: "rgba(49,87,164,0.1)"
  },
  {
    icon: <Trophy size={28} className="text-[#E86F61]" />,
    title: "9. Member-Only Challenges",
    description: "Exclusive challenges such as Idea Sprint, Pitch Battle, Problem Hunt, 48-Hour Build, and Startup Challenge with recognition and prizes.",
    color: "rgba(232,111,97,0.1)"
  }
];


export default function JoinUs() {
  const trailIcons = benefits.map(b => React.cloneElement(b.icon, { size: 32 }));
  return (
    <CursorImageTrail items={trailIcons}>
      <div style={{ position: 'relative', minHeight: '100vh', color: 'var(--text-primary)', overflow: 'hidden' }}>
        <RadialBackground />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <SparklesCore
          id="tsparticles-join"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={60}
          className="w-full h-full"
          particleColor="#168C83"
          speed={0.5}
        />
      </div>

      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: 'clamp(6rem, 12vw, 8rem) clamp(1rem, 5vw, 5vw) 4rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              background: 'rgba(22,140,131,0.1)',
              border: '1px solid rgba(22,140,131,0.2)',
              color: 'var(--brand-primary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              marginBottom: '1.5rem'
            }}
          >
            BECOME A MEMBER
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
            style={{
              fontSize: 'clamp(3rem, 7vw, 5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              fontFamily: 'var(--font-heading)',
              background: 'linear-gradient(135deg, #fff 20%, #71717a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              position: 'relative'
            }}
          >
            Don't just join a club.<br/>
            <motion.span 
              animate={{ 
                textShadow: ["0px 0px 0px rgba(22, 140, 131, 0)", "0px 0px 20px rgba(22, 140, 131, 0.5)", "0px 0px 0px rgba(22, 140, 131, 0)"] 
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ color: 'var(--brand-primary)', WebkitTextFillColor: 'var(--brand-primary)', display: 'inline-block' }}
            >
              Get into the ecosystem.
            </motion.span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto 2rem',
              lineHeight: 1.6
            }}
          >
            E-Cell UCEOU Membership unlocks a universe of opportunities, resources, and connections to help you move from “I have an idea” to “I'm building it.”
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}
          >
            <a
              href="https://forms.gle/CsDAGtae6nb88up38"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--brand-primary)',
                color: 'white',
                padding: '1rem 2.5rem',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '1.1rem',
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(22, 140, 131, 0.4)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              onFocus={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(22, 140, 131, 0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(22, 140, 131, 0.4)'; }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(22, 140, 131, 0.5)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(22, 140, 131, 0.4)'; }}
            >
              Join Now — ₹299/Year <ChevronRight size={20} />
            </a>
          </motion.div>
        </div>

        {/* Benefits Grid */}
        <div style={{ marginTop: '2rem' }}>
          <HoverEffect items={benefits} />
        </div>

        {/* Call to Action Footer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            marginTop: '5rem',
            padding: '4rem 2rem',
            background: 'linear-gradient(145deg, rgba(22,140,131,0.1) 0%, rgba(0,0,0,0) 100%)',
            borderRadius: '32px',
            border: '1px solid rgba(22,140,131,0.2)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>
            Ready to Build?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
            Get into the ecosystem. Discover opportunities, find collaborators, and build the future. Beyond the obvious.
          </p>
          <a
            href="https://forms.gle/CsDAGtae6nb88up38"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'white',
              color: 'var(--bg-dark)',
              padding: '1rem 3rem',
              borderRadius: '9999px',
              fontWeight: 800,
              fontSize: '1.2rem',
              textDecoration: 'none',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              boxShadow: '0 4px 20px rgba(255,255,255,0.2)'
            }}
            onFocus={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onBlur={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Get Membership — ₹299
          </a>
        </motion.div>
      </div>
      </div>
    </CursorImageTrail>
  );
}
