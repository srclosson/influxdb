import {extent, range, thresholdSturges} from 'd3-array'

import {assert} from 'src/minard/utils/assert'
import {
  AestheticDataMappings,
  ColumnType,
  Table,
  HistogramPosition,
} from 'src/minard'

export const bin = (
  xCol: number[],
  xColType: ColumnType,
  fillCol: string[],
  fillColType: ColumnType,
  binCount: number = 30,
  position: HistogramPosition
): [Table, AestheticDataMappings] => {
  assert(
    `unsupported value column type "${xColType}"`,
    xColType === ColumnType.Numeric || xColType === ColumnType.Temporal
  )

  const bins = createBins(xCol, binCount)

  for (let i = 0; i < xCol.length; i++) {
    const x = xCol[i]
    const fill = fillCol ? fillCol[i] : 'default'

    // TODO: Use binary search
    const bin = bins.find(
      (b, i) => (x < b.max && x >= b.min) || i === bins.length - 1
    )

    if (!bin.values[fill]) {
      bin.values[fill] = 1
    } else {
      bin.values[fill] += 1
    }
  }

  const fillValues = fillCol ? [...new Set(fillCol)] : ['default']

  const table = {
    columns: {xMin: [], xMax: [], yMin: [], yMax: [], group: []},
    columnTypes: {
      xMin: xColType,
      xMax: xColType,
      yMin: ColumnType.Numeric,
      yMax: ColumnType.Numeric,
      group: fillColType,
    },
  }

  for (let i = 0; i < fillValues.length; i++) {
    const fill = fillValues[i]

    for (const bin of bins) {
      let fillYMin = 0

      if (position === HistogramPosition.Stacked) {
        fillYMin = fillValues
          .slice(0, i)
          .reduce((sum, f) => sum + (bin.values[f] || 0), 0)
      }

      table.columns.xMin.push(bin.min)
      table.columns.xMax.push(bin.max)
      table.columns.yMin.push(fillYMin)
      table.columns.yMax.push(fillYMin + (bin.values[fill] || 0))
      table.columns.group.push(fill)
    }
  }

  const mappings: any = {
    xMin: 'xMin',
    xMax: 'xMax',
    yMin: 'yMin',
    yMax: 'yMax',
  }

  if (fillCol) {
    mappings.fill = 'group'
  }

  return [table, mappings]
}

const createBins = (
  col: number[],
  binCount: number
): Array<{max: number; min: number; values: {}}> => {
  if (!binCount) {
    binCount = thresholdSturges(col)
  }

  const [d0, d1] = extent(col)

  const bins = range(d0, d1, (d1 - d0) / binCount).map(min => ({
    min,
    values: {},
  }))

  for (let i = 0; i < bins.length - 1; i++) {
    bins[i].max = bins[i + 1].min
  }

  bins[bins.length - 1].max = d1

  return bins
}
