import { ColumnDef } from "@tanstack/react-table";
import { VirtualizedTable } from "./VirtualTable";

/* ============================================================================
   Example Usage
   ----------------------------------------------------------------------------
   We generate 500 rows of data with 30 columns. The first two columns are
   marked as sticky on the left.
=============================================================================== */
type DataItem = { [key: string]: any };

function generateData(rowCount: number, columnCount: number): DataItem[] {
  const data: DataItem[] = [];
  for (let i = 0; i < rowCount; i++) {
    const row: DataItem = {};
    for (let j = 0; j < columnCount; j++) {
      row[`col${j}`] = `Row ${i} Col ${j}`;
    }
    data.push(row);
  }
  return data;
}

function generateColumns(columnCount: number): ColumnDef<DataItem>[] {
  const columns: ColumnDef<DataItem>[] = [];
  for (let j = 0; j < columnCount; j++) {
    columns.push({
      accessorKey: `col${j}`,
      header: `Column ${j}`,
      meta: {
        // Mark the first two columns as sticky.
        sticky: j < 2 ? "left" : undefined,
        width: 150,
      },
    });
  }
  return columns;
}

export function App() {
  const data = generateData(500, 30);
  const columns = generateColumns(30);

  return (
    <div style={{ padding: 20 }}>
      <h2>Custom Virtualized Table with Dynamic Row Heights</h2>
      <VirtualizedTable data={data} columns={columns} height={400} />
    </div>
  );
}
