import React, {useRef, useLayoutEffect, SFC} from 'react'
import chroma from 'chroma-js'

import {Scale} from 'src/minard'
import {clearCanvas} from 'src/minard/utils/clearCanvas'

import {LINE_COLORS_A} from 'src/shared/constants/graphColorPalettes'

const COLOR = chroma(LINE_COLORS_A[0].hex)
const FILL = COLOR.alpha(0.5).css()
const STROKE = COLOR.alpha(1).css()

interface Props {
  width: number
  height: number
  xMin: number[]
  xMax: number[]
  y: number[]
  xScale: Scale
  yScale: Scale
}

const drawBars = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  xMin: number[],
  xMax: number[],
  y: number[],
  xScale: Scale,
  yScale: Scale
): void => {
  clearCanvas(canvas, width, height)

  const context = canvas.getContext('2d')

  context.fillStyle = FILL
  context.strokeStyle = STROKE

  for (let i = 0; i < y.length; i++) {
    const x = xScale(xMin[i])
    const _y = yScale(y[i])
    const width = xScale(xMax[i]) - x
    const height = yScale(0) - _y

    context.fillRect(x, _y, width, height)
    context.strokeRect(x, _y, width, height)
  }
}

const HistogramBars: SFC<Props> = props => {
  const canvas = useRef<HTMLCanvasElement>(null)
  const {width, height, xMin, xMax, y, xScale, yScale} = props

  useLayoutEffect(() => {
    drawBars(canvas.current, width, height, xMin, xMax, y, xScale, yScale)
  })

  return <canvas className="minard-layer histogram" ref={canvas} />
}

export default React.memo(HistogramBars)
