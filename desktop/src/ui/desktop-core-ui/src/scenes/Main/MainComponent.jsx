/* ************************************* */
/* ********       IMPORTS       ******** */
/* ************************************* */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { Route } from 'react-router-dom';
import autobind from 'autobind-decorator';
import { AlertList, BeyondAppLayout } from '@beyond-framework/common-uitoolkit-beyond';
import Routes from './Routes';
import './style.scss';

/* ************************************* */
/* ********      VARIABLES      ******** */
/* ************************************* */
// Prop types
const propTypes = {
    t: PropTypes.func,
    removeAlert: PropTypes.func.isRequired,
    notifications: PropTypes.array,
    breadcrumb: PropTypes.array,
    i18n: PropTypes.object,
    beyondVersion: PropTypes.string,
};

// Prop types
const defaultProps = {
    notifications: [],
};

/* ************************************* */
/* ********      COMPONENT      ******** */
function DesktopFooter({beyondVersion}) {
    return (<div className="footer">{beyondVersion}</div>);
}

/* ************************************* */
@translate(['errors'], { wait: true })
class MainComponent extends Component {
    @autobind
    onAlertDismissed(alert) {
        const { removeAlert } = this.props;
        removeAlert(alert);
    }

    render() {
        const { t, notifications, breadcrumb, i18n, beyondVersion } = this.props;

        const alerts = notifications.map(n => ({
            id: n.id,
            headline: t(n.headline),
            message: t(n.message),
            behavior: n.behavior,
            timeout: n.behavior === 'danger' ? 0 : 3000,
        }));

        return (
            <Fragment>
                <BeyondAppLayout
                    breadcrumb={breadcrumb}
                    selectedMenuItemId="next-desktop-core"
                    language={i18n.language || i18n.languages[0]}
                >
                    <Route component={Routes} />
                    <DesktopFooter beyondVersion={beyondVersion} />
                </BeyondAppLayout>
                <AlertList position="top-right" header icon alerts={alerts} onDismiss={this.onAlertDismissed} />
            </Fragment>
        );
    }
}

// Add prop types
MainComponent.propTypes = propTypes;
// Add default props
MainComponent.defaultProps = defaultProps;

/* ************************************* */
/* ********       EXPORTS       ******** */
/* ************************************* */
export default MainComponent;
