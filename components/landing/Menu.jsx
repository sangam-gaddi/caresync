"use client";
import "./Menu.css";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const menuRef = useRef(null);
  const menuOverlayRef = useRef(null);
  const hamburgerRef = useRef(null);
  const splitTextsRef = useRef([]);
  const mainLinkSplitsRef = useRef([]);
  const lastScrollY = useRef(0);

  const scrambleText = (elements, duration = 0.4) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

    elements.forEach((char) => {
      const originalText = char.textContent;
      let iterations = 0;
      const maxIterations = Math.floor(Math.random() * 6) + 3;

      gsap.set(char, { opacity: 1 });

      const scrambleInterval = setInterval(() => {
        char.textContent = chars[Math.floor(Math.random() * chars.length)];
        iterations++;

        if (iterations >= maxIterations) {
          clearInterval(scrambleInterval);
          char.textContent = originalText;
        }
      }, 25);

      setTimeout(() => {
        clearInterval(scrambleInterval);
        char.textContent = originalText;
      }, duration * 1000);
    });
  };

  const openMenu = () => {
    setIsOpen(true);
    setIsAnimating(true);

    if (hamburgerRef.current) {
      hamburgerRef.current.classList.add("open");
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
      },
    });

    tl.to(menuOverlayRef.current, {
      duration: 0.75,
      scaleY: 1,
      ease: "power4.out",
    });

    const allWords = mainLinkSplitsRef.current.reduce((acc, split) => {
      return acc.concat(split.words);
    }, []);

    tl.to(
      allWords,
      {
        duration: 0.75,
        yPercent: 0,
        stagger: 0.1,
        ease: "power4.out",
      },
      "-=0.5"
    );

    const subCols = menuOverlayRef.current.querySelectorAll(
      ".menu-overlay-sub-col"
    );
    subCols.forEach((col) => {
      const links = col.querySelectorAll(".menu-sub-links a");
      tl.to(
        links,
        {
          duration: 0.75,
          y: 0,
          opacity: 1,
          stagger: 0.05,
          ease: "power4.out",
        },
        "<"
      );
    });

    tl.add(() => {
      splitTextsRef.current.forEach((split) => {
        split.chars.forEach((char, index) => {
          setTimeout(() => {
            scrambleText([char], 0.4);
          }, index * 30);
        });
      });
    }, "<");
  };

  const closeMenu = () => {
    setIsOpen(false);
    setIsAnimating(true);

    if (hamburgerRef.current) {
      hamburgerRef.current.classList.remove("open");
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
      },
    });

    tl.add(() => {
      const allChars = splitTextsRef.current.reduce((acc, split) => {
        return acc.concat(split.chars);
      }, []);
      gsap.to(allChars, { opacity: 0, duration: 0.2 });
    });

    const subCols = menuOverlayRef.current.querySelectorAll(
      ".menu-overlay-sub-col"
    );
    subCols.forEach((col) => {
      const links = col.querySelectorAll(".menu-sub-links a");
      tl.to(
        links,
        {
          duration: 0.3,
          y: 50,
          opacity: 0,
          stagger: -0.05,
          ease: "power3.in",
        },
        "<"
      );
    });

    const allWords = mainLinkSplitsRef.current.reduce((acc, split) => {
      return acc.concat(split.words);
    }, []);

    tl.to(
      allWords,
      {
        duration: 0.3,
        yPercent: 120,
        stagger: -0.05,
        ease: "power3.in",
      },
      "<"
    );

    tl.to(
      menuOverlayRef.current,
      {
        duration: 0.5,
        scaleY: 0,
        ease: "power3.inOut",
      },
      "-=0.1"
    );
  };

  const toggleMenu = () => {
    if (isAnimating) return;

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const handleLinkClick = () => {
    if (isOpen) {
      setTimeout(() => {
        closeMenu();
      }, 500);
    }
  };

  useEffect(() => {
    gsap.set(menuOverlayRef.current, {
      scaleY: 0,
      transformOrigin: "top center",
    });

    const scrambleElements = menuOverlayRef.current.querySelectorAll(
      ".menu-items-header p, .menu-social a"
    );

    splitTextsRef.current = [];

    scrambleElements.forEach((element) => {
      const split = new SplitText(element, {
        type: "chars",
      });
      splitTextsRef.current.push(split);

      gsap.set(split.chars, {
        opacity: 0,
      });
    });

    const mainLinks =
      menuOverlayRef.current.querySelectorAll(".menu-main-link h4");
    mainLinkSplitsRef.current = [];

    mainLinks.forEach((element) => {
      const split = new SplitText(element, {
        type: "words",
        mask: "words",
      });
      mainLinkSplitsRef.current.push(split);

      gsap.set(split.words, {
        yPercent: 120,
      });
    });

    const subLinks =
      menuOverlayRef.current.querySelectorAll(".menu-sub-links a");
    gsap.set(subLinks, {
      y: 50,
      opacity: 0,
    });
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      if (menuRef.current && !isMenuVisible) {
        menuRef.current.classList.remove("hidden");
        setIsMenuVisible(true);
      }
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        if (isOpen) {
          closeMenu();
        }
        if (isMenuVisible) {
          menuRef.current.classList.add("hidden");
          setIsMenuVisible(false);
        }
      } else if (currentScrollY < lastScrollY.current) {
        if (!isMenuVisible) {
          menuRef.current.classList.remove("hidden");
          setIsMenuVisible(true);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen, isMenuVisible, isMobile]);

  return (
    <nav className="menu" ref={menuRef}>
      <div className="menu-header" onClick={toggleMenu}>
        <h4 className="menu-logo">CareSync</h4>
        <button className="menu-toggle" aria-label="Toggle menu">
          <div className="menu-hamburger-icon" ref={hamburgerRef}>
            <span className="menu-item"></span>
            <span className="menu-item"></span>
          </div>
        </button>
      </div>

      <div className="menu-overlay" ref={menuOverlayRef}>
        <div className="menu-overlay-items">
          <div className="menu-overlay-col menu-overlay-col-sm">
            <div className="menu-items-header">
              <p>Root</p>
            </div>
            <div className="menu-main-links">
              <Link
                href="/"
                className="menu-main-link"
                onClick={handleLinkClick}
              >
                <h4>Index</h4>
              </Link>
              <Link
                href="/os"
                className="menu-main-link"
                onClick={handleLinkClick}
              >
                <h4>A.I Specialists</h4>
              </Link>
              <Link
                href="#dataset"
                className="menu-main-link"
                onClick={handleLinkClick}
              >
                <h4>Dataset Trained</h4>
              </Link>
            </div>
          </div>
          <div className="menu-overlay-col menu-overlay-col-lg">
            <div className="menu-overlay-sub-col">
              <div className="menu-items-header">
                <p>Subsystems</p>
              </div>
              <div className="menu-sub-links">
                <Link href="/os" onClick={handleLinkClick}>
                  Health Dashboard
                </Link>
                <Link href="/onboarding" onClick={handleLinkClick}>
                  Get Started
                </Link>
                <Link href="#features" onClick={handleLinkClick}>
                  Features
                </Link>
              </div>
            </div>
            <div className="menu-overlay-sub-col">
              <div className="menu-items-header">
                <p>AI Modules</p>
              </div>
              <div className="menu-sub-links menu-product-links">
                <Link href="/os" onClick={handleLinkClick}>
                  01. Health Avatar
                </Link>
                <Link href="/os" onClick={handleLinkClick}>
                  02. AI Doctor
                </Link>
                <Link href="/os" onClick={handleLinkClick}>
                  03. Diagnostics
                </Link>
                <Link href="/os" onClick={handleLinkClick}>
                  04. Insights
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="menu-overlay-footer">
          <div className="menu-social">
            <a
              href="#"
              onClick={handleLinkClick}
            >
              Twitter
            </a>
          </div>
          <div className="menu-social">
            <a
              href="#"
              onClick={handleLinkClick}
            >
              Instagram
            </a>
          </div>
          <div className="menu-social">
            <a
              href="#"
              onClick={handleLinkClick}
            >
              YouTube
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Menu;
