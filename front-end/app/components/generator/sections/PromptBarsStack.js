'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PromptBarCard from '../cards/PromptBarCard';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function useDesktopStackingEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mqDesktop = window.matchMedia('(min-width: 1024px)');
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    const update = () => setEnabled(mqDesktop.matches && !mqReduce.matches);
    update();

    mqDesktop.addEventListener?.('change', update);
    mqReduce.addEventListener?.('change', update);

    return () => {
      mqDesktop.removeEventListener?.('change', update);
      mqReduce.removeEventListener?.('change', update);
    };
  }, []);

  return enabled;
}

export default function PromptBarsStack({ items }) {
  const enabled = useDesktopStackingEnabled();
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const cardsRef = useRef([]);

  const stableItems = useMemo(() => items || [], [items]);

  useEffect(() => {
    if (!enabled) return undefined;
    if (!containerRef.current) return undefined;
    if (!listRef.current) return undefined;

    const cards = cardsRef.current.filter(Boolean);
    if (cards.length < 2) return undefined;

    let resizeTimer = null;

    const ctx = gsap.context(() => {
      const destroy = () => {
        ScrollTrigger.getById('prompt-bars-stack')?.kill();
      };

      const init = () => {
        destroy();

        // Stage: all cards are absolutely positioned in the same centered slot.
        // Then we "stack" non-active cards with a small Y offset so it matches the reference.
        const firstRect = cards[0].getBoundingClientRect();
        const stackGapY = 88;
        const maxVisibleBehind = Math.min(2, Math.max(0, cards.length - 1));
        const stageHeight = Math.max(1, Math.ceil(firstRect.height + maxVisibleBehind * stackGapY));

        gsap.set(listRef.current, { height: stageHeight });

        gsap.set(cards, { clearProps: 'transform,opacity' });
        gsap.set(cards, {
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          yPercent: -50,
          opacity: 0,
          scale: 0.96,
          zIndex: 1,
        });

        const renderStack = (activeIndex) => {
          cards.forEach((el, i) => {
            const rel = i - activeIndex;
            const absRel = Math.abs(rel);

            // Keep a couple of cards visible behind for the "stack" look
            const isVisible =
              i === activeIndex ||
              (rel > 0 && rel <= maxVisibleBehind) ||
              (rel < 0 && absRel <= maxVisibleBehind);

            const y = rel * stackGapY;
            const opacity = i === activeIndex ? 1 : Math.max(0.18, 1 - absRel * 0.35);
            const scale = i === activeIndex ? 1 : Math.max(0.9, 1 - absRel * 0.05);
            const zIndex = 50 - absRel;

            gsap.to(el, {
              y,
              opacity: isVisible ? opacity : 0,
              scale: isVisible ? scale : 0.96,
              zIndex,
              duration: 0.25,
              overwrite: true,
              ease: 'power2.out',
            });
          });
        };

        // Initial state
        renderStack(0);

        const stepScroll = Math.min(Math.max(window.innerHeight * 0.35, 320), 520);
        const scrollDistance = Math.max(1, (cards.length - 1) * stepScroll);
        let lastActive = 0;

        ScrollTrigger.create({
          id: 'prompt-bars-stack',
          trigger: containerRef.current,
          start: 'top top+=96', // account for sticky header
          end: `+=${scrollDistance}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          pinSpacing: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const activeIndex = Math.round(self.progress * (cards.length - 1));
            if (activeIndex !== lastActive) {
              lastActive = activeIndex;
              renderStack(activeIndex);
            }
          },
        });
      };

      const timeoutId = setTimeout(() => {
        init();
        ScrollTrigger.refresh();
      }, 60);

      const onResize = () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          init();
          ScrollTrigger.refresh();
        }, 160);
      };
      window.addEventListener('resize', onResize);

      return () => {
        clearTimeout(timeoutId);
        if (resizeTimer) clearTimeout(resizeTimer);
        window.removeEventListener('resize', onResize);
        destroy();
      };
    }, containerRef);

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      ctx.revert();
    };
  }, [enabled, stableItems.length]);

  return (
    <section ref={containerRef} className="relative">
      {/* Normal list layout (always correct). GSAP only transforms cards on desktop. */}
      <div ref={listRef} className={enabled ? 'relative' : 'space-y-10'}>
        {stableItems.map((item, idx) => (
          <div key={item.id} ref={(el) => (cardsRef.current[idx] = el)}>
            <PromptBarCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}


