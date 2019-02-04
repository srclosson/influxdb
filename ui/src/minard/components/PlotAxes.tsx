import React, {useRef, SFC} from 'react'

import {Margins} from 'src/minard'

interface Props {
  width: number
  height: number
  xTicks: string[]
  yTicks: string[]
  margins: Margins
}

const drawAxes = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  margins: Margins
): void => {}

export const PlotAxes: SFC<Props> = props => {
  const {children, width, height, margins} = props
  const canvas = useRef<HTMLCanvasElement>(null)

  if (canvas.current) {
    drawAxes(canvas.current, width, height, margins)
  }

  return (
    <>
      <canvas ref={canvas} />
      {children}
    </>
  )
}
