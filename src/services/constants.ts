export const SERVER_URL =
  import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_SOCKET_SERVER_PROD
    : import.meta.env.VITE_SOCKET_SERVER_LOCAL;