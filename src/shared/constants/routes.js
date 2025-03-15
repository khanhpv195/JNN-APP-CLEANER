const AUTH = {
  LOGIN: '/login',
  SIGN_UP: '/sign-up',
  FORGOT_PASSWORD: '/forgot-password',
}

const USER_DASHBOARD = {
  INDEX: '/dashboard',
  LEAD: '/lead',
  CUSTOMER: '/customer',
  PROPERTY: '/properties',
}

const ORG_DASHBOARD = {
  INDEX: '/org/dashboard',
  LEAD: '/org/lead',
  CUSTOMER: '/org/customer',
  PROPERTY: '/org/properties',
  USERS: '/org/settings/users',
  MAINTENANCE: '/org/settings/admin',
  TEAMS: '/org/settings/teams',
  MAINTENANCE: '/org/settings/maintenance',
  CLEANERS: '/org/settings/cleaners',
}

const PUBLIC = {
  HOME_PAGE: '/',
  // error pages
  BLOCKED_ACCOUNT: '/blocked-account',
  NOT_FOUND: '/not-found',
  SERVER_ERROR: '/server-error', // 500
  SERVICE_UNAVAILABLE: '/service-unavailable', // 503
  UNAUTHORIZED: '/unauthorized', // 401
  FORBIDDEN: '/forbidden', // 403
}

export const ROUTES = {
  AUTH,
  USER_DASHBOARD,
  PUBLIC,
  ORG_DASHBOARD,
}

export default ROUTES
