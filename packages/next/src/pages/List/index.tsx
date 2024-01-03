import type { SanitizedConfig } from 'payload/types'

import {
  HydrateClientUser,
  ListInfoProvider,
  RenderCustomComponent,
  TableColumnsProvider,
} from '@payloadcms/ui'
import { notFound } from 'next/navigation'
import React, { Fragment } from 'react'

import type { DefaultListViewProps, ListPreferences } from './Default/types'

import { initPage } from '../../utilities/initPage'
import { DefaultListView } from './Default'

export const ListView = async ({
  collectionSlug,
  config: configPromise,
  route,
  searchParams,
}: {
  collectionSlug: string
  config: Promise<SanitizedConfig>
  route
  searchParams: { [key: string]: string | string[] | undefined }
}) => {
  const { collectionConfig, config, payload, permissions, user } = await initPage({
    collectionSlug,
    config: configPromise,
    redirectUnauthenticatedUser: true,
    route,
    searchParams,
  })

  let listPreferences: ListPreferences

  try {
    listPreferences = (await payload
      .find({
        collection: 'payload-preferences',
        depth: 0,
        limit: 1,
        where: {
          key: {
            equals: `${collectionSlug}-list`,
          },
        },
      })
      ?.then((res) => res?.docs?.[0]?.value)) as unknown as ListPreferences
  } catch (error) {}

  const {
    routes: { admin },
  } = config

  if (collectionConfig) {
    const {
      admin: { components: { views: { List: CustomList } = {} } = {} },
    } = collectionConfig

    let CustomListView = null

    if (CustomList && typeof CustomList === 'function') {
      CustomListView = CustomList
    } else if (typeof CustomList === 'object' && typeof CustomList.Component === 'function') {
      CustomListView = CustomList.Component
    }

    const limit = Number(searchParams?.limit) || collectionConfig.admin.pagination.defaultLimit

    const data = await payload.find({
      collection: collectionSlug,
      depth: 0,
      limit,
      user,
    })

    const componentProps: DefaultListViewProps = {
      collectionSlug,
    }

    return (
      <Fragment>
        <HydrateClientUser permissions={permissions} user={user} />
        <ListInfoProvider
          collectionSlug={collectionSlug}
          data={data}
          hasCreatePermission={permissions?.collections?.[collectionSlug]?.create?.permission}
          limit={limit}
          newDocumentURL={`${admin}/collections/${collectionSlug}/create`}
        >
          <TableColumnsProvider collectionSlug={collectionSlug} listPreferences={listPreferences}>
            <RenderCustomComponent
              CustomComponent={CustomListView}
              DefaultComponent={DefaultListView}
              componentProps={componentProps}
            />
          </TableColumnsProvider>
        </ListInfoProvider>
      </Fragment>
    )
  }

  return notFound()
}