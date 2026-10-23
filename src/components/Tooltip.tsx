import { useState } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export default function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div 
          className={`absolute z-[100] px-2 py-1.5 text-[10px] font-medium font-sans text-slate-200 bg-slate-950/90 border border-white/10 rounded-lg shadow-xl backdrop-blur-md whitespace-nowrap pointer-events-none animate-fade-in ${positionClasses[position]}`}
          role="tooltip"
        >
          {content}
          <div 
            className={`absolute w-1.5 h-1.5 bg-slate-950 border-r border-b border-white/10 rotate-45 ${
              position === "top" ? "top-full left-1/2 -translate-x-1/2 -translate-y-[4px] border-l-0 border-t-0" : ""
            } ${
              position === "bottom" ? "bottom-full left-1/2 -translate-x-1/2 translate-y-[4px] border-r-0 border-b-0 border-l border-t" : ""
            } ${
              position === "left" ? "left-full top-1/2 -translate-y-1/2 -translate-x-[4px] border-b-0 border-r-0 border-l border-t" : ""
            } ${
              position === "right" ? "right-full top-1/2 -translate-y-1/2 translate-x-[4px] border-l-0 border-t-0 rotate-[225deg]" : ""
            }`}
          />
        </div>
      )}
    </div>
  );
}
