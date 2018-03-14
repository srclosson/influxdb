import React from 'react'
import {shallow} from 'enzyme'

import KapacitorRules from 'src/kapacitor/components/KapacitorRules'

import {source, kapacitorRules} from 'test/resources'

jest.mock('src/shared/apis', () => require('mocks/shared/apis'))

const setup = (override = {}) => {
  const props = {
    source,
    rules: kapacitorRules,
    hasKapacitor: true,
    loading: false,
    onDelete: () => {},
    onChangeRuleStatus: () => {},
  }

  const wrapper = shallow(<KapacitorRules {...props} />)

  return {
    wrapper,
    props,
  }
}

describe('Kapacitor.Containers.KapacitorRules', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the KapacitorRules', () => {
      const {wrapper} = setup()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders two tables', () => {
      const {wrapper} = setup()
      expect(wrapper.find('.panel-body').length).toEqual(2)
    })
  })
})
