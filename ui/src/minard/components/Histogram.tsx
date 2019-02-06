import React, {useState, useEffect, SFC} from 'react'
import uuid from 'uuid'

import {PlotEnv} from 'src/minard'
import * as stats from 'src/minard/stats'
import {assert} from 'src/minard/utils/assert'
import {registerLayer, unregisterLayer} from 'src/minard/actions'
import HistogramBars from 'src/minard/components/HistogramBars'

export enum PositionKind {
  Stacked = 'stacked',
  Overlaid = 'overlaid',
}

export interface Props {
  env: PlotEnv
  x?: string
  fill?: string
  position?: PositionKind
  bins?: number
}

export const Histogram: SFC<Props> = props => {
  const [layerKey] = useState(() => uuid.v4())

  const {bins, position} = props
  const {layers, defaults, dispatch} = props.env
  const layer = layers[layerKey]
  const table = defaults.table
  const x = props.x || defaults.aesthetics.x
  const fill = props.fill || defaults.aesthetics.fill

  useEffect(
    () => {
      const xCol = table.columns[x]
      const xColType = table.columnTypes[x]
      const fillCol = table.columns[fill]
      const fillColType = table.columnTypes[fill]

      assert('expected an `x` aesthetic', !!x)
      assert(`table does not contain column "${x}"`, !!xCol)

      const [statTable, mappings] = stats.bin(
        xCol,
        xColType,
        fillCol,
        fillColType,
        bins,
        position
      )

      dispatch(registerLayer(layerKey, statTable, mappings))

      return () => dispatch(unregisterLayer(layerKey))
    },
    [table, x, fill, position, bins]
  )

  if (!layer) {
    return null
  }

  const {
    innerWidth,
    innerHeight,
    defaults: {
      scales: {x: xScale, y: yScale},
    },
  } = props.env

  const {
    aesthetics,
    table: {columns},
    scales: {fill: fillScale},
  } = layer

  return (
    <HistogramBars
      width={innerWidth}
      height={innerHeight}
      xMin={columns[aesthetics.xMin]}
      xMax={columns[aesthetics.xMax]}
      yMin={columns[aesthetics.yMin]}
      yMax={columns[aesthetics.yMax]}
      fill={columns[aesthetics.fill]}
      fillScale={fillScale}
      xScale={xScale}
      yScale={yScale}
      position={props.position || PositionKind.Stacked}
    />
  )
}
