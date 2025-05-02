import React, {useEffect, useRef, useState} from 'react';
import { DatePicker2, Dropdown2, DropdownItem2, Row, Col,CgdTable, LoadingSpinner2 } from '@beyond-framework/common-uitoolkit-beyond';
import {connect} from 'react-redux';
import actions from '../../actions';
import PropTypes from "prop-types";
import moment from 'moment';
import TimeRangePicker from "../helpers/TimeRangePicker";


function TracesTableComponent({ traces, loading, fetchTraces }) {

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedOperation, setSelectedOperation] = useState('');

    const [from, setFrom] = useState();
    const [to, setTo] = useState();

    const applyTimeRange = (fromMillis, toMillis) => {
        setFrom(fromMillis);
        setTo(toMillis);
        setPage(0); // reset pagination
    };

    useEffect(() => {
        fetchTraces({ page, size: pageSize, operation: selectedOperation, from, to });
    }, [page, pageSize, selectedOperation]);


    if (loading) {
        return (
            <div style={{ border: 'solid 1px black', width: '100%', height: '100px', position: 'relative' }}>
                <LoadingSpinner2 />
            </div>
        );
    }

    return (
        <>
            <Row className="mb-4">
                <Col md={3}>
                    <Dropdown2 id="operation-dropdown" label={selectedOperation || 'Filter by Operation'}>
                        {[
                            { label: 'All', value: '' },
                            { label: 'AbonnementPS', value: 'AbonnementPS' },
                            { label: 'IDB', value: 'IDB' },
                            { label: 'CLC', value: 'CLC' },
                            { label: 'DmdePratique', value: 'DmdePratique' },
                            { label: 'ConventionPS', value: 'ConventionPS' },
                            { label: 'restitutionAMC', value: 'restitutionAMC' },
                            { label: 'InterAMC', value: 'InterAMC' },
                            { label: 'DmdeSignature', value: 'DmdeSignature' }
                        ].map(op => (
                            <DropdownItem2
                                key={op.value}
                                type="item"
                                label={op.label}
                                id={`op-${op.value}`}
                                action={() => {
                                    setSelectedOperation(op.value);
                                    setPage(0); // Reset pagination
                                }}
                            />
                        ))}
                    </Dropdown2>
                </Col>
            </Row>
            <TimeRangePicker onApply={applyTimeRange} />
            <CgdTable
                id="traces-table"
                data={traces}
                manual={true}
                pageIndex={page}
                pageSize={pageSize}
                onPageChange={newPage => setPage(newPage)}
                onPageSizeChange={newSize => {
                    setPageSize(newSize);
                    setPage(0);
                }}
                canPreviousPage={page > 0}
                canNextPage={traces.length === pageSize}
                withShortPagination
                columns={[
                    {id: 'trace-id', Header: 'Trace ID', accessor: 'traceId', type: 'TEXT'},
                    {id: 'operation', Header: 'Operation', accessor: 'operation', type: 'TEXT'},
                    {id: 'status', Header: 'Status', accessor: row => row.details?.status || 'N/A', type: 'TEXT'},
                    {
                        id: 'numPS',
                        Header: 'NumPS',
                        accessor: row => row.details?.['request.num.ps'] || '-',
                        type: 'TEXT'
                    },
                    {
                        id: 'numAMC',
                        Header: 'NumAMC',
                        accessor: row => row.details?.['request.num.amc'] || '-',
                        type: 'TEXT'
                    },
                    { id: 'start-time', Header: 'Execution Time', accessor: row => moment(row.startTime).format('YYYY-MM-DD HH:mm:ss'), type: 'TEXT' },
                ]}
            />

        </>
    );
}


/* ************************************* */
/* ********      PROP TYPES     ******** */
/* ************************************* */
TracesTableComponent.propTypes = {
    traces: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    fetchTraces: PropTypes.func.isRequired,
};

/* ************************************* */
/* ********   REDUX CONNECT    ******** */
/* ************************************* */
const mapStateToProps = (state) => ({
    traces: state.main.home.traceReducer.traces,
    loading: state.main.home.traceReducer.loading,
});

const mapDispatchToProps = {
    fetchTraces: actions.fetchTraces,
};

export default connect(mapStateToProps, mapDispatchToProps)(TracesTableComponent);