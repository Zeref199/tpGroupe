import React, { useState } from 'react';
import { DatePicker2, Button, Dropdown2, DropdownItem2 } from '@beyond-framework/common-uitoolkit-beyond';
import { sub } from 'date-fns';

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
    const [applied, setApplied] = useState(false);

    const handleToggle = () => {
        if (!applied) {
            // APPLY
            onApply(from, to);
            setApplied(true);
        } else {
            // DISABLE
            setFrom(null);
            setTo(null);
            onApply(null, null);
            setApplied(false);
        }
    };

    const handleQuickRange = (offsetObj) => {
        const newFrom = sub(new Date(), offsetObj);
        const newTo = new Date();
        setFrom(newFrom);
        setTo(newTo);
        setApplied(false);
    };

    return (
        <div className="time-range-picker">
                    <DatePicker2
                        id="from"
                        placeholderText="From"
                        selected={from}
                        onChange={date => { setFrom(date); setApplied(false); }}
                        showTimeInput
                        className="trp-input"
                        timeIntervals={15}
                        dateFormat="dd/MM/yyyy HH:mm"
                        isClearable
                    />

                    <DatePicker2
                        id="to"
                        placeholderText="To"
                        selected={to}
                        onChange={(date) => {setTo(date); setApplied(false);}}
                        showTimeInput
                        className="trp-input"
                        timeIntervals={15}
                        dateFormat="dd/MM/yyyy HH:mm"
                        isClearable />

                    <Button
                        onClick={handleToggle}
                        className="trp-button"
                        disabled={!applied && (!from || !to)}  // when “Apply”, require both dates
                    >
                        {applied ? 'Disable time range' : 'Apply time range'}
                    </Button>

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

        </div>
    );
}