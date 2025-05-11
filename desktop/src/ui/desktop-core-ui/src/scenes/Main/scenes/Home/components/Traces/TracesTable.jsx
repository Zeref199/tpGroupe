import React, {useEffect, useState, useCallback} from 'react';
import {  Button, Modal, ModalHeader, ModalBody, ModalFooter,Dropdown2, DropdownItem2,CgdTable, LoadingSpinner2 } from '@beyond-framework/common-uitoolkit-beyond';
import {CgIcon} from '@beyond-framework/common-uitoolkit-icons';
import {connect} from 'react-redux';
import actions from '../../actions';
import PropTypes from "prop-types";
import moment from 'moment';
import TimeRangePicker from "../helpers/TimeRangePicker";


function TracesTableComponent({ traces, loading, fetchTraces }) {

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedOperation, setSelectedOperation] = useState('');
    const [statusFilter, setStatusFilter]           = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTrace, setSelectedTrace] = useState(null);
    const [traceIdFilter,     setTraceIdFilter]     = useState('');
    const [numPSFilter,       setNumPSFilter]       = useState('');
    const [numAMCFilter,      setNumAMCFilter]      = useState('');
    const [refreshSecs, setRefreshSecs] = useState(null);

    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);

    const doFetch = useCallback(() => {
        fetchTraces({
            page,
            size: pageSize,
            operation: selectedOperation,
            from: from?.getTime(),
            to: to?.getTime(),
            status: statusFilter,
            traceId: traceIdFilter,
            numPS: numPSFilter,
            numAMC: numAMCFilter
        });
    }, [page, pageSize, selectedOperation, from, to, statusFilter, traceIdFilter, numPSFilter, numAMCFilter]);


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

                <Dropdown2 className="mr-4 ml-4" id="operation-dropdown"
                           label={selectedOperation || 'Filter by Operation'}>
                    {[
                        {label: 'All', value: ''},
                        {label: 'AbonnementPS', value: 'AbonnementPS'},
                        {label: 'IDB', value: 'IDB'},
                        {label: 'CLC', value: 'CLC'},
                        {label: 'DmdePratique', value: 'DmdePratique'},
                        {label: 'ConventionPS', value: 'ConventionPS'},
                        {label: 'restitutionAMC', value: 'restitutionAMC'},
                        {label: 'InterAMC', value: 'InterAMC'},
                        {label: 'DmdeSignature', value: 'DmdeSignature'}
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

                <Dropdown2
                    id="status-dropdown"
                    label={statusFilter || 'Filter by Status'}
                >
                    {[
                        {label: 'All', value: ''},
                        {label: 'PASSED', value: 'PASSED'},
                        {label: 'FAILED', value: 'FAILED'},
                    ].map(opt => (
                        <DropdownItem2
                            key={opt.value}
                            type="item"
                            label={opt.label}
                            action={() => {
                                setStatusFilter(opt.value);
                                setPage(0);
                            }}
                        />
                    ))}
                </Dropdown2>
                <Dropdown2
                    id="filter-dropdown"
                    label={'Filter by TraceId'}
                    className="mr-4 ml-4"
                >
                    <input
                        type="text"
                        placeholder="Trace ID"
                        value={traceIdFilter}
                        onChange={e => {
                            setTraceIdFilter(e.target.value);
                            setPage(0);
                        }}
                        style={{
                            width: '100%',
                            padding: '0.25rem 1.5rem 0.25rem 0.5rem',
                            fontSize: '0.875rem',
                            borderRadius: 4,
                            border: '1px solid #ccc'
                        }}
                    />
                    {traceIdFilter && (
                        <CgIcon
                            name="undo"
                            onClick={() => {
                                setTraceIdFilter('');
                                setPage(0);
                            }}
                            style={{
                                position: 'absolute',
                                right: 6,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                color: '#999'
                            }}
                            size={16}
                        />
                    )}
                </Dropdown2>
                <Dropdown2
                    id="filter-dropdown"
                    label={'Filter by numPS'}
                    className="mr-4"
                >
                    <input
                        type="text"
                        placeholder="numPS"
                        value={numPSFilter}
                        onChange={e => {
                            setNumPSFilter(e.target.value);
                            setPage(0);
                        }}
                        style={{
                            width: '100%',
                            padding: '0.25rem 1.5rem 0.25rem 0.5rem',
                            fontSize: '0.875rem',
                            borderRadius: 4,
                            border: '1px solid #ccc'
                        }}
                    />
                    {numPSFilter && (
                        <CgIcon
                            name="undo"
                            onClick={() => {
                                setNumPSFilter('');
                                setPage(0);
                            }}
                            style={{
                                position: 'absolute',
                                right: 6,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                color: '#999'
                            }}
                            size={16}
                        />
                    )}
                </Dropdown2>
                <Dropdown2
                    id="filter-dropdown"
                    label={'Filter by numAMC'}
                >
                    <input
                        type="text"
                        placeholder="numAMC"
                        value={numAMCFilter}
                        onChange={e => {
                            setNumAMCFilter(e.target.value);
                            setPage(0);
                        }}
                        style={{
                            width: '100%',
                            padding: '0.25rem 1.5rem 0.25rem 0.5rem',
                            fontSize: '0.875rem',
                            borderRadius: 4,
                            border: '1px solid #ccc'
                        }}
                    />
                    {numAMCFilter && (
                        <CgIcon
                            name="undo"
                            onClick={() => {
                                setNumAMCFilter('');
                                setPage(0);
                            }}
                            style={{
                                position: 'absolute',
                                right: 6,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                color: '#999'
                            }}
                            size={16}
                        />
                    )}
                </Dropdown2>

                <TimeRangePicker
                    onApply={(newFrom, newTo) => {
                        setFrom(newFrom);
                        setTo(newTo);
                        setPage(0);
                    }}
                />

                <div className="refresh-div-style">
                    <Button
                        onClick={doFetch}
                        disabled={loading}
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

            {loading ? (<div style={{border: 'solid 1px black', width: '100%', height: '100px', position: 'relative'}}>
                <LoadingSpinner2/>
            </div>) : (<CgdTable
                id="traces-table"
                withResize
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
                    {
                        id: 'trace-id',
                        Header: 'Trace ID',
                        accessor: 'traceId',
                        Cell: ({value}) => (
                            <a
                                href={`https://jaeger-tpgroup-rp00-es14.prod.beyond.cegedim.cloud/trace/${value}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{color: '#007bff', textDecoration: 'underline'}}
                            >
                            {value}
                </a>
            ),
                type: 'TEXT'
            },
                    {id: 'operation', Header: 'Operation', accessor: 'operation', type: 'TEXT'},
                    {id: 'status', Header: 'Status', accessor: row => row.details?.status || 'N/A', type: 'TEXT'},
                    {
                        id: 'start-time',
                        Header: 'Execution Time',
                        accessor: row => moment(row.startTime).format('YYYY-MM-DD HH:mm:ss'),
                        type: 'TEXT'
                    },
                    {
                        id: 'details',
                        Header: 'Details',
                        Cell: ({ row }) => {
                            const { operation, details } = row.original;
                            const disabled =
                                (operation === 'InterAMC' && details.status === 'PASSED') ||
                                operation === 'DmdeSignature';

                            return (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%'
                                }}
                            >
                                <Button
                                    behavior="info"
                                    placeholder="Details"
                                    circle
                                    disabled={disabled}
                                    onClick={() => {
                                        setSelectedTrace(row.original);
                                        setModalOpen(true);
                                    }}
                                >
                                    <CgIcon name="list"/>
                                </Button>
                            </div>
                            );
                        }

                    },
                ]}
            />)}
            {selectedTrace && (
                <Modal
                    size="md"
                    isOpen={modalOpen}
                    isOutsideModalClicked={false}
                    toggle={() => setModalOpen(false)}
                    backdrop="static"
                >
                    <ModalHeader toggle={() => setModalOpen(false)}>
                        Trace Details
                    </ModalHeader>

                    <ModalBody>
                        {selectedTrace.operation === 'AbonnementPS' && (() => {
                            const code = selectedTrace.details['TypeDemande'];
                            const labels = {
                                A: 'Activation',
                                I: 'Demande Initial',
                                M: 'Modification',
                                R: 'Résiliation'
                            };
                            return (
                                <>
                                    <p><strong>NumPS:</strong> {selectedTrace.details['request.num.ps']}</p>
                                    <p><strong>AckMessage:</strong> {selectedTrace.details['AckMessage']}</p>
                                    <p>
                                        <strong>TypeDemande:</strong>{' '}
                                        {labels[code] || code /* fallback to raw code if unmapped */}
                                    </p>
                                </>
                            );
                        })()}

                        {['IDB','CLC'].includes(selectedTrace.operation) && (
                            <>
                                <p><strong>NumPS:</strong> {selectedTrace.details['request.num.ps']}</p>
                                <p><strong>URI:</strong> {selectedTrace.details['request.uri']}</p>
                                <p><strong>NumAMC:</strong> {selectedTrace.details['request.num.amc']}</p>
                                {selectedTrace.details.status === 'FAILED' && (
                                    <p>
                                        <strong>Failure reason:</strong>{' '}
                                        {selectedTrace.details['failure.reason']}
                                    </p>
                                )}
                            </>
                        )}

                        {selectedTrace.operation === 'DmdePratique' && (
                            <>
                                <p><strong>NumPS:</strong> {selectedTrace.details['request.num.ps']}</p>
                                <p><strong>URI:</strong> {selectedTrace.details['request.uri']}</p>
                                {selectedTrace.details.status === 'PASSED' ? (
                                    <p>
                                        <strong>AckCode:</strong> {selectedTrace.details['AckCode']}
                                    </p>
                                ) : (
                                    <p>
                                        <strong>AckMessage:</strong> {selectedTrace.details['AckMessage']}
                                    </p>
                                )}
                            </>
                        )}

                        {selectedTrace.operation === 'ConventionPS' && (
                            <>
                                <p><strong>NumPS:</strong> {selectedTrace.details['request.num.ps']}</p>
                                <p><strong>NumAMC:</strong> {selectedTrace.details['request.num.amc']}</p>
                                {selectedTrace.details.status === 'FAILED' && (
                                    <p>
                                        <strong>Fault:</strong>{' '}
                                        {selectedTrace.details['response.fault.string']}
                                    </p>
                                )}
                            </>
                        )}

                        {selectedTrace.operation === 'restitutionAMC' && (
                            <>
                                <p><strong>NumPS:</strong> {selectedTrace.details['request.num.ps']}</p>
                                {selectedTrace.details.status === 'FAILED' && (
                                    <p>
                                        <strong>Fault:</strong>{' '}
                                        {selectedTrace.details['response.fault.string']}
                                    </p>
                                )}
                            </>
                        )}

                        {selectedTrace.operation === 'InterAMC' && selectedTrace.details.status === 'FAILED' && (
                            <p>
                                <strong>Error message:</strong>{' '}
                                { /* whatever field your extractor put for InterAMC failures */ }
                                {selectedTrace.details['message'] || selectedTrace.details['code_retour']}
                            </p>
                        )}

                        {/* we never open a modal for DmdeSignature */}
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            className="btn-max-width-modal"
                            behavior="secondary"
                            onClick={() => setModalOpen(false)}
                        >
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>
            )}

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