import React, {useRef, SFC} from 'react'

import {Margins} from 'src/minard'

interface Props {
  width: number
  height: number
  xTicks: string[]
  yTicks: string[]
  margins: Margins
}

const clearCanvas = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number
) => {
  const context = canvas.getContext('2d')
  const dpRatio = window.devicePixelRatio || 1

  // Configure canvas to draw on retina displays correctly
  canvas.width = width * dpRatio
  canvas.height = height * dpRatio
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  context.scale(dpRatio, dpRatio)

  context.clearRect(0, 0, width, height)
}

const drawAxes = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  margins: Margins
): void => {
  clearCanvas(canvas, width, height)

  const context = canvas.getContext('2d')

  context.strokeStyle = 'white'

  context.moveTo(margins.left, margins.top)
  context.lineTo(margins.left, height - margins.bottom)
  context.lineTo(width - margins.right, height - margins.bottom)

  context.stroke()
}

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
