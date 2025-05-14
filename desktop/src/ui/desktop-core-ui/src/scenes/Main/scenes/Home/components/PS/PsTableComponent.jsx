import React, {useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DropdownItem2, Button, Dropdown2, CgdTable, LoadingSpinner2 } from '@beyond-framework/common-uitoolkit-beyond';
import actions from '../../actions';
import TimeRangePicker from "../helpers/TimeRangePicker";
import {CgIcon} from "@beyond-framework/common-uitoolkit-icons";


function PsTableComponent({ psList, psLoading, fetchPS }) {
    const [refreshSecs, setRefreshSecs] = useState(null);
    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);



    const doFetch = useCallback(() => {
        const fromMs =
            from == null
                ? undefined
                : (typeof from.getTime === 'function'
                    ? from.getTime()
                    : new Date(from).getTime());
        const toMs =
            to == null
                ? undefined
                : (typeof to.getTime === 'function'
                    ? to.getTime()
                    : new Date(to).getTime());


        fetchPS({
            from: fromMs,
            to: toMs,
        });
    }, [from, to]);


    useEffect(doFetch, [doFetch]);

    useEffect(() => {
        if (refreshSecs && refreshSecs > 0) {
            const id = setInterval(doFetch, refreshSecs * 1000);
            return () => clearInterval(id);
        }
    }, [refreshSecs, doFetch]);


    const intervals = [
        { label: 'Off',   value: null },
        { label: '5s',    value: 5 },
        { label: '10s',   value: 10 },
        { label: '30s',   value: 30 },
        { label: '1m',    value: 60 },
        { label: '5m',    value: 300 },
        { label: '15m',   value: 900 },
        { label: '30m',   value: 1800 },
        { label: '1h',    value: 3600 },
        { label: '2h',    value: 7200 },
        { label: '1d',    value: 86400 },
    ];



    return (
        <>
        <div style={{display: 'flex', marginTop: '10px'}}>
            <TimeRangePicker
                onApply={(newFrom, newTo) => {
                    setFrom(newFrom);
                    setTo(newTo);

                }}
            />

            <div className="refresh-div-style">
                <Button
                    onClick={doFetch}
                    disabled={psLoading}
                    title="Refresh now"
                    className="trp-button"
                >
                    <CgIcon name="refresh"/> Refresh
                </Button>
                <Dropdown2
                    id="refresh-interval"
                    label={
                        <>
                            {' '}
                            {refreshSecs == null
                                ? 'Off'
                                : `${refreshSecs < 60
                                    ? refreshSecs + 's'
                                    : (refreshSecs / 60) + 'm'
                                }`}
                        </>
                    }
                >
                    {intervals.map(opt => (
                        <DropdownItem2
                            key={opt.label}
                            type="item"
                            label={opt.label}
                            action={() => setRefreshSecs(opt.value)}
                        />
                    ))}
                </Dropdown2>
            </div>
        </div>
            {psLoading ? (<div style={{border: 'solid 1px black', width: '100%', height: '100px', position: 'relative'}}>
                <LoadingSpinner2/>
            </div>) : (<CgdTable
                id="ps-table"
                data={psList}
                manual={false}
                pageSize={10}
                columns={[
                    {id: 'nationalId', Header: 'Num PS', accessor: 'nationalId', type: 'TEXT'},
                    {id: 'lastName', Header: 'Nom', accessor: 'lastName', type: 'TEXT'},
                    {id: 'firstName', Header: 'Prénom', accessor: 'firstName', type: 'TEXT'},
                    {id: 'email', Header: 'Email', accessor: 'email', type: 'TEXT'},
                ]}
            />)}

        </>
            );
            }

            PsTableComponent.propTypes = {
            psList:    PropTypes.array.isRequired,
            psLoading: PropTypes.bool.isRequired,
            fetchPS:   PropTypes.func.isRequired,
        };

            const mapStateToProps = state => ({
            psList:    state.main.home.traceReducer.psList,
            psLoading: state.main.home.traceReducer.psLoading,
        });

            const mapDispatchToProps = {
            fetchPS: actions.fetchPS,
        };

            export default connect(mapStateToProps, mapDispatchToProps)(PsTableComponent);