import type { PaginatedDocs } from '../../../database/types.js'
import type { GeneratedTypes, GlobalSlug, Payload, RequestContext } from '../../../index.js'
import type { Document, PayloadRequestWithData, Where } from '../../../types/index.js'
import type { TypeWithVersion } from '../../../versions/types.js'
import type { DataFromGlobalSlug } from '../../config/types.js'

import { APIError } from '../../../errors/index.js'
import { createLocalReq } from '../../../utilities/createLocalReq.js'
import { findVersionsOperation } from '../findVersions.js'

export type Options<TSlug extends GlobalSlug> = {
  context?: RequestContext
  depth?: number
  fallbackLocale?: GeneratedTypes['locale']
  limit?: number
  locale?: 'all' | GeneratedTypes['locale']
  overrideAccess?: boolean
  page?: number
  req?: PayloadRequestWithData
  showHiddenFields?: boolean
  slug: TSlug
  sort?: string
  user?: Document
  where?: Where
}

export default async function findVersionsLocal<TSlug extends GlobalSlug>(
  payload: Payload,
  options: Options<TSlug>,
): Promise<PaginatedDocs<TypeWithVersion<DataFromGlobalSlug<TSlug>>>> {
  const {
    slug: globalSlug,
    depth,
    limit,
    overrideAccess = true,
    page,
    showHiddenFields,
    sort,
    where,
  } = options

  const globalConfig = payload.globals.config.find((config) => config.slug === globalSlug)

  if (!globalConfig) {
    throw new APIError(`The global with slug ${String(globalSlug)} can't be found.`)
  }

  return findVersionsOperation({
    depth,
    globalConfig,
    limit,
    overrideAccess,
    page,
    req: await createLocalReq(options, payload),
    showHiddenFields,
    sort,
    where,
  })
}
