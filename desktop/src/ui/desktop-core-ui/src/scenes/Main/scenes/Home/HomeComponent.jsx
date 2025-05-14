/* ************************************* */
/* ********       IMPORTS       ******** */
/* ************************************* */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { DesktopBreadcrumbPart } from '@beyond-framework/common-uitoolkit-beyond';

import 'moment/locale/es'
import 'moment/locale/fr'

import './style.scss';
import FavoriteComponent from "./components/favorite/FavoriteComponent";

/* ************************************* */
/* ********      VARIABLES      ******** */
/* ************************************* */

/* ************************************* */
/* ********      COMPONENT      ******** */
/* ************************************* */
const HomeComponent = ({ t, shouldDisplayLogo }) => {

    return (
        <Fragment>
            <DesktopBreadcrumbPart label={t('breadcrumb.Home')} />
            <div className="global-flexbox">
                <FavoriteComponent />
            </div>
        </Fragment>
    );
};

HomeComponent.propTypes = {
    t: PropTypes.func,
    shouldDisplayLogo: PropTypes.bool,
};

/* ************************************* */
/* ********       EXPORTS       ******** */
/* ************************************* */
export default HomeComponent;
