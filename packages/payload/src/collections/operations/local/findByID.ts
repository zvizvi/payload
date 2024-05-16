import type { CollectionSlug, GeneratedTypes, Payload } from '../../../index.js'
import type { Document, PayloadRequestWithData, RequestContext } from '../../../types/index.js'
import type { DataFromCollectionSlug } from '../../config/types.js'

import { APIError } from '../../../errors/index.js'
import { createLocalReq } from '../../../utilities/createLocalReq.js'
import { findByIDOperation } from '../findByID.js'

export type Options<TSlug extends CollectionSlug> = {
  collection: TSlug
  /**
   * context, which will then be passed to req.context, which can be read by hooks
   */
  context?: RequestContext
  currentDepth?: number
  depth?: number
  disableErrors?: boolean
  draft?: boolean
  fallbackLocale?: GeneratedTypes['locale']
  id: number | string
  locale?: 'all' | GeneratedTypes['locale']
  overrideAccess?: boolean
  req?: PayloadRequestWithData
  showHiddenFields?: boolean
  user?: Document
}

export default async function findByIDLocal<TSlug extends CollectionSlug>(
  payload: Payload,
  options: Options<TSlug>,
): Promise<DataFromCollectionSlug<TSlug>> {
  const {
    id,
    collection: collectionSlug,
    currentDepth,
    depth,
    disableErrors = false,
    draft = false,
    overrideAccess = true,
    showHiddenFields,
  } = options

  const collection = payload.collections[collectionSlug]

  if (!collection) {
    throw new APIError(
      `The collection with slug ${String(collectionSlug)} can't be found. Find By ID Operation.`,
    )
  }

  return findByIDOperation<TSlug>({
    id,
    collection,
    currentDepth,
    depth,
    disableErrors,
    draft,
    overrideAccess,
    req: await createLocalReq(options, payload),
    showHiddenFields,
  })
}
