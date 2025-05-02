import React, { useState } from 'react';
import { Row, Col, DatePicker2, Button, Dropdown2, DropdownItem2 } from '@beyond-framework/common-uitoolkit-beyond';
import { add, sub } from 'date-fns';

const quickRanges = [
    { label: 'Last 5 minutes', offset: { minutes: 5 } },
    { label: 'Last 15 minutes', offset: { minutes: 15 } },
    { label: 'Last 1 hour', offset: { hours: 1 } },
    { label: 'Last 6 hours', offset: { hours: 6 } },
    { label: 'Last 12 hours', offset: { hours: 12 } },
    { label: 'Last 24 hours', offset: { hours: 24 } },
    { label: 'Last 2 days', offset: { days: 2 } },
];

export default function TimeRangePicker({ onApply }) {
    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);

    const handleApply = () => {
        const fromTimestamp = from instanceof Date && !isNaN(from) ? from.getTime() : null;
        const toTimestamp = to instanceof Date && !isNaN(to) ? to.getTime() : null;
        onApply(fromTimestamp, toTimestamp);
    };

    const handleQuickRange = (offsetObj) => {
        const newFrom = sub(new Date(), offsetObj);
        const newTo = new Date();
        setFrom(newFrom);
        setTo(newTo);
    };

    return (
        <div style={{ marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccc' }}>
            <Row>
                <Col md={4}>
                    <DatePicker2 id="from" placeholderText="From" selected={from} onChange={(date) => setFrom(date)} showTimeInput
                                 timeIntervals={15}
                                 dateFormat="dd/MM/yyyy HH:mm" isClearable />
                </Col>
                <Col md={4}>
                    <DatePicker2 id="to" placeholderText="To" selected={to} onChange={(date) => setTo(date)} showTimeInput timeIntervals={15}
                                 dateFormat="dd/MM/yyyy HH:mm" isClearable />
                </Col>
                <Col md={4} className="d-flex align-items-end">
                    <Button onClick={handleApply}>Apply time range</Button>
                </Col>
            </Row>
            <Row className="mt-3">
                <Col md={6}>
                    <Dropdown2 id="quick-ranges" label="Quick Ranges">
                        {quickRanges.map(({ label, offset }) => (
                            <DropdownItem2
                                key={label}
                                type="item"
                                label={label}
                                action={() => handleQuickRange(offset)}
                            />
                        ))}
                    </Dropdown2>
                </Col>
            </Row>
        </div>
    );
}