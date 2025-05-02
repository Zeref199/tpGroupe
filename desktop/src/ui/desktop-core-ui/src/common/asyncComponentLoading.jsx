/* ************************************* */
/* ********       IMPORTS       ******** */
/* ************************************* */
import React from 'react';
import { asyncComponent } from 'react-async-component';
import { LoadingSpinner } from '@beyond-framework/common-uitoolkit-beyond';
import LoadingComponentError from './components/LoadingComponentError/LoadingComponentErrorComponent';

/* ************************************* */
/* ********      VARIABLES      ******** */
/* ************************************* */

/* ************************************* */
/* ********       EXPORTS       ******** */
/* ************************************* */
export default makeAsync;

/* ************************************* */
/* ********  PRIVATE FUNCTIONS  ******** */
/* ************************************* */

/* ************************************* */
/* ********   PUBLIC FUNCTIONS  ******** */
/* ************************************* */
/**
 * Make component async loaded.
 * @param resolve
 * @return {React.ComponentClass<any>}
 */
function makeAsync(resolve) {
    return asyncComponent({
        resolve,
        // eslint-disable-next-line react/prop-types
        ErrorComponent: props => <LoadingComponentError {...props} />,
        LoadingComponent: () => <LoadingSpinner type="over" />,
    });
}
