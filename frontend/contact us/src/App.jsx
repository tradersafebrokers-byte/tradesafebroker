import React, { useState } from 'react';
import { User, Mail, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import './App.css';

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

function App() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const planeControls = useAnimation();
  const colorControls = useAnimation();
  const windControls = useAnimation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    // 1. Fly to center fast
    await planeControls.start({ x: 200, y: 30, scale: 1.2, rotate: 10, transition: { duration: 0.6, ease: "easeOut" } });

    // 2. Turn green (only stops for this)
    await colorControls.start("green");

    // 3. Start wind animation
    windControls.start(i => ({
      pathLength: [0, 0.5, 0],
      pathOffset: [0, 0.5, 1],
      opacity: [0, 1, 0],
      transition: { repeat: Infinity, duration: 0.5, ease: "linear", delay: i * 0.15 }
    }));

    // Fly away to top right
    planeControls.start({ x: 1200, y: -800, scale: 0.8, rotate: -15, transition: { duration: 1.0, ease: "easeIn" } });

    // 4. Show success message exactly as it hits the corner (slightly before full completion)
    setTimeout(() => {
      setShowSuccess(true);
    }, 700);
  };

  return (
    <div className="container">
      <div className="card-wrapper">
        <div className="card">

          {/* Background circles on the left side */}
          <div className="bg-circle bg-circle-1"></div>
          <div className="bg-circle bg-circle-2"></div>
          <div className="bg-circle bg-circle-3"></div>
          <div className="bg-circle bg-circle-4"></div>

          <div className="illustration-side">
            <motion.svg
              className="paper-plane-svg"
              viewBox="0 0 200 200"
              width="280"
              height="280"
              style={{ overflow: 'visible' }}
              initial={{ x: -20, y: 20, scale: 1, rotate: 0 }}
              animate={planeControls}
            >
              {/* Motion lines fade out on submit */}
              <motion.g animate={{ opacity: isSubmitted ? 0 : 1 }} transition={{ duration: 0.3 }}>
                <path d="M30 150 L15 165" stroke="#444" strokeWidth="6" strokeLinecap="round" />
                <path d="M50 170 L35 185" stroke="#444" strokeWidth="6" strokeLinecap="round" />
                <path d="M70 150 L55 165" stroke="#444" strokeWidth="6" strokeLinecap="round" />
              </motion.g>

              {/* Wind lines for flying away */}
              <g stroke="#d1d5db" strokeWidth="3" strokeLinecap="round">
                <motion.line custom={0} x1="25" y1="105" x2="-120" y2="170" initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }} animate={windControls} />
                <motion.line custom={1} x1="85" y1="130" x2="-60" y2="195" initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }} animate={windControls} />
                <motion.line custom={2} x1="130" y1="175" x2="-15" y2="240" initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }} animate={windControls} />
                <motion.line custom={3} x1="50" y1="100" x2="-95" y2="165" initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }} animate={windControls} />
              </g>

              <g stroke="#444" strokeWidth="5" strokeLinejoin="round">
                <motion.polygon
                  points="85,130 95,165 170,40"
                  initial={{ fill: "#e25877" }}
                  variants={{ green: { fill: "#2b8a3e", transition: { duration: 0.5 } } }}
                  animate={colorControls}
                />
                <motion.polygon
                  points="85,130 170,40 130,175"
                  initial={{ fill: "#ffb49e" }}
                  variants={{ green: { fill: "#8ce99a", transition: { duration: 0.5 } } }}
                  animate={colorControls}
                />
                <motion.polygon
                  points="25,105 85,130 170,40"
                  initial={{ fill: "#ed84a1" }}
                  variants={{ green: { fill: "#51cf66", transition: { duration: 0.5 } } }}
                  animate={colorControls}
                />
                <motion.polygon
                  points="25,105 75,135 170,40"
                  initial={{ fill: "#ffc3b2" }}
                  variants={{ green: { fill: "#b2f2bb", transition: { duration: 0.5 } } }}
                  animate={colorControls}
                />
              </g>
              <circle cx="140" cy="115" r="2.5" fill="#444" />
            </motion.svg>
          </div>

          <div className="form-side">
            <div className="header">
              <h2 style={{ width: '100%', textAlign: 'center', marginBottom: '20px' }}>Contact us</h2>
            </div>

            <div style={{ width: '100%', position: 'relative' }}>
              <motion.form
                onSubmit={handleSubmit}
                animate={{
                  opacity: isSubmitted ? 0 : 1,
                  scale: isSubmitted ? 0.95 : 1,
                  filter: isSubmitted ? 'blur(4px)' : 'none'
                }}
                transition={{ duration: 0.4 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', pointerEvents: isSubmitted ? 'none' : 'auto' }}
              >
                <div className="input-group">
                  <User className="input-icon" size={20} />
                  <input type="text" placeholder="Full name" required />
                </div>

                <div className="input-group">
                  <Mail className="input-icon" size={20} />
                  <input type="email" placeholder="Email address" defaultValue="text@gmail.com" required />
                </div>

                <div className="input-group textarea-group">
                  <textarea placeholder="Message..." required></textarea>
                </div>

                <button type="submit" className="submit-btn">
                  Submit <ArrowRight size={18} />
                </button>
              </motion.form>

              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                >
                  <motion.svg width="80" height="80" viewBox="0 0 50 50" style={{ marginBottom: '20px' }}>
                    <motion.circle cx="25" cy="25" r="22" fill="none" stroke="#2b8a3e" strokeWidth="3"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: "easeInOut" }} />
                    <motion.path d="M16 26 l6 6 l12 -12" fill="none" stroke="#2b8a3e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }} />
                  </motion.svg>
                  <h3 style={{ color: '#2b8a3e', fontSize: '28px', margin: '0 0 10px' }}>Sent Successfully!</h3>
                  <p style={{ color: '#666', margin: 0, fontWeight: 500 }}>
                    We'll be in touch soon.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div className="pill-decor pill-left-top"></div>
        <div className="pill-decor pill-left-bottom"></div>
        <div className="pill-decor pill-right-top"></div>
        <div className="pill-decor pill-right-bottom"></div>

        <div className="socials">
          <div className="social-icon facebook"><FacebookIcon /></div>
          <div className="social-icon twitter"><TwitterIcon /></div>
          <div className="social-icon instagram"><InstagramIcon /></div>
        </div>
      </div>
    </div>
  );
}

export default App;