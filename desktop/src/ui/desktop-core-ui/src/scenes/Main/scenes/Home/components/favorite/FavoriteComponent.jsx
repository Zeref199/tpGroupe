import React, {useState} from 'react';
import {  TabContent, TabPane, Nav, NavItem, NavLink } from '@beyond-framework/common-uitoolkit-beyond';
import classNames from 'classnames';
import TracesTable from "../Traces/TracesTableComponent";
import PsTableComponent from "../PS/PsTableComponent";

function FavoriteComponent({  }) {
    const [selectedTab, setSelectedTab] = useState('Traces');
    return (
        <>
            <Nav tabs>
                <NavItem>
                    <NavLink
                        id="tab-delegations"
                        className={classNames({ active: selectedTab === 'Traces' })}
                        onClick={() => setSelectedTab('Traces')}
                    >
                        Traces
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        id="tab-networks"
                        className={classNames({ active: selectedTab === 'PS' })}
                        onClick={() => setSelectedTab('PS')}
                    >
                        PS
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        id="tab-networks"
                        className={classNames({ active: selectedTab === 'AMC' })}
                        onClick={() => setSelectedTab('AMC')}
                    >
                        AMC
                    </NavLink>
                </NavItem>
            </Nav>

            <TabContent activeTab={selectedTab}>
                <TabPane tabId="Traces">
                    {selectedTab === 'Traces' && <TracesTable />}
                </TabPane>
                <TabPane tabId="PS">
                    {selectedTab === 'PS' && <PsTableComponent />}
                </TabPane>
            </TabContent>
        </>
    );
}
FavoriteComponent.propTypes = {

};
export default FavoriteComponent;
