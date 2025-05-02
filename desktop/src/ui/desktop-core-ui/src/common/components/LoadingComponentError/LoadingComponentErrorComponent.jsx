/* ************************************* */
/* ********       IMPORTS       ******** */
/* ************************************* */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import autobind from 'autobind-decorator';
import { PageLayout, BodyHeader, Panel, PanelHeader, PanelSection, Alert } from '@beyond-framework/common-uitoolkit-beyond';

/* ************************************* */
/* ********      VARIABLES      ******** */
/* ************************************* */
// Prop types
const propTypes = {
    error: PropTypes.instanceOf(Error).isRequired,
    t: PropTypes.func,
};
// Default props
const defaultProps = {};

/* ************************************* */
/* ********      COMPONENT      ******** */
/* ************************************* */
@translate(['errors'], { wait: true })
class LoadingComponentErrorComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
        };
    }

    @autobind
    onCollapseClick(event, isExpanded) {
        this.setState({ expanded: isExpanded });
    }

    render() {
        const { t, error } = this.props;
        const { expanded } = this.state;

        return (
            <PageLayout header={<BodyHeader title={t('loadingComponent.title')} />}>
                <Alert behavior="danger">{t('loadingComponent.message')}</Alert>
                <Panel
                    id="loading-component"
                    header={<PanelHeader title={t('loadingComponent.panel.title')} />}
                    expanded={expanded}
                    onCollapseClick={this.onCollapseClick}
                    uncollapsibleSections={1}
                >
                    <PanelSection title={t('loadingComponent.panel.message')}>{error.message}</PanelSection>
                    <PanelSection title={t('loadingComponent.panel.stack')}>
                        <pre>{error.stack}</pre>
                    </PanelSection>
                </Panel>
            </PageLayout>
        );
    }
}

// Add prop types
LoadingComponentErrorComponent.propTypes = propTypes;
// Add default props
LoadingComponentErrorComponent.defaultProps = defaultProps;

/* ************************************* */
/* ********       EXPORTS       ******** */
/* ************************************* */
export default LoadingComponentErrorComponent;
