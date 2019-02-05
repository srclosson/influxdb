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

  const xMin = []
  const xMax = []
  const count = []

  for (const bin of bins) {
    xMin.push(bin.x0)
    xMax.push(bin.x1)
    count.push(bin.length)
  }

  const table = {
    columns: {xMin, xMax, count},
    columnTypes: {
      binStart: columnType,
      binStop: columnType,
      count: ColumnType.Numeric,
    },
  }

  const mappings = {
    xMin: 'xMin',
    xMax: 'xMax',
    y: 'count',
  }

  return [table, mappings]
}
