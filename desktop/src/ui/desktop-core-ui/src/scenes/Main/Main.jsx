/* ************************************* */
/* ********       IMPORTS       ******** */
/* ************************************* */
import { connect } from 'react-redux';
import MainComponent from './MainComponent';
import actions from '../../common/actions';

/* ************************************* */
/* ********      VARIABLES      ******** */
/* ************************************* */
const Main = connect(mapStateToProps, mapDispatchToProps)(MainComponent);

/* ************************************* */
/* ********  PRIVATE FUNCTIONS  ******** */
/* ************************************* */
function mapStateToProps(state) {
    return {
        notifications: state.common.notifications,
        breadcrumb: state.main.breadcrumb,
        beyondVersion: state.common.configuration.values.version,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        removeAlert: alert => dispatch(actions.removeAlert(alert)),
    };
}

/* ************************************* */
/* ********       EXPORTS       ******** */
/* ************************************* */
export default Main;
