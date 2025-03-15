export const GATEWAYS = {
  MOON: 'moon',
}

export const { NODE_ENV } = process.env
export const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL
export const GATEWAY_URL = process.env.APP_URL_PROD

// check current render is server side or not
export const IS_SERVER = typeof window === 'undefined'

export const DEV = NODE_ENV === 'development'
export const PROD = NODE_ENV === 'production'
export const TEST = NODE_ENV === 'test'
