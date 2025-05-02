import { connect } from 'react-redux';
import AllFavoritesComponent from './AllFavoritesComponent';

const mapStateToProps = state => ({
    menuItems: state.desktop.menuItems,
    menuLoading: state.main.computedMenu.menuLoading,
});

export default connect(mapStateToProps)(AllFavoritesComponent);
