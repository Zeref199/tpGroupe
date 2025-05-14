import React, {useEffect, useState, useCallback, useRef} from 'react';
import {  Filtering, Label, Input, Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter,Dropdown2, DropdownItem2,CgdTable, LoadingSpinner2 } from '@beyond-framework/common-uitoolkit-beyond';
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
    const [directionFilter, setDirectionFilter] = useState('');


    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);

    const [chips, setChips]                 = useState([]);
    const [expanded, setExpanded]           = useState(false);
    const buttonRef                          = useRef();

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
        fetchTraces({
            page,
            size: pageSize,
            operation: selectedOperation,
            from: fromMs,
            to: toMs,
            status: statusFilter,
            traceId: traceIdFilter,
            numPS: numPSFilter,
            numAMC: numAMCFilter,
            direction: directionFilter
        });
    }, [page, pageSize, selectedOperation, from, to, statusFilter, traceIdFilter, numPSFilter, numAMCFilter, directionFilter]);


    useEffect(doFetch, [doFetch]);

    useEffect(() => {
        if (refreshSecs && refreshSecs > 0) {
            const id = setInterval(doFetch, refreshSecs * 1000);
            return () => clearInterval(id);
        }
    }, [refreshSecs, doFetch]);

    const onFormChange = e => {
        const { name, value } = e.target;
        if (name === 'traceId')  setTraceIdFilter(value);
        if (name === 'numPs')     setNumPSFilter(value);
        if (name === 'numAmc')    setNumAMCFilter(value);
    };

    const resetFields = () => {
        setTraceIdFilter('');
        setNumPSFilter('');
        setNumAMCFilter('');
    };

    const onCloseChip = (chipToRemove) => {
        const remaining = chips.filter(c => c.key !== chipToRemove.key);
        setChips(remaining);

        // clear that specific filter
        if (chipToRemove.key === 'traceId')  setTraceIdFilter('');
        if (chipToRemove.key === 'numPs')     setNumPSFilter('');
        if (chipToRemove.key === 'numAmc')    setNumAMCFilter('');

        // re-fire query without it
        fetchTraces({
            page,
            size: pageSize,
            selectedOperation,
            statusFilter,
            from,
            to,
            traceId: remaining.find(c=>c.key==='traceId')?.label.split(': ')[1] || '',
            numPs:   remaining.find(c=>c.key==='numPs')?.label.split(': ')[1]    || '',
            numAmc:  remaining.find(c=>c.key==='numAmc')?.label.split(': ')[1]   || ''
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

    const internalOps = [
        "ServiceProviderInitialize",
        "ServiceProviderSubscribe",
        "ServiceProviderUnsubscribe",
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
                        {label: 'DmdeSignature', value: 'DmdeSignature'},
                        {label: 'NotifSignature', value: 'NotifSignature'},
                        {label: 'ServiceProviderInitialize', value: 'ServiceProviderInitialize'},
                        {label: 'ServiceProviderSubscribe', value: 'ServiceProviderSubscribe'},
                        {label: 'ServiceProviderUnsubscribe', value: 'ServiceProviderUnsubscribe'}
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
                        id="direction-dropdown"
                        className="ml-4"
                        label={ directionFilter === 'inbound'
                             ? 'ServiceExterne → TpGroupe'
                                 : directionFilter === 'outbound'
                                 ? 'TpGroupe → ServiceExterne'
                                : directionFilter === "internal"
                                    ? "Interne"
                                     : 'Filter by Direction' }
                        style={{ marginRight: 12 }}
                      >
                        {[
                          { label: 'All',       value: '' },
                          { label: 'ServiceExterne → TpGroupe',   value: 'inbound'   },
                          { label: 'TpGroupe → ServiceExterne',  value: 'outbound'  },
                          { label: "Interne",  value: "internal" },
                        ].map(opt => (
                          <DropdownItem2
                            key={opt.value}
                            type="item"
                            label={opt.label}
                            action={() => {
                              setDirectionFilter(opt.value);
                              setPage(0);
                            }}
                          />
                        ))}
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

            <Filtering
                chips={chips}
                onCloseChip={onCloseChip}
                onCollapseClick={() => setExpanded(!expanded)}
                expanded={expanded}
                ref={buttonRef}
                filterLabel="Filtres"
            >
                <Row>
                    <Col xs="2">
                        <Label htmlFor="traceId">Trace ID</Label>
                        <Input
                            size="sm"
                            name="traceId"
                            value={traceIdFilter}
                            onChange={onFormChange}
                            style={{
                                width: '100%',
                                border: '1px solid #ccc'
                            }}
                        />
                    </Col>
                    <Col xs="2">
                        <Label htmlFor="numPs">Num PS</Label>
                        <Input
                            size="sm"
                            name="numPs"
                            value={numPSFilter}
                            onChange={onFormChange}
                            style={{
                                width: '100%',
                                border: '1px solid #ccc'
                            }}
                        />
                    </Col>
                    <Col xs="2">
                        <Label htmlFor="numAmc">Num AMC</Label>
                        <Input
                            size="sm"
                            name="numAmc"
                            value={numAMCFilter}
                            onChange={onFormChange}
                            style={{
                                width: '100%',
                                border: '1px solid #ccc'
                            }}
                        />
                    </Col>
                    <Col xs="12" className="d-flex align-items-end justify-content-start">
                        <Button
                            behavior="secondary"
                            outline
                            onClick={resetFields}
                            title="Réinitialiser"
                            className="mr-2 mt-2"
                        >
                            <CgIcon name="undo" />
                        </Button>
                    </Col>
                </Row>
            </Filtering>


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

                        getTrProps={(_tableProps, row) => {
                            // row === undefined for the header/footer rows
                            if (!row?.original) {
                                return {};
                            }

                            const status = row.original.details?.status;
                            let backgroundColor;

                            if (status === 'FAILED') {
                                backgroundColor = '#ffe5e5';  // light red
                            } else if (status === 'PASSED') {
                                backgroundColor = '#e5ffe5';  // light green
                            }

                            return {
                                style: { backgroundColor }
                            };
                        }}
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
                                id: "direction",
                                Header: "Direction",
                                accessor: row => {
                                    if (internalOps.includes(row.operation)) {
                                        return "Interne";
                                    }
                                    // 2) inbound: external → TpGroupe
                                    if (row.details?.["request.uri"]?.startsWith("/tpgroup/ws/")) {
                                        return "ServiceExterne → TpGroupe";
                                    }
                                    // 3) outbound: TpGroupe → external
                                    return "TpGroupe → ServiceExterne";
                                },
                                type: "TEXT"
                            },
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
                                        operation === 'DmdeSignature' || operation === 'NotifSignature'||
                                        operation === 'ServiceProviderInitialize' || operation === 'ServiceProviderSubscribe'||
                                        operation === 'ServiceProviderUnsubscribe';


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
                                    <p><strong>URI:</strong> {selectedTrace.details['request.uri']}</p>
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
                                <p><strong>URI:</strong> {selectedTrace.details['request.uri']}</p>
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
                                <p><strong>URI:</strong> {selectedTrace.details['request.uri']}</p>
                                {selectedTrace.details.status === 'FAILED' && (
                                    <p>
                                        <strong>Fault:</strong>{' '}
                                        {selectedTrace.details['response.fault.string']}
                                    </p>
                                )}
                            </>
                        )}

                        {selectedTrace.operation === 'InterAMC' && selectedTrace.details.status === 'FAILED' && (
                            <>
                                <p><strong>URI:</strong> {selectedTrace.details['request.uri']}</p>
                                <p>
                                    <strong>Error message:</strong>{' '}
                                    { /* whatever field your extractor put for InterAMC failures */ }
                                    {selectedTrace.details['message'] || selectedTrace.details['code_retour']}
                                </p>
                            </>
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