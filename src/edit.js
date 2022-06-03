/* edit.js */

import classnames from 'classnames';

import { getPreviewFromContent } from 'link-preview-js';

/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * WordPress Components.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/components/
 */
import {
	Button,
	Spinner,
	Icon,
	PanelBody,
	ToggleControl,
	SelectControl,
	TextControl,
	RangeControl,
} from '@wordpress/components';

/**
 * Block Editor Components.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/
 */
import {
	useBlockProps,
	BlockControls,
	InspectorControls,
} from '@wordpress/block-editor';

/**
 * Utility to make WordPress REST API requests. It’s a wrapper around window.fetch.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-api-fetch/
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * A collection of utilities to manipulate URLs.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-url/
 */
import { addQueryArgs } from '@wordpress/url';

/**
 * Element is, quite simply, an abstraction layer atop React.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-element/
 */
import { useState } from '@wordpress/element';

import { CARD_ALIGN_TOP, CARD_ALIGN_RIGHT } from './constants.js';

import { validateURL } from './functions.js';

import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit( { attributes, setAttributes } ) {
	const {
		isURLFetched,
		isURLValid,
		siteUrl,
		siteUrlInput,
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
		openInNewWindow,
		cardAlignment,
		siteImageTopHeight,
		siteImageRightWidth,
		siteImageIsCentered,
	} = attributes;

	/**
	 * Dynamic assignment of setter callbacks.
	 */
	const setters = [
		'hideReferer',
		'useClickOverlay',
		'useLinkUnderline',
		'openInNewWindow',
		'useBorderRadius',
		'displaySiteUrl',
		'displaySiteFavicon',
		'displaySiteImage',
		'siteImageClickable',
		'cardAlignment',
		'siteImageTopHeight',
		'siteImageRightWidth',
		'siteImageIsCentered',
	].reduce( ( acc, prop ) => {
		return {
			...acc,
			[ prop ]: ( enabled ) => {
				setAttributes( { [ prop ]: enabled } );
			},
		};
	}, {} );

	const [ isFetchingURL, setFetchingURL ] = useState( false );
	const [ isFetchError, setFetchError ] = useState( false );

	/**
	 * Handle site url input change.
	 *
	 * @param {string} url The url value
	 */
	const onSiteUrlInputChange = ( url ) => {
		if ( ! isFetchingURL ) {
			setAttributes( {
				siteUrlInput: url,
				isURLValid: validateURL( url ),
			} );
		}
	};

	/**
	 * Fetches the site meta.
	 */
	const fetchSiteMeta = () => {
		setFetchingURL( true );
		setFetchError( false );
		apiFetch( {
			path: addQueryArgs( '/web-bookmark-block/v1/fetch', {
				url: siteUrlInput ?? siteUrl,
			} ),
		} )
			.then( ( res ) => {
				if ( res.success ) {
					getPreviewFromContent( {
						data: res.html,
						headers: {
							'content-type': 'text/html; charset=utf8',
						},
						url: siteUrlInput ?? siteUrl,
					} ).then( ( meta ) => {
						setFetchError( false );
						setFetchingURL( false );
						setAttributes( {
							isURLFetched: true,
							siteFavicon: meta.favicons[ 0 ] ?? null,
							siteImage: meta.images[ 0 ] ?? null,
							siteDescription: meta.description ?? null,
							siteTitle: meta.title ?? null,
							siteUrl: siteUrlInput ?? siteUrl,
							siteUrlInput: null,
						} );
					} );
				} else {
					setFetchError( true );
					setFetchingURL( false );
				}
			} )
			.catch( ( _err ) => {
				setFetchError( true );
				setFetchingURL( false );
			} );
	};

	return (
		<div
			{ ...useBlockProps( {
				className: classnames(
					isURLFetched
						? {
								'is-fetching-url': isFetchingURL,
								'has-site-image': displaySiteImage,
								'has-border-radius': useBorderRadius,
								'has-link-underline': useLinkUnderline,
								// 'has-click-overlay': useClickOverlay,
								'card-alignment-top':
									CARD_ALIGN_TOP === cardAlignment,
								'card-alignment-right':
									CARD_ALIGN_RIGHT === cardAlignment,
						  }
						: {
								'wb-link-entry': true,
						  }
				),
			} ) }
			onClick={
				isURLFetched
					? () => {
							if ( useClickOverlay ) {
								// window.open( siteUrl, windowTarget );
							}
					  }
					: null
			}
		>
			{ isURLFetched ? (
				<>
					{ /* Main Web Bookmark UI (after fetching OpenGraph data) */ }

					<BlockControls
						controls={ [
							{
								title: isFetchingURL
									? __(
											'Fetching site metadata, please wait.',
											'web-bookmark-block'
									  )
									: __(
											'Reload metadata',
											'web-bookmark-block'
									  ),
								icon: isFetchingURL ? 'hourglass' : 'update',
								isActive: isFetchingURL,
								onClick: () => {
									if ( ! isFetchingURL ) {
										fetchSiteMeta();
									}
								},
							},
						] }
					/>
					<InspectorControls>
						<PanelBody
							title={ __( 'URL', 'web-bookmark-block' ) }
							initialOpen={ true }
						>
							<TextControl
								type="text"
								value={ siteUrlInput ?? siteUrl }
								autoComplete="off"
								onKeyDown={ ( e ) => {
									if ( 'Enter' === e.key && isURLValid ) {
										fetchSiteMeta();
									}
								} }
								placeholder={ __(
									'Paste or type the URL',
									'web-bookmark'
								) }
								onChange={ onSiteUrlInputChange }
							/>
							{ isFetchError && (
								<p className="web-bookmark-block__error">
									<Icon icon="dismiss" />
									<span>
										{ __(
											"Errors fetching the site's metadata.",
											'web-bookmark-block'
										) }
									</span>
								</p>
							) }
							<Button
								variant={ isURLValid ? 'primary' : 'secondary' }
								icon="update"
								disabled={ isFetchingURL || ! isURLValid }
								onClick={ fetchSiteMeta }
							>
								{ __(
									'Update metadata',
									'web-bookmark-block'
								) }
							</Button>
							{ isFetchingURL && <Spinner /> }
						</PanelBody>
						<PanelBody
							title={ __( 'Behavior', 'web-bookmark-block' ) }
							initialOpen={ true }
						>
							<ToggleControl
								label={ __(
									'Underline links on hover',
									'web-bookmark-block'
								) }
								checked={ useLinkUnderline }
								onChange={ setters.useLinkUnderline }
								disabled={ useClickOverlay }
							/>
							<ToggleControl
								label={ __(
									'Open links in a new window',
									'web-bookmark-block'
								) }
								checked={ openInNewWindow }
								onChange={ setters.openInNewWindow }
							/>
							<ToggleControl
								label={ __(
									'Hide referer for links',
									'web-bookmark-block'
								) }
								checked={ hideReferer }
								onChange={ setters.hideReferer }
							/>
							<ToggleControl
								label={ __(
									'Make entire card clickable',
									'web-bookmark-block'
								) }
								checked={ useClickOverlay }
								onChange={ setters.useClickOverlay }
							/>
						</PanelBody>
						<PanelBody
							title={ __( 'Appearance', 'web-bookmark-block' ) }
							initialOpen={ true }
						>
							<ToggleControl
								label={ __(
									'Rounded corners',
									'web-bookmark-block'
								) }
								checked={ useBorderRadius }
								onChange={ setters.useBorderRadius }
							/>
							<ToggleControl
								label={ __(
									'Display Site URL',
									'web-bookmark-block'
								) }
								checked={ displaySiteUrl }
								onChange={ setters.displaySiteUrl }
							/>
							<ToggleControl
								label={ __(
									'Display Site Icon',
									'web-bookmark-block'
								) }
								checked={ displaySiteFavicon }
								onChange={ setters.displaySiteFavicon }
								disabled={ ! displaySiteUrl }
							/>
							<ToggleControl
								label={ __(
									'Display Site Image',
									'web-bookmark-block'
								) }
								checked={ displaySiteImage }
								onChange={ setters.displaySiteImage }
							/>
							<ToggleControl
								label={ __(
									'Site Image is clickable',
									'web-bookmark-block'
								) }
								checked={ siteImageClickable }
								onChange={ setters.siteImageClickable }
								disabled={
									! displaySiteImage || useClickOverlay
								}
							/>
							<ToggleControl
								label={ __(
									'Center Image',
									'web-bookmark-block'
								) }
								checked={ siteImageIsCentered }
								onChange={ setters.siteImageIsCentered }
								disabled={ ! displaySiteImage }
							/>
							<SelectControl
								label={ __(
									'Image Alignment',
									'web-bookmark-block'
								) }
								value={ cardAlignment }
								onChange={ setters.cardAlignment }
								disabled={ ! displaySiteImage }
							>
								<option value={ CARD_ALIGN_TOP }>
									Top Aligned
								</option>
								<option value={ CARD_ALIGN_RIGHT }>
									Right Aligned
								</option>
							</SelectControl>
							{ CARD_ALIGN_TOP === cardAlignment && (
								<RangeControl
									min={ 200 }
									max={ 600 }
									step={ 1 }
									initialPosition={ siteImageTopHeight }
									label={ __(
										'Image Height',
										'web-bookmark-block'
									) }
									help={ __(
										'Value in pixels.',
										'web-bookmark-block'
									) }
									renderTooltipContent={ ( val ) =>
										`${ val }px`
									}
									value={ siteImageTopHeight }
									onChange={ setters.siteImageTopHeight }
									disabled={ ! displaySiteImage }
								/>
							) }
							{ CARD_ALIGN_RIGHT === cardAlignment && (
								<RangeControl
									min={ 32.8 }
									max={ 50 }
									step={ 0.2 }
									initialPosition={ siteImageRightWidth }
									label={ __(
										'Image Width',
										'web-bookmark-block'
									) }
									help={ __(
										'Percentage width of container.',
										'web-bookmark-block'
									) }
									renderTooltipContent={ ( val ) =>
										`${ val }%`
									}
									value={ siteImageRightWidth }
									onChange={ setters.siteImageRightWidth }
									disabled={ ! displaySiteImage }
								/>
							) }
						</PanelBody>
					</InspectorControls>

					<div className="wb-meta">
						<h3 className="wb-meta-title">
							<span
								className="wb-link-preview"
								data-href={ siteUrl }
							>
								{ siteTitle }
							</span>
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
									<span
										className="wb-link-preview"
										data-href={ siteUrl }
									>
										{ siteUrl }
									</span>
								) }
							</span>
						) }
					</div>
					{ displaySiteImage && siteImage && (
						<div
							className="wb-card"
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
						>
							<span className="screen-reader-text">
								{ __( 'Site image', 'web-bookmark-block' ) }
							</span>
						</div>
					) }
				</>
			) : (
				<>
					{ /* === Link entry UI (initial state) === */ }

					<strong>
						{ __( 'Web Bookmark', 'web-bookmark-block' ) }
					</strong>
					<TextControl
						type="text"
						value={ siteUrlInput ?? '' }
						autoComplete="off"
						onKeyDown={ ( e ) => {
							if ( 'Enter' === e.key && isURLValid ) {
								fetchSiteMeta();
							}
						} }
						placeholder={ __(
							'Paste or type the URL',
							'web-bookmark'
						) }
						onChange={ onSiteUrlInputChange }
					/>
					{ isFetchError && (
						<p className="web-bookmark-block__error">
							<Icon icon="dismiss" />
							<span>
								{ __(
									"Errors fetching the site's metadata.",
									'web-bookmark-block'
								) }
							</span>
						</p>
					) }
					<Button
						variant={ isURLValid ? 'primary' : 'secondary' }
						disabled={ isFetchingURL || ! isURLValid }
						onClick={ fetchSiteMeta }
					>
						{ __( 'Fetch metadata', 'web-bookmark-block' ) }
					</Button>
					{ isFetchingURL && <Spinner /> }
				</>
			) }
		</div>
	);
}
