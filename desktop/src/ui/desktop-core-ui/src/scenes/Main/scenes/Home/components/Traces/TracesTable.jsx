import React, {useEffect, useRef, useState} from 'react';
import { Row, Col, Button, Label, Input,CgdTable, Filtering, LoadingSpinner2 } from '@beyond-framework/common-uitoolkit-beyond';
import {connect} from 'react-redux';
import actions from '../../actions';
import PropTypes from "prop-types";


function TracesTableComponent({ traces, loading, fetchTraces }) {

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        fetchTraces({ page, size: pageSize });
    }, [page, pageSize]);


    if (loading) {
        return (
            <div style={{ border: 'solid 1px black', width: '100%', height: '100px', position: 'relative' }}>
                <LoadingSpinner2 />
            </div>
        );
    }

    return (
        <>
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