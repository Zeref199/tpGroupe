import React, { Fragment } from 'react';
import { CgIcon } from '@beyond-framework/common-uitoolkit-beyond';
import uuid from 'uuid-random';
import { translate } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { LoadingSpinner } from '@beyond-framework/common-uitoolkit-beyond';
import FavoriteComponent from '../favorite/FavoriteComponent';

const FAVORITES_PER_ROW = 7;

function computeFavorites(menuItems, computedParentsLabel) {
    return menuItems.reduce((acc, menuItem) => {
        const computedParentsLabelClone = computedParentsLabel
            ? `${computedParentsLabel}/${menuItem.label}`
            : menuItem.label;

        let accumulatorClone = acc;

        if (menuItem.children) {
            accumulatorClone = [...accumulatorClone, ...computeFavorites(menuItem.children, computedParentsLabelClone)];
        }
        if (menuItem.starred && !menuItem.inFavorites) {
            accumulatorClone = [...accumulatorClone, { ...menuItem, computedParentsLabel: computedParentsLabelClone }];
        }
        return accumulatorClone;
    }, []);
}

function spliceFavorites(computedFavorites) {
    const splicedFavorites = [];
    const nbrOfChunks = Math.ceil(computedFavorites.length / FAVORITES_PER_ROW);
    for (let i = 0; i < nbrOfChunks; i += 1) {
        splicedFavorites.push(computedFavorites.slice(i * FAVORITES_PER_ROW, (i + 1) * FAVORITES_PER_ROW));
    }
    return splicedFavorites;
}

function mockRestOfColumns(lastRowLength) {
    let remainingColumns = [];
    for (let i = 0; i < FAVORITES_PER_ROW - lastRowLength; i += 1) {
        const random = uuid();
        remainingColumns = [...remainingColumns, { id: random, mocked: true }];
    }
    return remainingColumns;
}

function handleSplicedFavorites(splicedFavorites) {
    const lastIndex = splicedFavorites.length - 1;
    const favorites = [...splicedFavorites];
    if (lastIndex >= 0 && splicedFavorites[lastIndex].length < FAVORITES_PER_ROW && lastIndex !== 0) {
        favorites[lastIndex] = [...favorites[lastIndex], ...mockRestOfColumns(splicedFavorites[lastIndex].length)];
    }
    return favorites;
}

function renderNoFavLabel(t) {
    return (
        <div className="no-fav-style">
            {t('landingPage.noFavStartLabel')}
            <CgIcon className="favorite-star-color pl-1" name="checked-favorite" size="lg" />
            {t('landingPage.noFavEndLabel')}
        </div>
    );
}

function AllFavoritesComponent({ menuItems, menuLoading, t }) {
    const computedFavorites = computeFavorites(menuItems);
    const splicedFavorites = spliceFavorites(computedFavorites);
    const favorites = handleSplicedFavorites(splicedFavorites);
    return (
        <Fragment>
            {menuLoading && <LoadingSpinner iconSize="3x" type="over" behavior="primary" />}
            {computedFavorites.length === 0
                ? renderNoFavLabel(t)
                : favorites.map((chunk, chunkIndex) => (
                      <div
                          className={classNames('favorites-row-style', {
                              'favorites-last-row-style': chunkIndex !== 0 && chunkIndex === favorites.length - 1,
                          })}
                          // eslint-disable-next-line react/no-array-index-key
                          key={`chunk_${chunkIndex}`}
                      >
                          {chunk.map(favorite => <FavoriteComponent key={favorite.id} favorite={favorite} />)}
                      </div>
                  ))}
        </Fragment>
    );
}

AllFavoritesComponent.propTypes = {
    menuLoading: PropTypes.bool,
    menuItems: PropTypes.array,
    t: PropTypes.func,
};

export default translate(['common'])(AllFavoritesComponent);
