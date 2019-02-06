import {extent, histogram, range} from 'd3-array'

import {assert} from 'src/minard/utils/assert'
import {
  AestheticDataMappings,
  ColumnType,
  Table,
  HistogramPositionKind,
} from 'src/minard'

export const bin = (
  xCol: number[],
  xColType: ColumnType,
  fillCol: string[],
  fillColType: ColumnType,
  binCount: number = 30,
  position: HistogramPositionKind
): [Table, AestheticDataMappings] => {
  if (fillCol) {
    return groupedBin(xCol, xColType, fillCol, fillColType, binCount, position)
  }

  return ungroupedBin(xCol, xColType, binCount)
}

const ungroupedBin = (
  xCol: number[],
  xColType: ColumnType,
  binCount: number = 30
): [Table, AestheticDataMappings] => {
  assert(
    `unsupported value column type "${xColType}"`,
    xColType === ColumnType.Numeric || xColType === ColumnType.Temporal
  )

  const bins = histogram()
    .domain(extent(xCol))
    .thresholds(binCount)(xCol)

  const xMin = []
  const xMax = []
  const yMin = []
  const yMax = []

  for (const bin of bins) {
    xMin.push(bin.x0)
    xMax.push(bin.x1)
    yMin.push(0)
    yMax.push(bin.length)
  }

  const table = {
    columns: {xMin, xMax, yMin, yMax},
    columnTypes: {
      xMin: xColType,
      xMax: xColType,
      yMin: ColumnType.Numeric,
      yMax: ColumnType.Numeric,
    },
  }

  const mappings = {
    xMin: 'xMin',
    xMax: 'xMax',
    yMin: 'yMin',
    yMax: 'yMin',
  }

  return [table, mappings]
}

const groupedBin = (
  xCol: number[],
  xColType: ColumnType,
  fillCol: string[],
  fillColType: ColumnType,
  binCount: number,
  position: HistogramPositionKind
): [Table, AestheticDataMappings] => {
  const [d0, d1] = extent(xCol)
  const bins = range(d0, d1, (d1 - d0) / binCount).map(min => ({
    min,
    values: {},
  }))

  for (let i = 0; i < bins.length - 1; i++) {
    bins[i].max = bins[i + 1].min
  }

  bins[bins.length - 1].max = d1

  for (let i = 0; i < xCol.length; i++) {
    const x = xCol[i]
    const fill = fillCol[i]
    const bin = bins.find(
      (b, i) => (x < b.max && x >= b.min) || i === bins.length - 1
    )

    if (!bin.values[fill]) {
      bin.values[fill] = 1
    } else {
      bin.values[fill] += 1
    }
  }

  const xMin = []
  const xMax = []
  const yMin = []
  const yMax = []
  const group = []

  const fillValues = [...new Set(fillCol)]

  for (let i = 0; i < fillValues.length; i++) {
    const fill = fillValues[i]

    for (const bin of bins) {
      const fillYMin =
        position === HistogramPositionKind.Overlaid
          ? 0
          : fillValues
              .slice(0, i)
              .reduce((sum, f) => sum + (bin.values[f] || 0), 0)

      xMin.push(bin.min)
      xMax.push(bin.max)
      yMin.push(fillYMin)
      yMax.push(fillYMin + (bin.values[fill] || 0))
      group.push(fill)
    }
  }

  const table = {
    columns: {xMin, xMax, yMin, yMax, group},
    columnTypes: {
      xMin: xColType,
      xMax: xColType,
      yMin: ColumnType.Numeric,
      yMax: ColumnType.Numeric,
      group: fillColType,
    },
  }

  const mappings = {
    xMin: 'xMin',
    xMax: 'xMax',
    yMin: 'yMin',
    yMax: 'yMax',
    fill: 'group',
  }

  return [table, mappings]
}
