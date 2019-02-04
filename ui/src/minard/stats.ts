import {extent, histogram} from 'd3-array'

import {assert} from 'src/minard/utils/assert'
import {AestheticDataMappings, ColumnType, Table} from 'src/minard'

export const bin = (
  column: number[],
  columnType,
  binCount: number = 30
): [Table, AestheticDataMappings] => {
  // TODO: Support discrete histograms
  assert(
    `unsupported column type "${columnType}"`,
    columnType === ColumnType.Numeric || columnType === ColumnType.Temporal
  )

  const bins = histogram()
    .domain(extent(column))
    .thresholds(binCount)(column)

  const binStart = []
  const binStop = []
  const count = []

  for (const bin of bins) {
    binStart.push(bin.x0)
    binStop.push(bin.x1)
    count.push(bin.length)
  }

  const table = {
    columns: {binStart, binStop, count},
    columnTypes: {
      binStart: columnType,
      binStop: columnType,
      count: ColumnType.Numeric,
    },
  }

  const mappings = {
    x0: 'binStart',
    x1: 'binStop',
    y: 'count',
  }

  return [table, mappings]
}
