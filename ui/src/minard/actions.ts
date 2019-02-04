import {Table, AestheticDataMappings} from 'src/minard'

export type PlotAction =
  | RegisterLayerAction
  | UnregisterLayerAction
  | ResetAction

interface RegisterLayerAction {
  type: 'REGISTER_LAYER'
  payload: {
    layerKey: string
    table: Table
    aesthetics: AestheticDataMappings
  }
}

export const registerLayer = (
  layerKey: string,
  table: Table,
  aesthetics: AestheticDataMappings
): RegisterLayerAction => ({
  type: 'REGISTER_LAYER',
  payload: {layerKey, table, aesthetics},
})

interface UnregisterLayerAction {
  type: 'UNREGISTER_LAYER'
  payload: {layerKey: string}
}

export const unregisterLayer = (layerKey: string): UnregisterLayerAction => ({
  type: 'UNREGISTER_LAYER',
  payload: {layerKey},
})

interface ResetAction {
  type: 'RESET'
}

export const reset = (): ResetAction => ({type: 'RESET'})
