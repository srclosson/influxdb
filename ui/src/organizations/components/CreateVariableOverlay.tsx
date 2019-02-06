// Libraries
import React, {PureComponent, ChangeEvent} from 'react'

// Components
import {
  Form,
  OverlayBody,
  OverlayHeading,
  OverlayContainer,
  Input,
  Button,
  ComponentColor,
  ComponentStatus,
  ButtonType,
} from 'src/clockface'
import FluxEditor from 'src/shared/components/FluxEditor'

interface Props {
  onCreateVariable: () => void
  onCloseModal: () => void
}

interface State {
  name: string
  script: string
  nameInputStatus: ComponentStatus
  errorMessage: string
}

export default class CreateOrgOverlay extends PureComponent<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      script: '',
      nameInputStatus: ComponentStatus.Default,
      errorMessage: '',
    }
  }

  public render() {
    const {onCloseModal} = this.props
    const {nameInputStatus, errorMessage, name, script} = this.state

    return (
      <OverlayContainer>
        <OverlayHeading
          title="Create Variable"
          onDismiss={this.props.onCloseModal}
        />
        <OverlayBody>
          <Form onSubmit={this.handleCreateVariable}>
            <Form.Element label="Name" errorMessage={errorMessage}>
              <Input
                placeholder="Give your variable a name"
                name="name"
                autoFocus={true}
                value={name}
                onChange={this.handleChangeInput}
                status={nameInputStatus}
              />
            </Form.Element>
            <Form.Element label="Value" errorMessage={errorMessage}>
              <FluxEditor
                script={script}
                onChangeScript={this.handleChangeScript}
                visibility="visible"
                status={{text: '', type: ''}}
                suggestions={[]}
              />
            </Form.Element>
            <Form.Footer>
              <Button
                text="Cancel"
                color={ComponentColor.Danger}
                onClick={onCloseModal}
              />
              <Button
                text="Create"
                type={ButtonType.Submit}
                color={ComponentColor.Primary}
              />
            </Form.Footer>
          </Form>
        </OverlayBody>
      </OverlayContainer>
    )
  }

  private handleCreateVariable = () => {
    const {onCloseModal} = this.props
    onCloseModal()
  }

  private handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const key = e.target.name

    const newState = {...this.state}
    newState[key] = value
    this.setState(newState)
  }

  private handleChangeScript = (script: string): void => {
    this.setState({script})
  }
}
