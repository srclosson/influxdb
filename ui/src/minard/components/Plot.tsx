import React, {useReducer, SFC} from 'react'

import {PlotProps} from 'src/minard'
import {reset} from 'src/minard/actions'
import {PlotAxes} from 'src/minard/components/PlotAxes'
import {reducer, INITIAL_PLOT_ENV} from 'src/minard/plotEnv'

export const Plot: SFC<PlotProps> = props => {
  const {width, height, table, x, children} = props

  const [env, dispatch] = useReducer(
    reducer,
    INITIAL_PLOT_ENV,
    reset(table, width, height, {x})
  )

  env.dispatch = dispatch

  const {xTicks, yTicks, margins} = env

  return (
    <div className="minard-plot">
      <PlotAxes
        width={width}
        height={height}
        xTicks={xTicks}
        yTicks={yTicks}
        margins={margins}
      >
        <div className="layers">{children(env)}</div>
      </PlotAxes>
    </div>
  )
}
