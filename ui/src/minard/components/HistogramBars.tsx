import React, {SFC} from 'react'

import {Scale} from 'src/minard'

interface Props {
  x0: number[]
  x1: number[]
  y: number[]
  x0Scale: Scale
  x1Scale: Scale
  yScale: Scale
}

export const HistogramBars: SFC<Props> = props => {
  console.log('rendered HistogramBars', props)

  return null
}
