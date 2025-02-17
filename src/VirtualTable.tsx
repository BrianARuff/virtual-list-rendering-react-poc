import {
  ColumnDef,
  getCoreRowModel,
  RowData,
  useReactTable,
} from "@tanstack/react-table";
import { useRef, useState } from "react";
import { VirtualListContent } from "./VirtualList";

/* ============================================================================
   VirtualizedTable
   ----------------------------------------------------------------------------
   This component ties it all together:
     - It sets up a TanStack Table instance.
     - Renders a sticky header.
     - Uses VirtualListContent to render only the visible table rows.
     - Supports sticky (left) columns.
=============================================================================== */
type VirtualizedTableProps<TData extends RowData> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  estimatedRowHeight?: number;
  height: number; // total height of the table container
};

export function VirtualizedTable<TData extends RowData>({
  data,
  columns,
  estimatedRowHeight = 35,
  height,
}: VirtualizedTableProps<TData>) {
  const headerHeight = 35; // Assume a constant header height.
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const headerGroup = table.getHeaderGroups()[0];

  // Compute sticky offsets for columns that are marked as sticky.
  let stickyLeftOffsets: { [key: string]: number } = {};
  let offset = 0;
  headerGroup.headers.forEach((header) => {
    if (header.column.columnDef.meta?.sticky === "left") {
      stickyLeftOffsets[header.id] = offset;
      offset += header.column.columnDef.meta?.width || 150;
    }
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // When scrolling, update the scrollTop state.
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const rows = table.getRowModel().rows;

  return (
    <div
      ref={containerRef}
      style={{
        height,
        overflow: "auto",
        position: "relative",
        border: "1px solid #ccc",
      }}
      onScroll={onScroll}
    >
      {/* Sticky Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "#f0f0f0",
          zIndex: 10,
          display: "flex",
        }}
      >
        {headerGroup.headers.map((header) => {
          const width = header.column.columnDef.meta?.width || 150;
          const isSticky = header.column.columnDef.meta?.sticky === "left";
          return (
            <div
              key={header.id}
              style={{
                width,
                flexShrink: 0,
                border: "1px solid #ddd",
                boxSizing: "border-box",
                padding: "4px 8px",
                ...(isSticky
                  ? {
                      position: "sticky",
                      left: stickyLeftOffsets[header.id],
                      background: "#f0f0f0",
                      zIndex: 11,
                    }
                  : {}),
              }}
            >
              {header.isPlaceholder ? null : header.column.columnDef.header}
            </div>
          );
        })}
      </div>

      {/* Virtualized Rows */}
      {/* We add a top margin so the header doesn't overlap */}
      <div style={{ marginTop: headerHeight }}>
        <VirtualListContent
          itemCount={rows.length}
          estimatedItemHeight={estimatedRowHeight}
          height={height - headerHeight}
          // Adjust scrollTop for header height (since the header is sticky)
          scrollTop={scrollTop - headerHeight}
        >
          {(rowIndex) => {
            const row = rows[rowIndex];
            return (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                {row.getVisibleCells().map((cell) => {
                  const width = cell.column.columnDef.meta?.width || 150;
                  const isSticky =
                    cell.column.columnDef.meta?.sticky === "left";
                  return (
                    <div
                      key={cell.id}
                      style={{
                        width,
                        flexShrink: 0,
                        border: "1px solid #ddd",
                        boxSizing: "border-box",
                        padding: "4px 8px",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        ...(isSticky
                          ? {
                              position: "sticky",
                              left: stickyLeftOffsets[cell.column.id],
                              background: "#fff",
                              zIndex: 5,
                            }
                          : {}),
                      }}
                    >
                      {cell.getContext().renderValue()}
                    </div>
                  );
                })}
              </div>
            );
          }}
        </VirtualListContent>
      </div>
    </div>
  );
}
