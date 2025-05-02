import React, { useState, PropsWithChildren } from "react";

export interface CollapsibleProps extends PropsWithChildren {
  open?: boolean;
  trigger: React.ReactNode;
  className?: string;
}

export function Collapsible({ open: openProp, trigger, className, children }: CollapsibleProps) {
  const [open, setOpen] = useState(!!openProp);
  return (
    <div className={className}>
      <button
        className="underline text-blue-600 hover:text-blue-800 text-xs mb-1"
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        {trigger}
      </button>
      <div
        className="transition-all duration-200 overflow-hidden"
        style={{ maxHeight: open ? 1000 : 0, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
      >
        {open && <div className="pt-1">{children}</div>}
      </div>
    </div>
  );
}
