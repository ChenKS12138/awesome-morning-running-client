declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.png';

/**
 * see build.config.js
 */
declare const REQUEST_BASE_URL: string;
declare const REQUEST_OAUTH_URL: string;
declare const REDUX_LOGGER_ENABLE: boolean;
declare const NODE_ENV: 'production' | 'development';
