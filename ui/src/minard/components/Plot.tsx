import {SFC} from 'react'

import {PlotProps, PlotEnv} from 'src/minard'

export const Plot: SFC<PlotProps> = props => {
  const {children} = props

  const env = {} as PlotEnv

  return children(env)
}
