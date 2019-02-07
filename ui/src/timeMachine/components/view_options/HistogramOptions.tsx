// Libraries
import React, {SFC} from 'react'
import {connect} from 'react-redux'

// Components
import {Dropdown, Form, Grid, AutoInput} from 'src/clockface'
import ColorSchemeDropdown from 'src/shared/components/ColorSchemeDropdown'

// Actions
import {
  setX,
  setFill,
  setBinCount,
  setHistogramPosition,
  setColors,
} from 'src/timeMachine/actions'

// Types
import {HistogramPosition} from 'src/minard'
import {Color} from 'src/types/colors'

interface DispatchProps {
  onSetX: typeof setX
  onSetFill: typeof setFill
  onSetBinCount: typeof setBinCount
  onSetPosition: typeof setHistogramPosition
  onSetColors: typeof setColors
}

interface OwnProps {
  x: string
  fill: string
  position: HistogramPosition
  binCount: number
  colors: Color[]
}

type Props = OwnProps & DispatchProps

const NO_FILL = 'None'
const FILL_OPTIONS = [NO_FILL, 'table', 'host', 'cpu', '_measurement', '_field']
const COLUMN_OPTIONS = ['_value', '_time']

const HistogramOptions: SFC<Props> = props => {
  const {
    x,
    fill,
    position,
    binCount,
    colors,
    onSetX,
    onSetFill,
    onSetPosition,
    onSetBinCount,
    onSetColors,
  } = props

  const selectedFill = fill ? fill : NO_FILL

  return (
    <Grid.Column>
      <h4 className="view-options--header">Customize Histogram</h4>
      <h5 className="view-options--header">Data</h5>
      <Form.Element label="Column">
        <Dropdown selectedID={x} onChange={onSetX}>
          {COLUMN_OPTIONS.map(option => (
            <Dropdown.Item key={option} id={option} value={option}>
              {option}
            </Dropdown.Item>
          ))}
        </Dropdown>
      </Form.Element>
      <Form.Element label="Fill">
        <Dropdown selectedID={selectedFill} onChange={onSetFill}>
          {FILL_OPTIONS.map(option => (
            <Dropdown.Item
              key={option}
              id={option}
              value={option === NO_FILL ? null : option}
            >
              {option}
            </Dropdown.Item>
          ))}
        </Dropdown>
      </Form.Element>
      <h5 className="view-options--header">Options</h5>
      <Form.Element label="Color Scheme">
        <ColorSchemeDropdown value={colors} onChange={onSetColors} />
      </Form.Element>
      <Form.Element label="Positioning">
        <Dropdown selectedID={position} onChange={onSetPosition}>
          <Dropdown.Item
            id={HistogramPosition.Overlaid}
            value={HistogramPosition.Overlaid}
          >
            Overlaid
          </Dropdown.Item>
          <Dropdown.Item
            id={HistogramPosition.Stacked}
            value={HistogramPosition.Stacked}
          >
            Stacked
          </Dropdown.Item>
        </Dropdown>
      </Form.Element>
      <Form.Element label="Bins">
        <AutoInput
          name="binCount"
          inputPlaceholder="Enter a number"
          value={binCount}
          onChange={onSetBinCount}
          min={0}
        />
      </Form.Element>
    </Grid.Column>
  )
}

const mdtp = {
  onSetX: setX,
  onSetFill: setFill,
  onSetBinCount: setBinCount,
  onSetPosition: setHistogramPosition,
  onSetColors: setColors,
}

export default connect<{}, DispatchProps, OwnProps>(
  null,
  mdtp
)(HistogramOptions)
