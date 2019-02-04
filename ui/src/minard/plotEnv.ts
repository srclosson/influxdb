import {extent, ticks} from 'd3-array'
import {scaleLinear} from 'd3-scale'
import {produce} from 'immer'

import {PlotEnv} from 'src/minard'
import {PlotAction} from 'src/minard/actions'

const PADDING = 10

export const INITIAL_PLOT_ENV: PlotEnv = {
  width: 0,
  height: 0,
  innerWidth: 0,
  innerHeight: 0,
  defaults: {
    table: {columns: {}, columnTypes: {}},
    aesthetics: {},
    scales: {},
  },
  layers: {},
  xTicks: [],
  yTicks: [],
  margins: {top: PADDING, right: PADDING, bottom: PADDING, left: PADDING},
  dispatch: () => {},
}

// 1. compute x and y domains
// 2. generate x and y ticks
// 3. measure innerHeight, innerWidth
// 4. compute scales
// 5. compute scales for all other aesthetics
// 6. collect env
export const reducer = (state: PlotEnv, action: PlotAction): PlotEnv =>
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

        return
      }

      case 'UNREGISTER_LAYER': {
        const {layerKey} = action.payload

        delete state.layers[layerKey]

        return
      }

      case 'RESET': {
        const {table, width, height, aesthetics} = action.payload

        draftState.defaults.table = table
        draftState.defaults.aesthetics = aesthetics
        draftState.width = width
        draftState.height = height

        return
      }
    }
  })
