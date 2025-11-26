import type { TableColumn, TableRow } from '@domain/PasteTable/General';
import { generateRowId } from '@application/units/pasteTable/utils/rowCreation';
/**
 * Converts typed data to table rows
 */
export const convertDataToRows = <T>(
  data: T[],
  columns: TableColumn[],
): TableRow[] => {
  return data.map((item) => {
    const cells: Record<string, string> = {};
    columns.forEach((column) => {
      const key = column.id as keyof T;
      const value = item[key];
      cells[column.id] =
        value === undefined || value === null ? '' : String(value);
    });
    return {
      id: generateRowId(),
      cells,
    };
  });
};
