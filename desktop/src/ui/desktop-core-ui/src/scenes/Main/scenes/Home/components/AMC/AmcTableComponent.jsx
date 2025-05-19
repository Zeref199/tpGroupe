import React, {useCallback, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Filtering, Label, Input, Row, Col, DropdownItem2, Button, Dropdown2, CgdTable, LoadingSpinner2 } from '@beyond-framework/common-uitoolkit-beyond';
import actions from '../../actions';
import TimeRangePicker from "../helpers/TimeRangePicker";
import {CgIcon} from "@beyond-framework/common-uitoolkit-icons";


function AmcTableComponent({ amcList, amcLoading, fetchAMC }) {
    const [refreshSecs, setRefreshSecs] = useState(null);
    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);

    const [chips, setChips]                 = useState([]);
    const [expanded, setExpanded]           = useState(false);
    const buttonRef                          = useRef();
    const [numAMCFilter,       setNumAMCFilter]       = useState('');

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
        fetchAMC({
            from: fromMs,
            to: toMs,
            numAmc: numAMCFilter,
        });
    }, [from, to, numAMCFilter]);


    useEffect(doFetch, [doFetch]);

    useEffect(() => {
        if (refreshSecs && refreshSecs > 0) {
            const id = setInterval(doFetch, refreshSecs * 1000);
            return () => clearInterval(id);
        }
    }, [refreshSecs, doFetch]);

    const onFormChange = e => {
        const { name, value } = e.target;
        if (name === 'numPs')     setNumAMCFilter(value);
    };

    const resetFields = () => {
        setNumAMCFilter('');
    };

    const onCloseChip = (chipToRemove) => {
        const remaining = chips.filter(c => c.key !== chipToRemove.key);
        setChips(remaining);

        if (chipToRemove.key === 'numAmc')     setNumAMCFilter('');

        fetchAMC({
            from: fromMs,
            to: toMs,
            numAmc:   remaining.find(c=>c.key==='numAmc')?.label.split(': ')[1]    || '',
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
                        value={numAMCFilter}
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
                        disabled={amcLoading}
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
            {amcLoading ? (<div style={{border: 'solid 1px black', width: '100%', height: '100px', position: 'relative'}}>
                <LoadingSpinner2/>
            </div>) : (<CgdTable
                id="amc-table"
                data={amcList}
                manual={false}
                columns={[
                    { id: 'numAmcOtp',           Header: 'NumAMC',          accessor: 'numAmcOtp',           type: 'TEXT' },
                    { id: 'labelAmcOtp',         Header: 'Label',           accessor: 'labelAmcOtp',         type: 'TEXT' },
                    { id: 'convType',            Header: 'Type Convention',       accessor: 'convType',            type: 'TEXT' },
                    { id: 'secondaryCriteria',   Header: 'critère secondaire', Cell: ({ value }) => value || 'Aucun critère secondaire',    accessor: 'secondaryCriteria',   type: 'TEXT' },
                    { id: 'interAmc',            Header: 'InterAMC?',       accessor: row => row.interAmc ? 'Yes' : 'No', type: 'TEXT' },
                    { id: 'inscritPF',           Header: 'Registered?',     accessor: row => row.inscritPF ? 'Yes' : 'No',  type: 'TEXT' },
                    { id: 'selInterAmc',         Header: 'SelInterAMC',     accessor: 'selInterAmc',         type: 'TEXT' },
                ]}
            />)}

        </>
    );
}

AmcTableComponent.propTypes = {
    amcList:    PropTypes.array.isRequired,
    amcLoading: PropTypes.bool.isRequired,
    fetchAMC:   PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    amcList:    state.main.home.traceReducer.amcList,
    amcLoading: state.main.home.traceReducer.amcLoading,
});

const mapDispatchToProps = {
    fetchAMC: actions.fetchAMC,
};

export default connect(mapStateToProps, mapDispatchToProps)(AmcTableComponent);