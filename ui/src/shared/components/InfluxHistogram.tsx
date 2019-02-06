// Libraries
import React, {useMemo, SFC} from 'react'
import {connect} from 'react-redux'
import {Plot, Histogram} from 'src/minard'

// Utils
import {toMinardTable} from 'src/shared/utils/toMinardTable'
import {getActiveTimeMachine} from 'src/timeMachine/selectors'

// Types
import {FluxTable} from 'src/types'
import {AppState} from 'src/types/v2'
import {HistogramView} from 'src/types/v2/dashboards'

interface StateProps {
  properties: HistogramView
}

interface OwnProps {
  width: number
  height: number
  tables: FluxTable[]
}

type Props = OwnProps & StateProps

const InfluxHistogram: SFC<Props> = props => {
  const {tables, width, height} = props
  const {x, fill, binCount, position} = props.properties

  const {table} = useMemo(() => toMinardTable(tables), [tables])

  return (
    <Plot table={table} width={width} height={height}>
      {env => (
        <Histogram
          env={env}
          x={x}
          fill={fill}
          bins={binCount}
          position={position}
        />
      )}
    </Plot>
  )
}

const mstp = (state: AppState) => {
  const properties = getActiveTimeMachine(state).view
    .properties as HistogramView

  return {properties}
}

export default connect<StateProps, {}, OwnProps>(mstp)(InfluxHistogram)
