import { ReactNode, useMemo, useState } from "react";
import { VirtualListItem } from "./VirtualListItem";

/* ============================================================================
   VirtualListContent
   ----------------------------------------------------------------------------
   This component handles the virtualization logic without creating its own
   scroll container. It expects:
     - itemCount: total number of items,
     - estimatedItemHeight: an initial guess for each item’s height,
     - height: the height (in px) of the visible area,
     - scrollTop: the current scroll offset (provided by the parent),
     - overscan: extra items to render above and below,
     - children: a render function that receives an item index.
=============================================================================== */
export type VirtualListContentProps = {
  itemCount: number;
  estimatedItemHeight: number;
  height: number;
  scrollTop: number;
  overscan?: number;
  children: (index: number) => ReactNode;
};

export function VirtualListContent({
  itemCount,
  estimatedItemHeight,
  height,
  scrollTop,
  overscan = 3,
  children,
}: VirtualListContentProps) {
  // Initially, assume every item is the estimated height.
  const [itemHeights, setItemHeights] = useState<number[]>(() =>
    new Array(itemCount).fill(estimatedItemHeight)
  );

  // When an item mounts or changes size, update its recorded height.
  const handleItemHeightChange = (index: number, measuredHeight: number) => {
    setItemHeights((prev) => {
      if (prev[index] !== measuredHeight) {
        const newHeights = [...prev];
        newHeights[index] = measuredHeight;
        return newHeights;
      }
      return prev;
    });
  };

  // Compute cumulative offsets so we know where each item should be placed.
  const cumulativeOffsets = useMemo(() => {
    const offsets = new Array(itemCount + 1);
    offsets[0] = 0;
    for (let i = 0; i < itemCount; i++) {
      offsets[i + 1] = offsets[i] + itemHeights[i];
    }
    return offsets;
  }, [itemHeights, itemCount]);

  const totalHeight = cumulativeOffsets[itemCount];

  // Use a binary search to quickly find the first item that's visible.
  const findStartIndex = (scrollTop: number) => {
    let low = 0;
    let high = itemCount - 1;
    let mid: number;
    while (low <= high) {
      mid = Math.floor((low + high) / 2);
      if (cumulativeOffsets[mid] < scrollTop) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return Math.max(0, low - 1);
  };

  const startIndex = findStartIndex(scrollTop);
  let endIndex = startIndex;
  while (
    endIndex < itemCount &&
    cumulativeOffsets[endIndex + 1] < scrollTop + height
  ) {
    endIndex++;
  }

  // Add overscan for smoother scrolling.
  const visibleStartIndex = Math.max(0, startIndex - overscan);
  const visibleEndIndex = Math.min(itemCount - 1, endIndex + overscan);

  const items = [];
  for (let i = visibleStartIndex; i <= visibleEndIndex; i++) {
    items.push(
      <VirtualListItem
        key={i}
        index={i}
        top={cumulativeOffsets[i]}
        onHeightChange={handleItemHeightChange}
      >
        {children(i)}
      </VirtualListItem>
    );
  }

  return (
    <div style={{ height: totalHeight, position: "relative" }}>{items}</div>
  );
}
