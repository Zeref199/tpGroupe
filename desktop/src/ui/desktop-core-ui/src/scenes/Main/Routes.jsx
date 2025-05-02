/* ************************************* */
/* ********       IMPORTS       ******** */
/* ************************************* */
import React, { Fragment } from 'react';
import { Route } from 'react-router-dom';
import { translate } from 'react-i18next';
import asyncComponentLoading from '../../common/asyncComponentLoading';

/* ************************************* */
/* ********       EXPORTS       ******** */
/* ************************************* */

const Home = asyncComponentLoading(() => import('./scenes/Home/Home'));

/* ************************************* */
/* ********      VARIABLES      ******** */
/* ************************************* */

/* ************************************* */
/* ********      COMPONENT      ******** */
/* ************************************* */

function Routes() {
    return (
        <Fragment>
            <Route path="/" component={Home} exact />
        </Fragment>
    );
}

/* ************************************* */
/* ********       EXPORTS       ******** */
/* ************************************* */
export default translate()(Routes);
