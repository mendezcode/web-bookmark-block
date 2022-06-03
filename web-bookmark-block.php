<?php
/**
 * Plugin Name:       Web Bookmark Block
 * Description:       Create web bookmarks of your favorite sites.
 * Requires at least: 6.0
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Ernesto Méndez
 * Author URI:        https://github.com/mendezcode
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       web-bookmark-block
 *
 * @package           mdz
 */

 /**
  * Web Bookmark Block class.
  */
class MDZ_Web_Bookmark_Block {

	/**
	 * Constructor method.
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'init' ) );
		add_action( 'rest_api_init', array( $this, 'rest_api_init') );
	}

	/**
	 * Registers initialization function.
	 *
	 * @return void
	 */
	public function init() {
		/**
		 * Registers the block using the metadata loaded from the `block.json` file.
		 * Behind the scenes, it registers also all assets so they can be enqueued
		 * through the block editor in the corresponding context.
		 *
		 * @see https://developer.wordpress.org/reference/functions/register_block_type/
		 */
		register_block_type( __DIR__ . '/build' );
	}

	/**
	 * Method that runs on REST API initialization.
	 *
	 * @return void
	 */
	public function rest_api_init() {
		register_rest_route( 'web-bookmark-block/v1', '/fetch', array(
			'methods' => 'GET',
			'callback' => array( $this, 'api_v1_fetch' ),
			'permission_callback' => function( $arg ) {
				return current_user_can( 'edit_posts' );
			},
			'args' => array(
				'url' => array(
					'required' => true,
					'validate_callback' => 'wp_http_validate_url',
					'sanitize_callback' => 'sanitize_url',
				)
			)
		) );
	}

	/**
	 * Handles the web-bookmark-block/v1/fetch endpoint.
	 *
	 * @return void
	 */
	public function api_v1_fetch( $rest_request ) {
		$url = $rest_request->get_param( 'url' );
		$response = wp_remote_get( $url );
		if ( is_wp_error( $response ) ) {
			return array( 'success' => false );
		} else {
			return array(
				'html' => $response['body'],
				'success' => true,
			);
		}
	}

}

new MDZ_Web_Bookmark_Block;
