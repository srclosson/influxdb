// Libraries
import React, {useMemo, SFC} from 'react'
import {Plot, Histogram, HistogramPositionKind} from 'src/minard'

// Utils
import {toMinardTable} from 'src/shared/utils/toMinardTable'

// Types
import {FluxTable} from 'src/types'

interface Props {
  width: number
  height: number
  tables: FluxTable[]
}

const InfluxHistogram: SFC<Props> = props => {
  const {tables, width, height} = props
  const {table} = useMemo(() => toMinardTable(tables), [tables])

  return (
    <Plot table={table} width={width} height={height}>
      {env => (
        <Histogram
          env={env}
          x="_value"
          fill="table"
          position={HistogramPositionKind.Stacked}
        />
      )}
    </Plot>
  )
}

export default InfluxHistogram
