import React, {useReducer, SFC} from 'react'
import {extent, ticks} from 'd3-array'
import {scaleLinear} from 'd3-scale'
import {produce} from 'immer'

import {PlotProps, Table, Layer, Margins} from 'src/minard'
import {PlotAction, reset} from 'src/minard/actions'
import {PlotAxes} from 'src/minard/components/PlotAxes'

const PADDING = 10

interface State {
  table: Table
  width: number
  height: number
  innerWidth: number
  innerHeight: number
  defaults: Layer
  layers: {[layerKey: string]: Layer}
  xTicks: string[]
  yTicks: string[]
  margins: Margins
}

// 1. compute x and y domains
// 2. generate x and y ticks
// 3. measure innerHeight, innerWidth
// 4. compute scales
// 5. compute scales for all other aesthetics
// 6. collect env
const reducer = (state: State, action: PlotAction): State =>
  produce(state, draftState => {
    switch (action.type) {
      case 'REGISTER_LAYER': {
        const {layerKey, table, aesthetics} = action.payload
        const {columns} = table
        const {x0, x1, y} = aesthetics
        const xDomain = extent([...extent(columns[x0]), ...extent(columns[x1])])
        const yDomain = extent(columns[y])

        const xTicks: string[] = ticks(xDomain[0], xDomain[1], 4).map(t =>
          String(t)
        )

        const yTicks: string[] = ticks(yDomain[0], yDomain[1], 4).map(t =>
          String(t)
        )

        // TODO: Count based on dimensions, measure text metrics
        const xTickHeight = 10
        const yTickWidth = Math.max(...yTicks.map(t => t.length)) * 4

        const margins = {
          top: PADDING,
          right: PADDING,
          bottom: xTickHeight + PADDING,
          left: yTickWidth + PADDING,
        }

        const xScale = scaleLinear()
          .domain(xDomain)
          .range([
            margins.left,
            margins.left + (state.width - margins.left - margins.right),
          ])

        const yScale = scaleLinear()
          .domain(yDomain)
          .range([
            margins.top + (state.height - margins.top - margins.bottom),
            margins.top,
          ])

        draftState.xTicks = xTicks
        draftState.yTicks = yTicks
        draftState.margins = margins
        draftState.layers[layerKey] = {
          table,
          aesthetics,
          scales: {
            x0: xScale,
            x1: xScale,
            y: yScale,
          },
        }
      }

      case 'UNREGISTER_LAYER': {
        const {layerKey} = action.payload

        delete state.layers[layerKey]
      }

      case 'RESET': {
        // TODO: Compute scales
      }
    }
  })

export const Plot: SFC<PlotProps> = props => {
  const {width, height, table, x, children} = props

  const [state, dispatch] = useReducer(
    reducer,
    {
      table,
      width,
      height,
      innerWidth: 0,
      innerHeight: 0,
      defaults: {table, aesthetics: {x}, scales: {}},
      layers: {},
      xTicks: [],
      yTicks: [],
      margins: {top: PADDING, right: PADDING, bottom: PADDING, left: PADDING},
    },
    reset()
  )

  // TODO: Stable reference identity for env

  return (
    <div className="plot">
      <PlotAxes
        width={state.width}
        height={state.height}
        xTicks={state.xTicks}
        yTicks={state.yTicks}
        margins={state.margins}
      >
        <div className="plot-layers">{children({...state, dispatch})}</div>
      </PlotAxes>
    </div>
  )
}
