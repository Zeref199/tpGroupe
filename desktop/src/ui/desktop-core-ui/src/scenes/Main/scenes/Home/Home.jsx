/* ************************************* */
/* ********       IMPORTS       ******** */
/* ************************************* */
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import HomeComponent from './HomeComponent';
import globalActions from '../../../../common/actions';

/* ************************************* */
/* ********      VARIABLES      ******** */
/* ************************************* */
const mapDispatchToProps = {
    updateBreadcrumbRoutes: globalActions.updateBreadcrumbRoutes,
};
const mapStateToProps = state => ({
    shouldDisplayLogo: state.common.configuration.values.shouldDisplayLogo,
});

const Home = translate(['breadcrumb', 'common'])(connect(mapStateToProps, mapDispatchToProps)(HomeComponent));

/* ************************************* */
/* ********  PRIVATE FUNCTIONS  ******** */
/* ************************************* */

/* ************************************* */
/* ********       EXPORTS       ******** */
/* ************************************* */
export default Home;
