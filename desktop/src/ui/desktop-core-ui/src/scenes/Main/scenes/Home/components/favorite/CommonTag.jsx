import React from 'react';
import PropTypes from 'prop-types';

function getCommonProps(favorite, isContent) {
    let commonProps = {
        className: isContent ? 'favorite-button-style favorite-content-style' : 'favorite-button-style',
    };
    const { link } = favorite;
    if (link) {
        const { props: { href, openInNewTab }, external } = link;
        if (external) {
            commonProps = { ...commonProps, href, target: openInNewTab ? '_blank' : '_self' };
        }
    }
    return commonProps;
}

function CommonTag({ children, favorite, isContent }) {
    return <a {...getCommonProps(favorite, isContent)}>{children}</a>;
}

CommonTag.propTypes = {
    children: PropTypes.node,
    favorite: PropTypes.shape({}),
    isContent: PropTypes.bool,
};
export default CommonTag;
