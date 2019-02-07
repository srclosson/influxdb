import React, {useRef, useLayoutEffect, SFC} from 'react'

import {Scale, HistogramPosition, DEFAULT_COLOR} from 'src/minard'
import {clearCanvas} from 'src/minard/utils/clearCanvas'

interface Props {
  width: number
  height: number
  xMin: number[]
  xMax: number[]
  yMin: number[]
  yMax: number[]
  fill: string[] | boolean[]
  xScale: Scale<number, number>
  yScale: Scale<number, number>
  fillScale: Scale<string | number | boolean, string>
  position: HistogramPosition
}

const drawBars = (
  canvas: HTMLCanvasElement,
  {
    width,
    height,
    xMin,
    xMax,
    yMin,
    yMax,
    fill,
    xScale,
    yScale,
    fillScale,
  }: Props
): void => {
  clearCanvas(canvas, width, height)

  const context = canvas.getContext('2d')

  for (let i = 0; i < yMax.length; i++) {
    if (yMin[i] === yMax[i]) {
      continue
    }

    const x = xScale(xMin[i])
    const _y = yScale(yMax[i])
    const width = xScale(xMax[i]) - x
    const height = yScale(yMin[i]) - _y
    const color = fill && fillScale ? fillScale(fill[i]) : DEFAULT_COLOR

    context.globalAlpha = 0.6
    context.fillStyle = color
    context.fillRect(x, _y, width, height)

    context.globalAlpha = 1
    context.strokeStyle = color
    context.strokeRect(x, _y, width, height)
  }
}

const HistogramBars: SFC<Props> = props => {
  const canvas = useRef<HTMLCanvasElement>(null)

  useLayoutEffect(() => drawBars(canvas.current, props))

  return <canvas className="minard-layer histogram" ref={canvas} />
}

export default React.memo(HistogramBars)
