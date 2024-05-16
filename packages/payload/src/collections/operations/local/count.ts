import type { CollectionSlug, GeneratedTypes, Payload } from '../../../index.js'
import type {
  Document,
  PayloadRequestWithData,
  RequestContext,
  Where,
} from '../../../types/index.js'

import { APIError } from '../../../errors/index.js'
import { createLocalReq } from '../../../utilities/createLocalReq.js'
import { countOperation } from '../count.js'

export type Options<TSlug extends CollectionSlug> = {
  collection: TSlug
  /**
   * context, which will then be passed to req.context, which can be read by hooks
   */
  context?: RequestContext
  depth?: number
  disableErrors?: boolean
  locale?: GeneratedTypes['locale']
  overrideAccess?: boolean
  req?: PayloadRequestWithData
  user?: Document
  where?: Where
}

export default async function countLocal<TSlug extends CollectionSlug>(
  payload: Payload,
  options: Options<TSlug>,
): Promise<{ totalDocs: number }> {
  const { collection: collectionSlug, disableErrors, overrideAccess = true, where } = options

  const collection = payload.collections[collectionSlug]

  if (!collection) {
    throw new APIError(
      `The collection with slug ${String(collectionSlug)} can't be found. Count Operation.`,
    )
  }

  return countOperation<TSlug>({
    collection,
    disableErrors,
    overrideAccess,
    req: await createLocalReq(options, payload),
    where,
  })
}
