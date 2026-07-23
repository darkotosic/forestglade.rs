"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AnimatedNumberProps = {
  value: number | string;
  className?: string;
  duration?: number;
};

const numberPattern = /-?\d+(?:[.,]\d{3})*(?:[.,]\d+)?|-?\d+/;

function getSeparators(raw: string) {
  const lastComma = raw.lastIndexOf(",");
  const lastDot = raw.lastIndexOf(".");
  const decimalSeparator = lastComma > lastDot ? "," : lastDot > lastComma ? "." : "";
  const decimalPlaces = decimalSeparator ? raw.length - raw.lastIndexOf(decimalSeparator) - 1 : 0;
  const thousandsSeparator =
    decimalSeparator === "," ? (raw.includes(".") ? "." : "") : raw.includes(",") ? "," : "";

  return { decimalPlaces, decimalSeparator, thousandsSeparator };
}

function parseNumericValue(raw: string) {
  const match = raw.match(numberPattern);

  if (!match) {
    return null;
  }

  const token = match[0];
  const { decimalPlaces, decimalSeparator, thousandsSeparator } = getSeparators(token);
  const withoutThousands = thousandsSeparator
    ? token.replace(new RegExp(`\\${thousandsSeparator}`, "g"), "")
    : token;
  const normalized = withoutThousands.replace(decimalSeparator, ".");
  const target = Number(normalized);

  if (!Number.isFinite(target)) {
    return null;
  }

  return {
    decimalPlaces,
    decimalSeparator: decimalSeparator || ".",
    end: match.index! + token.length,
    prefix: raw.slice(0, match.index),
    start: match.index!,
    suffix: raw.slice(match.index! + token.length),
    target,
    thousandsSeparator,
  };
}

function formatNumber(
  value: number,
  decimalPlaces: number,
  decimalSeparator: string,
  thousandsSeparator: string,
) {
  const fixed = value.toFixed(decimalPlaces);
  const [integer, decimal] = fixed.split(".");
  const grouped = thousandsSeparator
    ? integer.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)
    : integer;

  return decimalPlaces ? `${grouped}${decimalSeparator}${decimal}` : grouped;
}

export function AnimatedNumber({ value, className, duration = 1400 }: AnimatedNumberProps) {
  const rawValue = String(value);
  const parsed = useMemo(() => parseNumericValue(rawValue), [rawValue]);
  const [displayValue, setDisplayValue] = useState(rawValue);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!parsed) {
      return;
    }

    const element = elementRef.current;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!element || prefersReducedMotion) {
      return;
    }

    let frame = 0;
    let startTime: number | null = null;
    let observer: IntersectionObserver | null = null;

    const animate = (time: number) => {
      startTime ??= time;
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = parsed.target * eased;

      setDisplayValue(
        `${parsed.prefix}${formatNumber(current, parsed.decimalPlaces, parsed.decimalSeparator, parsed.thousandsSeparator)}${parsed.suffix}`,
      );

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(rawValue);
      }
    };

    const start = () => {
      setDisplayValue(
        `${parsed.prefix}${formatNumber(0, parsed.decimalPlaces, parsed.decimalSeparator, parsed.thousandsSeparator)}${parsed.suffix}`,
      );
      frame = requestAnimationFrame(animate);
    };

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
          observer?.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(element);

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [duration, parsed, rawValue]);

  return (
    <span ref={elementRef} className={className}>
      {displayValue}
    </span>
  );
}
