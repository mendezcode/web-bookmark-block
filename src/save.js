/* save.js */

import classnames from 'classnames';

/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-block-editor/#useBlockProps
 */
import { useBlockProps } from '@wordpress/block-editor';

import { CARD_ALIGN_TOP, CARD_ALIGN_RIGHT } from './constants.js';

import { getTargetURI } from './functions.js';

/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#save
 *
 * @return {WPElement} Element to render.
 */
export default function save( { attributes } ) {
	const {
		isURLFetched,
		siteUrl,
		siteFavicon,
		siteImage,
		siteDescription,
		siteTitle,
		hideReferer,
		useClickOverlay,
		useLinkUnderline,
		useBorderRadius,
		displaySiteUrl,
		displaySiteImage,
		displaySiteFavicon,
		siteImageClickable,
		siteImageTopHeight,
		siteImageRightWidth,
		siteImageIsCentered,
		openInNewWindow,
		cardAlignment,
	} = attributes;

	const windowTarget = openInNewWindow ? '_blank' : '_self';

	const targetURI = getTargetURI( siteUrl, hideReferer );

	return (
		<div
			{ ...useBlockProps.save( {
				className: classnames(
					isURLFetched
						? {
								'has-site-image': displaySiteImage,
								'has-border-radius': useBorderRadius,
								'has-link-underline': useLinkUnderline,
								'has-click-overlay': useClickOverlay,
								'card-alignment-top':
									CARD_ALIGN_TOP === cardAlignment,
								'card-alignment-right':
									CARD_ALIGN_RIGHT === cardAlignment,
						  }
						: {}
				),
			} ) }
		>
			{ isURLFetched ? (
				<>
					{ useClickOverlay && (
						<a
							className="wb-click-overlay"
							target={ windowTarget }
							href={ targetURI }
							rel="noopener"
						>
							<span className="screen-reader-text">
								{ siteTitle }
							</span>
						</a>
					) }

					<div className="wb-meta">
						<h3 className="wb-meta-title">
							<a
								target={ windowTarget }
								href={ targetURI }
								rel="noopener"
							>
								{ siteTitle }
							</a>
						</h3>
						<p className="wb-meta-description">
							{ siteDescription }
						</p>
						{ displaySiteUrl && (
							<span className="wb-meta-link">
								{ displaySiteFavicon && siteFavicon && (
									<img alt="" src={ siteFavicon } />
								) }
								{ siteUrl && (
									<a
										target={ windowTarget }
										href={ targetURI }
										rel="noopener"
									>
										{ siteUrl }
									</a>
								) }
							</span>
						) }
					</div>
					{ displaySiteImage && siteImage && (
						<a
							target={ siteImageClickable ? windowTarget : null }
							className="wb-card"
							href={ siteImageClickable ? targetURI : null }
							style={ {
								backgroundImage: `url(${ siteImage })`,
								backgroundPosition: siteImageIsCentered
									? 'center'
									: undefined,
								height:
									CARD_ALIGN_TOP === cardAlignment
										? siteImageTopHeight
										: undefined,
								width:
									CARD_ALIGN_RIGHT === cardAlignment
										? `${ siteImageRightWidth }%`
										: undefined,
							} }
							rel="noopener"
						>
							<span className="screen-reader-text">
								{ __( 'Site image', 'web-bookmark-block' ) }
							</span>
						</a>
					) }
				</>
			) : (
				<></>
			) }
		</div>
	);
}
