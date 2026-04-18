"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  side?: "bottom" | "right";
  align?: "start" | "center" | "end";
  width?: number;
  openOnHover?: boolean;
}

function getDropdownCoords({
  element,
  side,
  align,
  customWidth,
}: {
  element: HTMLDivElement;
  side: "bottom" | "right";
  align: "start" | "center" | "end";
  customWidth?: number;
}) {
  const rect = element.getBoundingClientRect();
  const dropdownWidth = customWidth ?? Math.max(rect.width, 240);

  let finalSide = side;
  if (side === "right" && rect.right + dropdownWidth + 20 > window.innerWidth) {
    finalSide = "bottom";
  }

  if (finalSide === "right") {
    return {
      top: rect.top + window.scrollY,
      left: rect.right + window.scrollX + 12,
      width: dropdownWidth,
      actualSide: "right" as const,
    };
  }

  let left = rect.left + window.scrollX;
  if (align === "center") {
    left = rect.left + window.scrollX + rect.width / 2 - dropdownWidth / 2;
  } else if (align === "end") {
    left = rect.left + window.scrollX + rect.width - dropdownWidth;
  }

  return {
    top: rect.bottom + window.scrollY + 8,
    left: Math.max(12, left),
    width: dropdownWidth,
    actualSide: "bottom" as const,
  };
}

export function DropdownMenu({
  trigger,
  children,
  side = "bottom",
  align = "start",
  width: customWidth,
  openOnHover = false,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
    actualSide: side,
  });

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let frameId = 0;

    const handleViewportChange = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        if (!containerRef.current) return;

        setCoords(
          getDropdownCoords({
            element: containerRef.current,
            side,
            align,
            customWidth,
          }),
        );
      });
    };

    handleViewportChange();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [align, customWidth, isOpen, side]);

  const toggleDropdown = () => {
    if (!isOpen && containerRef.current) {
      setCoords(
        getDropdownCoords({
          element: containerRef.current,
          side,
          align,
          customWidth,
        }),
      );
    }
    setIsOpen(!isOpen);
  };

  const openDropdown = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    if (!containerRef.current) return;

    setCoords(
      getDropdownCoords({
        element: containerRef.current,
        side,
        align,
        customWidth,
      }),
    );
    setIsOpen(true);
  };

  const closeDropdown = () => {
    if (!openOnHover) {
      setIsOpen(false);
      return;
    }

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }

    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      closeTimeoutRef.current = null;
    }, 140);
  };

  return (
    <div
      className="relative w-fit"
      ref={containerRef}
      onMouseEnter={openOnHover ? openDropdown : undefined}
      onMouseLeave={openOnHover ? closeDropdown : undefined}
    >
      <div onClick={openOnHover ? undefined : toggleDropdown} className="w-fit cursor-pointer">
        {trigger}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              zIndex: 1000,
            }}
            className={cn(
              "animate-in fade-in zoom-in-95 glass-panel min-w-50 overflow-hidden rounded-2xl bg-[#0d0a14] p-1.5 shadow-2xl ring-1 ring-white/10",
              coords.actualSide === "right"
                ? "slide-in-from-left-2"
                : "slide-in-from-top-2",
            )}
            onMouseEnter={openOnHover ? openDropdown : undefined}
            onMouseLeave={openOnHover ? closeDropdown : undefined}
          >
            <div onClick={() => setIsOpen(false)}>{children}</div>
          </div>,
          document.body,
        )}
    </div>
  );
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ElementType;
  className?: string;
}

export function DropdownItem({
  children,
  onClick,
  icon: Icon,
  className,
}: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold whitespace-nowrap text-white/70 transition-all hover:bg-white/10 hover:text-white active:scale-[0.98]",
        className,
      )}
    >
      {Icon && <Icon className="size-4" />}
      {children}
    </button>
  );
}
