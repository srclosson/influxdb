import React, {useRef, useLayoutEffect, SFC} from 'react'
import chroma from 'chroma-js'

import {Scale, HistogramPositionKind} from 'src/minard'
import {clearCanvas} from 'src/minard/utils/clearCanvas'

import {LINE_COLORS_A} from 'src/shared/constants/graphColorPalettes'

const COLOR = chroma(LINE_COLORS_A[0].hex)
const DEFAULT_FILL = COLOR.alpha(0.5).css()

interface Props {
  width: number
  height: number
  xMin: number[]
  xMax: number[]
  yMin: number[]
  yMax: number[]
  fill: string[] | boolean[]
  xScale: Scale
  yScale: Scale
  fillScale: Scale
  position: HistogramPositionKind
}

const drawStackedBars = (
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
    const x = xScale(xMin[i])
    const _y = yScale(yMax[i])
    const width = xScale(xMax[i]) - x
    const height = yScale(yMin[i]) - _y
    const color = fill && fillScale ? fillScale(fill[i]) : DEFAULT_FILL

    context.globalAlpha = 0.6
    context.fillStyle = color
    context.fillRect(x, _y, width, height)

    context.globalAlpha = 1
    context.strokeStyle = color
    context.strokeRect(x, _y, width, height)
  }
}

const drawOverlaidBars = (
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
    const x = xScale(xMin[i])
    const _y = yScale(yMax[i])
    const width = xScale(xMax[i]) - x
    const height = yScale(yMin[i]) - _y
    const color = fill && fillScale ? fillScale(fill[i]) : DEFAULT_FILL

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

  useLayoutEffect(() => {
    if (props.position === HistogramPositionKind.Stacked) {
      drawStackedBars(canvas.current, props)
    } else if (props.position === HistogramPositionKind.Overlaid) {
      drawOverlaidBars(canvas.current, props)
    }
  })

  return <canvas className="minard-layer histogram" ref={canvas} />
}

export default React.memo(HistogramBars)
