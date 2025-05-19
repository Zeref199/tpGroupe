import React, {useCallback, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Filtering, Label, Input, Row, Col, DropdownItem2, Button, Dropdown2, CgdTable, LoadingSpinner2 } from '@beyond-framework/common-uitoolkit-beyond';
import actions from '../../actions';
import TimeRangePicker from "../helpers/TimeRangePicker";
import {CgIcon} from "@beyond-framework/common-uitoolkit-icons";


function PsTableComponent({ psList, psLoading, fetchPS }) {
    const [refreshSecs, setRefreshSecs] = useState(null);
    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);

    const [chips, setChips]                 = useState([]);
    const [expanded, setExpanded]           = useState(false);
    const buttonRef                          = useRef();
    const [numPSFilter,       setNumPSFilter]       = useState('');

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



    const doFetch = useCallback(() => {
        fetchPS({
            from: fromMs,
            to: toMs,
            numPs: numPSFilter,
        });
    }, [from, to, numPSFilter]);


    useEffect(doFetch, [doFetch]);

    useEffect(() => {
        if (refreshSecs && refreshSecs > 0) {
            const id = setInterval(doFetch, refreshSecs * 1000);
            return () => clearInterval(id);
        }
    }, [refreshSecs, doFetch]);

    const onFormChange = e => {
        const { name, value } = e.target;
        if (name === 'numPs')     setNumPSFilter(value);
    };

    const resetFields = () => {
        setNumPSFilter('');
    };

    const onCloseChip = (chipToRemove) => {
        const remaining = chips.filter(c => c.key !== chipToRemove.key);
        setChips(remaining);

        if (chipToRemove.key === 'numPs')     setNumPSFilter('');

        fetchPS({
            from: fromMs,
            to: toMs,
            numPs:   remaining.find(c=>c.key==='numPs')?.label.split(': ')[1]    || '',
        });
    };


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
            <Filtering
                chips={chips}
                onCloseChip={onCloseChip}
                onCollapseClick={() => setExpanded(!expanded)}
                expanded={expanded}
                ref={buttonRef}
                filterLabel="Filtres"
            >

                        <Label htmlFor="numPs" className="ml-4 mt-2">Num PS</Label>
                        <Input
                            size="sm"
                            name="numPs"
                            value={numPSFilter}
                            onChange={onFormChange}
                            style={{
                                width: '300px',
                                border: '1px solid #ccc'
                            }}
                            className="ml-4 mt-2"
                        />
                        <Button
                            behavior="secondary"
                            outline
                            onClick={resetFields}
                            title="Réinitialiser"
                            className="ml-4 mt-2"
                        >
                            <CgIcon name="undo" />
                        </Button>

            </Filtering>

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
                columns={[
                    {id: 'nationalId', Header: 'Num PS', accessor: 'nationalId', type: 'TEXT'},
                    {id: 'lastName', Header: 'Nom', accessor: 'lastName', type: 'TEXT'},
                    {id: 'firstName', Header: 'Prénom', accessor: 'firstName', type: 'TEXT'},
                    {id: 'email', Header: 'Email', accessor: 'email', type: 'TEXT', width: 600},
                    { id: 'lastEventCode',   Header: 'Last Event', accessor: 'lastEventCode',   type: 'TEXT' },
                    { id: 'lastEventDate',   Header: 'Last Event Date', accessor: row =>
                            row.lastEventDate
                                ? new Date(row.lastEventDate).toLocaleString()
                                : '-'
                        , type: 'TEXT' },
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