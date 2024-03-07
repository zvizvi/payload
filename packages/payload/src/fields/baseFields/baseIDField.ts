import ObjectIdImport from 'bson-objectid'

import type { Field, FieldHook } from '../config/types.d.ts'

const ObjectId = (ObjectIdImport.default ||
  ObjectIdImport) as unknown as typeof ObjectIdImport.default

const generateID: FieldHook = ({ operation, value }) =>
  (operation !== 'create' ? value : false) || new ObjectId().toHexString()

export const baseIDField: Field = {
  name: 'id',
  type: 'text',
  admin: {
    disabled: true,
  },
  hooks: {
    beforeChange: [generateID],
  },
  label: 'ID',
}
