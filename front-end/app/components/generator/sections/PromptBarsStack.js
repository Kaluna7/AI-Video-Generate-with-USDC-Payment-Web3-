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
  const cardsRef = useRef([]);

  const stableItems = useMemo(() => items || [], [items]);

  useEffect(() => {
    if (!enabled) return undefined;
    if (!containerRef.current) return undefined;

    const cards = cardsRef.current.filter(Boolean);
    if (cards.length < 2) return undefined;

    let resizeTimer = null;

    const ctx = gsap.context(() => {
      const destroy = () => {
        ScrollTrigger.getById('prompt-bars-stack')?.kill();
      };

      const init = () => {
        destroy();

        // Reset to "normal list" first (matches reference)
        gsap.set(cards, { clearProps: 'transform,opacity' });
        gsap.set(cards, { opacity: 1, scale: 1, y: 0 });
        gsap.set(cards, { position: 'relative', zIndex: 1 });

        // Measure list positions and compute how much each card must move to align to
        // a stable "active slot" centered in the viewport.
        const firstRect = cards[0].getBoundingClientRect();
        const activeSlotTop = Math.round(window.innerHeight * 0.5 - firstRect.height * 0.5);
        const deltas = cards.map((el) => el.getBoundingClientRect().top - activeSlotTop);

        const stackGapY = 88;
        // Reduce pinned scroll distance per step so card #3 doesn't feel "too far" to reach.
        // Keep it consistent across steps (1->2 and 2->3 feel the same).
        const stepScroll = Math.min(Math.max(window.innerHeight * 0.32, 260), 360);
        const scrollDistance = Math.max(1, (cards.length - 1) * stepScroll);

        const tl = gsap.timeline({
          defaults: { duration: 1, ease: 'none' },
        });

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
          animation: tl,
        });

        // Step-based: each step promotes the next card, stacks previous cards above it.
        for (let activeIndex = 0; activeIndex < cards.length - 1; activeIndex += 1) {
          const t = activeIndex;
          const nextIndex = activeIndex + 1;

          // Bring next card into the "active slot" (where card 1 started)
          tl.set(cards[nextIndex], { zIndex: 30 }, t);
          tl.to(cards[nextIndex], { y: -deltas[nextIndex], opacity: 1, scale: 1 }, t);

          // Stack previous cards above the active slot
          for (let i = 0; i <= activeIndex; i += 1) {
            const stackPos = activeIndex - i + 1;
            tl.set(cards[i], { zIndex: 30 - stackPos }, t);
            tl.to(
              cards[i],
              {
                y: -deltas[i] - stackPos * stackGapY,
                opacity: Math.max(0.25, 1 - stackPos * 0.22),
                scale: Math.max(0.78, 1 - stackPos * 0.08),
              },
              t
            );
          }
        }
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
      <div className="space-y-10">
        {stableItems.map((item, idx) => (
          <div key={item.id} ref={(el) => (cardsRef.current[idx] = el)}>
            <PromptBarCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}


