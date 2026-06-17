/* eslint-disable */
// @ts-nocheck
// noinspection JSUnusedGlobalSymbols

import { Route as rootRouteImport } from './routes/__root'
import { Route as DashboardRouteImport } from './routes/dashboard'
import { Route as IndexRouteImport } from './routes/index'
import { Route as SSlugRouteImport } from './routes/s.$slug'
import { Route as BuilderIdRouteImport } from './routes/builder.$id'
import { Route as AnalyticsIdRouteImport } from './routes/analytics.$id'

const DashboardRoute = DashboardRouteImport.update({
  id: '/dashboard',
  path: '/dashboard',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const SSlugRoute = SSlugRouteImport.update({
  id: '/s/$slug',
  path: '/s/$slug',
  getParentRoute: () => rootRouteImport,
} as any)
const BuilderIdRoute = BuilderIdRouteImport.update({
  id: '/builder/$id',
  path: '/builder/$id',
  getParentRoute: () => rootRouteImport,
} as any)
const AnalyticsIdRoute = AnalyticsIdRouteImport.update({
  id: '/analytics/$id',
  path: '/analytics/$id',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/dashboard': typeof DashboardRoute
  '/analytics/$id': typeof AnalyticsIdRoute
  '/builder/$id': typeof BuilderIdRoute
  '/s/$slug': typeof SSlugRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/dashboard': typeof DashboardRoute
  '/analytics/$id': typeof AnalyticsIdRoute
  '/builder/$id': typeof BuilderIdRoute
  '/s/$slug': typeof SSlugRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/dashboard': typeof DashboardRoute
  '/analytics/$id': typeof AnalyticsIdRoute
  '/builder/$id': typeof BuilderIdRoute
  '/s/$slug': typeof SSlugRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/dashboard' | '/analytics/$id' | '/builder/$id' | '/s/$slug'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/dashboard' | '/analytics/$id' | '/builder/$id' | '/s/$slug'
  id:
    | '__root__'
    | '/'
    | '/dashboard'
    | '/analytics/$id'
    | '/builder/$id'
    | '/s/$slug'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  DashboardRoute: typeof DashboardRoute
  AnalyticsIdRoute: typeof AnalyticsIdRoute
  BuilderIdRoute: typeof BuilderIdRoute
  SSlugRoute: typeof SSlugRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/dashboard': {
      id: '/dashboard'
      path: '/dashboard'
      fullPath: '/dashboard'
      preLoaderRoute: typeof DashboardRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/s/$slug': {
      id: '/s/$slug'
      path: '/s/$slug'
      fullPath: '/s/$slug'
      preLoaderRoute: typeof SSlugRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/builder/$id': {
      id: '/builder/$id'
      path: '/builder/$id'
      fullPath: '/builder/$id'
      preLoaderRoute: typeof BuilderIdRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/analytics/$id': {
      id: '/analytics/$id'
      path: '/analytics/$id'
      fullPath: '/analytics/$id'
      preLoaderRoute: typeof AnalyticsIdRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  DashboardRoute: DashboardRoute,
  AnalyticsIdRoute: AnalyticsIdRoute,
  BuilderIdRoute: BuilderIdRoute,
  SSlugRoute: SSlugRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
