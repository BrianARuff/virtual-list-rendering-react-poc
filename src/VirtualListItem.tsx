import { ReactNode, useRef, useLayoutEffect } from "react";

/* ============================================================================
   VirtualListItem
   ----------------------------------------------------------------------------
   Wraps an item, measures its height using a ref, and positions it absolutely.
   When its height changes, it notifies the parent via onHeightChange.
=============================================================================== */
export type VirtualListItemProps = {
  index: number;
  top: number;
  onHeightChange: (index: number, height: number) => void;
  children: ReactNode;
};

export function VirtualListItem({
  index,
  top,
  onHeightChange,
  children,
}: VirtualListItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      const measuredHeight = ref.current.getBoundingClientRect().height;
      onHeightChange(index, measuredHeight);
    }
  }, [children, index, onHeightChange]);

  return (
    <div ref={ref} style={{ position: "absolute", top, width: "100%" }}>
      {children}
    </div>
  );
}
