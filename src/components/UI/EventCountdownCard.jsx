import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Calendar, Clock, Users } from "lucide-react";
import "./EventCountdownCard.css";

export function EventCountdownCard({
  title = "React & AI Workshop",
  date,
  image = "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop",
  attendees = 42,
  onJoin,
  onClick,
  enableAnimations = true,
  className = "",
  status = "upcoming",
}) {
  // When no date is set, freeze everything at 0
  const dateKnown = date !== null && date !== undefined;
  
  // Convert string to Date if it comes from Supabase
  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  const [timeLeft, setTimeLeft] = useState(() => {
    if (!dateKnown) return 0;
    return Math.max(0, Math.floor((+parsedDate - Date.now()) / 1000)) || 0;
  });

  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = enableAnimations && !shouldReduceMotion;

  useEffect(() => {
    if (!dateKnown) return; // No date — don't run a timer
    const update = () => {
      const remaining = Math.max(0, Math.floor((+parsedDate - Date.now()) / 1000)) || 0;
      setTimeLeft(remaining);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [date, dateKnown]);

  const getTimeUnits = (seconds) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return { days: d, hours: h, minutes: m, seconds: s };
  };

  const { days, hours, minutes, seconds } = getTimeUnits(timeLeft);

  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.95,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
    rest: {
      scale: 1,
      y: 0,
      filter: "blur(0px)",
    },
    hover: shouldAnimate
      ? {
          scale: 1.03,
          y: -6,
          filter: "blur(0px)",
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8,
          },
        }
      : {},
  };

  const numberVariants = {
    initial: { scale: 1, opacity: 1 },
    pulse: {},  // Replaced with CSS animation for performance (avoids JS-driven repeat:Infinity)
  };

  const childVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 28,
        mass: 0.6,
      },
    },
  };

  const buttonVariants = {
    hidden: {
      opacity: 0,
      y: 15,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.7,
      },
    },
    rest: { scale: 1, y: 0 },
    hover: shouldAnimate
      ? {
          scale: 1.05,
          y: -2,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 25,
          },
        }
      : {},
    tap: shouldAnimate ? { scale: 0.95 } : {},
  };

  return (
    <motion.div
      initial={shouldAnimate ? "hidden" : "visible"}
      animate="visible"
      whileHover="hover"
      variants={containerVariants}
      className={`ecc-card ${className}`}
      onClick={onClick}
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        willChange: 'transform, filter'
      }}
    >
      {/* Image Container */}
      <motion.div
        className="ecc-image-container"
        variants={shouldAnimate ? childVariants : {}}
      >
        <motion.img
          src={image}
          alt={title}
          className="ecc-image"
          loading="lazy"
          decoding="async"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        <div className="ecc-image-gradient" />

        {/* Status Badge */}
        {status === 'postponed' || status === 'preponed' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ecc-badge-urgent"
            style={{ background: '#E5A900' }}
          >
            {status === 'postponed' ? 'Postponed' : 'Preponed'}
          </motion.div>
        ) : status === 'ended' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ecc-badge-urgent"
            style={{ background: 'var(--glass-border)', color: 'var(--text-secondary)' }}
          >
            Ended
          </motion.div>
        ) : (timeLeft <= 0 && dateKnown) || status === 'active' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ecc-badge-urgent"
            style={{
              background: 'rgba(22, 140, 131, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(74, 222, 128, 0.5)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#4ade80',
              boxShadow: '0 0 8px #4ade80',
              display: 'inline-block'
            }} />
            Active
          </motion.div>
        ) : timeLeft > 0 && timeLeft < 86400 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ecc-badge-urgent"
          >
            Starts Soon!
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ecc-badge-urgent"
            style={{
              background: 'rgba(22, 140, 131, 0.25)',
              border: '1px solid rgba(22, 140, 131, 0.4)',
              color: 'var(--ecell-teal, #168C83)',
              backdropFilter: 'blur(8px)'
            }}
          >
            Upcoming
          </motion.div>
        )}
      </motion.div>

      {/* Content */}
      <div className="ecc-content">
        {/* Title & Meta */}
        <motion.div className="ecc-title-container" variants={shouldAnimate ? childVariants : {}}>
          <motion.h3
            className="ecc-title"
            initial={{ opacity: 0.9 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {title}
          </motion.h3>

          <div className="ecc-meta">
            <div className="ecc-meta-item">
              <Calendar size={16} />
              <span>{dateKnown ? parsedDate.toLocaleDateString() : '--/--/26'}</span>
            </div>
            <div className="ecc-meta-item">
              <Users size={16} />
              <span>{attendees} registered</span>
            </div>
          </div>
        </motion.div>

        {/* Countdown Display */}
        {status === 'ended' ? (
          <motion.div variants={shouldAnimate ? childVariants : {}} className="ecc-started">
            <div className="ecc-started-title">Event Ended</div>
            <div className="ecc-started-subtitle">Thank you for participating!</div>
          </motion.div>
        ) : timeLeft > 0 ? (
          <motion.div className="ecc-countdown-section" variants={shouldAnimate ? childVariants : {}}>
            <div className="ecc-countdown-header">
              <Clock size={16} />
              <span>{status === 'postponed' || status === 'preponed' ? 'Rescheduled to:' : 'Event starts in:'}</span>
            </div>

            <div className="ecc-countdown-grid">
              {[
                { value: days, label: "Days" },
                { value: hours, label: "Hours" },
                { value: minutes, label: "Min" },
                { value: seconds, label: "Sec" },
              ].map((unit, index) => (
                <motion.div
                  key={unit.label}
                  variants={index === 3 ? numberVariants : {}} // Only seconds pulse
                  initial="initial"
                  animate={index === 3 ? "pulse" : "initial"}
                  className={`ecc-countdown-unit${index === 3 && shouldAnimate ? ' ecc-seconds-pulse' : ''}`}
                >
                  <div className="ecc-countdown-value">
                    {unit.value.toString().padStart(2, "0")}
                  </div>
                  <div className="ecc-countdown-label">{unit.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div variants={shouldAnimate ? childVariants : {}} className="ecc-started">
            <div className="ecc-started-title" style={{ color: 'var(--ecell-teal, #168C83)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80', display: 'inline-block' }} />
              Event is Active!
            </div>
            <div className="ecc-started-subtitle">Happening right now — join to participate</div>
          </motion.div>
        )}

        {/* Action Button */}
        <motion.button
          onClick={(e) => { e.stopPropagation(); (onJoin || onClick)?.(e); }}
          variants={buttonVariants}
          initial={shouldAnimate ? "hidden" : "visible"}
          animate="visible"
          whileHover="hover"
          whileTap="tap"
          className={dateKnown && status !== 'ended' ? "ecc-button" : "ecc-button ecc-button-tba"}
          style={dateKnown && status !== 'ended' ? {} : { cursor: 'default', pointerEvents: 'none', background: status === 'ended' ? 'rgba(255,255,255,0.05)' : '' }}
        >
          {status === 'ended' ? "Event Ended" : !dateKnown ? "Registrations are yet to open" : (timeLeft > 0 ? "Reserve Your Spot" : "Join Event (Active)")}
        </motion.button>
      </div>
    </motion.div>
  );
}
