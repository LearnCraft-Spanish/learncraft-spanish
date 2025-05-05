import type { HeaderObject, SortConfig } from '../types';

export default function HeaderCell({
  headerObject,
  sortConfig,
  sortBy,
}: {
  headerObject: HeaderObject;
  sortConfig?: SortConfig;
  sortBy: (header: string) => void;
}) {
  const { header, sortable } = headerObject;

  return (
    <th
      key={header}
      className={sortable ? 'sortable' : ''}
      onClick={sortable ? () => sortBy(header) : undefined}
    >
      <div className="thContentWrapper">
        {sortConfig?.key === header && (
          <div
            className="sortIcon"
            style={{
              transform:
                sortConfig.direction === 'descending'
                  ? 'rotate(180deg)'
                  : 'rotate(0deg)',
            }}
          >
            ▲
          </div>
        )}
        <div>{header}</div>
      </div>
    </th>
  );
}
