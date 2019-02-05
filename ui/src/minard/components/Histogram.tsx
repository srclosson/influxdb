import React, {useState, useEffect, SFC} from 'react'
import uuid from 'uuid'

import {PlotEnv} from 'src/minard'
import * as stats from 'src/minard/stats'
import {assert} from 'src/minard/utils/assert'
import {registerLayer, unregisterLayer} from 'src/minard/actions'
import HistogramBars from 'src/minard/components/HistogramBars'

export enum PositionKind {
  Stack = 'stack',
  Overlay = 'overlay',
  Dodge = 'dodge',
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

  const {layers, defaults, dispatch} = props.env
  const layer = layers[layerKey]
  const table = defaults.table
  const x = props.x || defaults.aesthetics.x

  useEffect(
    () => {
      const column = table.columns[x]
      const columnType = table.columnTypes[x]

      assert('expected an `x` aesthetic', !!x)
      assert(`table does not contain column "${x}"`, !!column)

      const [statTable, mappings] = stats.bin(column, columnType, props.bins)

      dispatch(registerLayer(layerKey, statTable, mappings))

      return () => dispatch(unregisterLayer(layerKey))
    },
    [table, x]
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
    aesthetics: {xMin, xMax, y},
    table: {columns},
  } = layer

  return (
    <HistogramBars
      width={innerWidth}
      height={innerHeight}
      xMin={columns[xMin]}
      xMax={columns[xMax]}
      y={columns[y]}
      xScale={xScale}
      yScale={yScale}
    />
  )
}
