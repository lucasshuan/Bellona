"use client";

import { Info } from "lucide-react";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface LabelTooltipProps {
  label: string;
  tooltip?: string;
  className?: string; // Container className
  labelClassName?: string; // Label specific className
  htmlFor?: string;
  required?: boolean;
}

export function LabelTooltip({
  label,
  tooltip,
  className,
  labelClassName,
  htmlFor,
  required,
}: LabelTooltipProps) {
  const [show, setShow] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updatePosition = () => {
    if (triggerRef.current && show) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 10,
        left: rect.left + rect.width / 2,
      });
    }
  };

  useLayoutEffect(() => {
    updatePosition();
  }, [show]);

  useEffect(() => {
    if (show) {
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [show]);

  return (
    <div
      ref={triggerRef}
      className={cn("relative flex items-center gap-1.5", className)}
      onMouseEnter={() => tooltip && setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div className="flex items-center gap-1">
        <label
          htmlFor={htmlFor}
          className={cn(
            "cursor-default text-sm font-medium text-white/70",
            labelClassName,
          )}
        >
          {label}
        </label>
        {required && <span className="text-primary ml-0.5 text-xs">*</span>}
      </div>

      {tooltip && (
        <div className="flex items-center">
          <Info
            className={cn(
              "size-3.5 cursor-default transition-colors",
              show ? "text-white/60" : "text-white/20",
            )}
          />
          {show &&
            createPortal(
              <div
                className="pointer-events-none fixed isolate z-[9999] w-64 -translate-x-1/2 -translate-y-full transform-gpu rounded-xl border border-white/20 bg-[#0a0a0a]/80 p-3 text-[11px] leading-relaxed text-white/80 shadow-2xl"
                style={{
                  top: position.top,
                  left: position.left,
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <div className="relative z-10">{tooltip}</div>
                <div
                  className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-white/20 bg-[#0a0a0a]/80"
                  style={{
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                />
              </div>,
              document.body,
            )}
        </div>
      )}
    </div>
  );
}
