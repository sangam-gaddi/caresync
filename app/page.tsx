"use client";
import "./landing.css";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

import Preloader, { isInitialLoad } from "@/components/landing/Preloader";
import DotMatrix from "@/components/landing/DotMatrix";
import BrandIcon from "@/components/landing/BrandIcon";
import MarqueeBanner from "@/components/landing/MarqueeBanner";
import TextBlock from "@/components/landing/TextBlock";
import PeelReveal from "@/components/landing/PeelReveal";
import CTA from "@/components/landing/CTA";
import Copy from "@/components/landing/Copy";
import Menu from "@/components/landing/Menu";
import Footer from "@/components/landing/Footer";
import ClientLayout from "@/components/landing/ClientLayout";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function Index() {
  const [loaderAnimating, setLoaderAnimating] = useState(isInitialLoad);
  const heroImgRef = useRef(null);
  const heroHeaderRef = useRef(null);
  const heroSectionRef = useRef(null);

  const handlePreloaderComplete = () => {
    setLoaderAnimating(false);
  };

  // Override body styles for landing page
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    const originalColor = document.body.style.color;
    const originalClassName = document.body.className;

    document.body.style.backgroundColor = "#edf1e8";
    document.body.style.color = "#0f0f0f";
    document.body.className = "";

    return () => {
      document.body.style.backgroundColor = originalBg;
      document.body.style.color = originalColor;
      document.body.className = originalClassName;
    };
  }, []);

  useGSAP(() => {
    if (!heroImgRef.current || !heroHeaderRef.current) return;

    gsap.set(heroImgRef.current, { y: 1000 });
    gsap.to(heroImgRef.current, {
      y: 0,
      duration: 0.75,
      ease: "power3.out",
      delay: isInitialLoad ? 5.75 : 1,
    });

    gsap.to(heroHeaderRef.current, {
      y: 150,
      ease: "none",
      scrollTrigger: {
        trigger: heroSectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  return (
    <div className="landing-root">
      <ClientLayout footer={<Footer />}>
        <Menu />
        <Preloader onAnimationComplete={handlePreloaderComplete} />

        <section className="hero" ref={heroSectionRef}>
          <DotMatrix
            color="#969992"
            dotSize={2}
            spacing={5}
            opacity={0.9}
            delay={isInitialLoad ? 6 : 1.125}
          />
          <div className="container">
            <div className="hero-header" ref={heroHeaderRef}>
              <Copy animateOnScroll={false} delay={isInitialLoad ? 5.5 : 0.65}>
                <h1>Intelligence for the Next Era of Health</h1>
              </Copy>
            </div>
          </div>
          <div className="hero-img" ref={heroImgRef}>
            <img src="/home/hero.png" alt="" />
          </div>
          <div className="section-footer">
            <Copy
              type="flicker"
              delay={isInitialLoad ? 7.5 : 0.65}
              animateOnScroll={false}
            >
              <p>Health Index</p>
            </Copy>
            <Copy
              type="flicker"
              delay={isInitialLoad ? 7.5 : 0.65}
              animateOnScroll={false}
            >
              <p>Model v.01</p>
            </Copy>
          </div>
        </section>

        <section className="about" id="features">
          <div className="container">
            <div className="about-copy">
              <Copy type="flicker">
                <p>Healthcare reduced to pure intelligence</p>
              </Copy>
              <Copy>
                <h3>
                  Our AI specialists are built for the precise, the fast, and
                  the quietly revolutionary.
                </h3>
              </Copy>
              <div className="about-icon">
                <BrandIcon />
              </div>
            </div>
          </div>
          <div className="section-footer light">
            <Copy type="flicker">
              <p>/ Core State /</p>
            </Copy>
          </div>
        </section>

        {/* Selected Garments section removed */}

        <MarqueeBanner />

        <TextBlock />

        <PeelReveal />

        <CTA />
      </ClientLayout>

      {/* Sign Up button (replaces Bag button) */}
      <div className="signup-button-container">
        <Link href="/onboarding">
          <button className="signup-btn">Sign Up</button>
        </Link>
      </div>
    </div>
  );
}