
/**
 * @typedef {Object} Stream
 * @property {string} id - Unique identifier for the stream
 * @property {string} name - Name of the stream
 * @property {string} url - URL of the stream
 * @property {string} [category] - Category of the stream
 * @property {string} [logo] - URL to the logo image
 * @property {boolean} [isActive] - Whether the stream is active
 * @property {boolean} [useStreamlink] - Whether to use streamlink for this stream
 * @property {string} [streamerType] - Type of streamer (direct, youtube, twitch, etc.)
 * @property {StreamlinkOptions} [streamlinkOptions] - Streamlink options
 */

/**
 * @typedef {Object} StreamlinkOptions
 * @property {string} [quality] - Quality setting for streamlink
 * @property {boolean} [useProxy] - Whether to use proxy
 * @property {boolean} [secureTokenEnabled] - Whether secure token is enabled
 * @property {string} [customArgs] - Custom arguments for streamlink
 * @property {boolean} [useUserAgent] - Whether to use custom user agent
 * @property {string} [userAgent] - Custom user agent string
 */

/**
 * @typedef {'direct' | 'youtube' | 'twitch' | 'dailymotion' | 'other'} StreamerType
 */

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} role - User role
 * @property {string} [name] - User name
 */

/**
 * @typedef {Object} StreamlinkProxyConfig
 * @property {string} url - Stream URL
 * @property {StreamlinkOptions} options - Streamlink options
 * @property {string} [token] - Security token
 */

// Export empty object for module compatibility
export default {};
