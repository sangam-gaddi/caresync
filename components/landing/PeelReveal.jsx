"use client";
import "./PeelReveal.css";
import { useRef, useEffect } from "react";

import Copy from "./Copy";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const PeelReveal = () => {
  const peelRevealContainerRef = useRef(null);

  useEffect(() => {
    const container = peelRevealContainerRef.current;
    if (!container) return;

    let timer = null;

    const ctx = gsap.context(() => {
      timer = setTimeout(() => {
        const section = container.querySelector(".peel-reveal");
        if (!section) return;

        const imageContainer = section.querySelector(
          ".peel-reveal-img-container"
        );
        const introTexts = Array.from(
          section.querySelectorAll(".peel-reveal-intro-text")
        );
        const maskLayers = Array.from(section.querySelectorAll(".mask"));
        const header = section.querySelector(".peel-reveal-header h1");

        if (!imageContainer || !header) return;

        const splitText = new SplitText(header, { type: "words" });
        const words = splitText.words;
        gsap.set(words, { opacity: 0 });

        maskLayers.forEach((layer, i) => {
          gsap.set(layer, { scale: 0.9 - i * 0.2 });
        });
        gsap.set(imageContainer, { scale: 0 });

        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight * 4}`,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;

            gsap.set(imageContainer, { scale: progress });

            if (progress >= 0.25 && progress <= 0.9) {
              const borderRadiusProgress = (progress - 0.25) / 0.65;
              const borderRadiusValue = 3 * (1 - borderRadiusProgress);
              gsap.set(imageContainer, {
                borderRadius: `${borderRadiusValue}rem`,
              });
            } else if (progress < 0.25) {
              gsap.set(imageContainer, { borderRadius: "3rem" });
            } else if (progress > 0.9) {
              gsap.set(imageContainer, { borderRadius: "0rem" });
            }

            maskLayers.forEach((layer, i) => {
              const initialScale = 0.9 - i * 0.2;
              const layerProgress = Math.min(progress / 0.9, 1);
              const currentScale =
                initialScale + layerProgress * (1 - initialScale);
              gsap.set(layer, { scale: currentScale });
            });

            if (progress <= 0.9) {
              const textProgress = progress / 0.9;
              const moveDistance = window.innerWidth * 0.55;
              gsap.set(introTexts[0], { x: -textProgress * moveDistance });
              gsap.set(introTexts[1], { x: textProgress * moveDistance });
            }

            if (progress >= 0.6 && progress <= 0.9) {
              const headerProgress = (progress - 0.6) / 0.3;
              const totalWords = words.length;

              words.forEach((word, i) => {
                const wordStartDelay = i / totalWords;
                const wordEndDelay = (i + 1) / totalWords;
                let wordOpacity = 0;

                if (headerProgress >= wordEndDelay) {
                  wordOpacity = 1;
                } else if (headerProgress >= wordStartDelay) {
                  const wordProgress =
                    (headerProgress - wordStartDelay) /
                    (wordEndDelay - wordStartDelay);
                  wordOpacity = wordProgress;
                }

                gsap.set(word, { opacity: wordOpacity });
              });
            } else if (progress < 0.6) {
              gsap.set(words, { opacity: 0 });
            } else if (progress > 0.9) {
              gsap.set(words, { opacity: 1 });
            }
          },
        });
      }, 500);
    }, container);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      ctx.revert();
    };
  }, []);

  return (
    <div className="peel-reveal-container" ref={peelRevealContainerRef}>
      <section className="peel-reveal">
        <div className="section-header">
          <Copy type="flicker">
            <p>Signal type: Medical</p>
          </Copy>
          <Copy type="flicker">
            <p>Module ID: CareSync_001</p>
          </Copy>
        </div>
        <div className="section-footer">
          <Copy type="flicker">
            <p>Status: Active</p>
          </Copy>
        </div>
        <div className="peel-reveal-img-container">
          <div className="pr-img">
            <img src="/peel-reveal/peel-reveal-img.jpg" alt="Peel reveal" />
          </div>
          <div className="pr-img mask">
            <img src="/peel-reveal/peel-reveal-img.jpg" alt="" />
          </div>
          <div className="pr-img mask">
            <img src="/peel-reveal/peel-reveal-img.jpg" alt="" />
          </div>
          <div className="pr-img mask">
            <img src="/peel-reveal/peel-reveal-img.jpg" alt="" />
          </div>
          <div className="pr-img mask">
            <img src="/peel-reveal/peel-reveal-img.jpg" alt="" />
          </div>
          <div className="pr-img mask">
            <img src="/peel-reveal/peel-reveal-img.jpg" alt="" />
          </div>
          <div className="pr-img mask">
            <img src="/peel-reveal/peel-reveal-img.jpg" alt="" />
          </div>
          <div className="peel-reveal-header">
            <h1>The AI holds no bias in its diagnosis</h1>
          </div>
        </div>
        <div className="peel-reveal-intro-text-container">
          <div className="peel-reveal-intro-text">
            <h1>Signal</h1>
          </div>
          <div className="peel-reveal-intro-text">
            <h1>Health</h1>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PeelReveal;
