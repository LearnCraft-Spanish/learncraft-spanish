import type { TableRow } from '@domain/PasteTable';
import type { DiffsMap } from '@domain/PasteTable/functions/mergeSourceWithDiffs';
import { mergeSourceWithDiffs } from '@domain/PasteTable/functions/mergeSourceWithDiffs';
import { describe, expect, it } from 'vitest';

describe('mergeSourceWithDiffs', () => {
  const sourceRows: TableRow[] = [
    { id: 'row-1', cells: { name: 'John', age: '30' } },
    { id: 'row-2', cells: { name: 'Jane', age: '25' } },
  ];

  it('should return the source rows unchanged when there are no diffs', () => {
    expect(mergeSourceWithDiffs(sourceRows, new Map())).toEqual(sourceRows);
  });

  it('should apply a diff over the matching row and leave other cells alone', () => {
    const diffs: DiffsMap = new Map([['row-1', { name: 'Johnny' }]]);

    const result = mergeSourceWithDiffs(sourceRows, diffs);

    expect(result[0]).toEqual({
      id: 'row-1',
      cells: { name: 'Johnny', age: '30' },
    });
  });

  it('should not alter rows that have no diff', () => {
    const diffs: DiffsMap = new Map([['row-1', { name: 'Johnny' }]]);

    const result = mergeSourceWithDiffs(sourceRows, diffs);

    expect(result[1]).toEqual(sourceRows[1]);
  });

  it('should keep the source row order and row ids', () => {
    const diffs: DiffsMap = new Map<string, Record<string, string>>([
      ['row-2', { name: 'Janet' }],
      ['row-1', { age: '31' }],
    ]);

    const result = mergeSourceWithDiffs(sourceRows, diffs);

    expect(result.map((row) => row.id)).toEqual(['row-1', 'row-2']);
    expect(result[0].cells).toEqual({ name: 'John', age: '31' });
    expect(result[1].cells).toEqual({ name: 'Janet', age: '25' });
  });

  it('should let a diff clear a cell by setting it to an empty string', () => {
    const diffs: DiffsMap = new Map([['row-1', { name: '' }]]);

    const result = mergeSourceWithDiffs(sourceRows, diffs);

    expect(result[0].cells).toEqual({ name: '', age: '30' });
  });

  it('should ignore diffs for rows that are not in the source', () => {
    const diffs: DiffsMap = new Map([['row-99', { name: 'Ghost' }]]);

    const result = mergeSourceWithDiffs(sourceRows, diffs);

    expect(result).toEqual(sourceRows);
  });

  it('should return an empty list for no source rows', () => {
    const diffs: DiffsMap = new Map([['row-1', { name: 'Johnny' }]]);

    expect(mergeSourceWithDiffs([], diffs)).toEqual([]);
  });

  it('should not mutate the source rows or the diffs', () => {
    const source: TableRow[] = [
      { id: 'row-1', cells: { name: 'John', age: '30' } },
    ];
    const rowDiffs = { name: 'Johnny' };
    const diffs: DiffsMap = new Map([['row-1', rowDiffs]]);

    mergeSourceWithDiffs(source, diffs);

    expect(source).toEqual([
      { id: 'row-1', cells: { name: 'John', age: '30' } },
    ]);
    expect(rowDiffs).toEqual({ name: 'Johnny' });
  });
});
