import React, {useReducer, useEffect, SFC, CSSProperties} from 'react'

import {Table, PlotEnv} from 'src/minard'
import {setDimensions, setTable} from 'src/minard/actions'
import {Axes} from 'src/minard/components/Axes'
import {reducer, INITIAL_PLOT_ENV} from 'src/minard/plotEnv'

export interface Props {
  // Required props
  table: Table
  width: number
  height: number
  children: (env: PlotEnv) => JSX.Element

  // Aesthetic mappings
  x?: string
  // y?: string
  // start?: string
  // stop?: string
  // lower?: string
  // upper?: string
  // stroke?: string
  // strokeWidth?: string
  // fill?: string
  // shape?: ShapeKind
  // radius?: number
  // alpha?: number

  // Misc options
  // xBrushable?: boolean
  // yBrushable?: boolean
  // xAxisTitle?: string
  // yAxisTitle?: string
  // xAxisPrefix?: string
  // yAxisPrefix?: string
  // xAxisSuffix?: string
  // yAxisSuffix?: string
  axesStroke?: string
  tickFont?: string
  tickFill?: string
  // xTicksStroke?: string
  // yTicksStroke?: string
}

export const Plot: SFC<Props> = ({
  width,
  height,
  table,
  x,
  children,
  axesStroke = '#31313d',
  tickFont = 'bold 10px Roboto',
  tickFill = '#8e91a1',
}) => {
  const [env, dispatch] = useReducer(reducer, {
    ...INITIAL_PLOT_ENV,
    width,
    height,
    defaults: {table, aesthetics: {x}, scales: {}},
  })

  useEffect(() => dispatch(setTable(table)), [table])
  useEffect(() => dispatch(setDimensions(width, height)), [width, height])

  const plotStyle: CSSProperties = {
    position: 'relative',
    width: `${width}px`,
    height: `${height}px`,
  }

  const layersStyle: CSSProperties = {
    position: 'absolute',
    top: `${env.margins.top}px`,
    right: `${env.margins.right}px`,
    bottom: `${env.margins.bottom}px`,
    left: `${env.margins.left}px`,
  }

  return (
    <div className="minard-plot" style={plotStyle}>
      <Axes
        env={env}
        axesStroke={axesStroke}
        tickFont={tickFont}
        tickFill={tickFill}
      >
        <div className="minard-layers" style={layersStyle}>
          {children({...env, dispatch})}
        </div>
      </Axes>
    </div>
  )
}
