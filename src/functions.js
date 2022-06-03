/* functions.js */

/**
 * Validates if a given string is a valid URL.
 *
 * @param {string} val The URL to validate
 * @return {boolean}
 */
export function validateURL( val ) {
	try {
		new URL( val );
		return true;
	} catch ( _ ) {
		return false;
	}
}

/**
 * Gets the base of a given URL.
 *
 * @param {string} url The input URL
 * @return {string}
 */
export function getBaseURL( url ) {
	const parsed = new URL( url );
	return parsed.origin;
}

/**
 * Gets target URL based on parameters.
 *
 * @param {string}  url  The original URL
 * @param {boolean} hide If true, will use href.li
 * @return {string}
 */
export function getTargetURI( url, hide ) {
	if ( hide ) {
		return `https://href.li/?${ url }`;
	}
	return url;
}
