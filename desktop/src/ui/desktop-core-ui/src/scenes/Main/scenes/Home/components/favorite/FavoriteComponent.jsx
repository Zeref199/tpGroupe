import React from 'react';
import { CgIcon } from '@beyond-framework/common-uitoolkit-beyond';
import { Button, Tooltip } from '@beyond-framework/common-uitoolkit-beyond';
import PropTypes from 'prop-types';
import CommonTag from './CommonTag';

function FavoriteComponent({ favorite }) {
    const className = 'favorite-col-style';
    const { mocked, label } = favorite;
    return !mocked ? (
        <div className={className} id={favorite.id}>
            <Tooltip placement="top" target={favorite.id}>
                {favorite.computedParentsLabel}
            </Tooltip>
            <CommonTag favorite={favorite}>
                <Button outlineNoBorder behavior="primary">
                    <CgIcon name="checked-favorite" size="2x" />
                </Button>
            </CommonTag>
            <CommonTag favorite={favorite} isContent>
                <span>{label}</span>
            </CommonTag>
        </div>
    ) : (
        <div className={className} />
    );
}
FavoriteComponent.propTypes = {
    favorite: PropTypes.shape({}),
};
export default FavoriteComponent;
