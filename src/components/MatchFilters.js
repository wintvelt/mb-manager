// MatchFilters.js

import React from 'react';
import Select from 'react-select';

// to adjust weird height of Select Component
const customStyles = {
    control: (base, state) => ({
        ...base,
        height: '32px',
        minHeight: '32px',
        lineHeight: '12px'
    }),
};

const now = new Date();
const curYear = now.getFullYear();
const m = now.getMonth() + 1;
const month = (m) => (m < 10) ? '0' + m : m.toString()
const curPeriod = curYear + month(m);
const prevPeriod = (m === 1) ? (curYear - 1) + '12' : curYear + month(m - 1);

const periodOptions = [
    { label: 'Deze maand', value: `${curPeriod}..${curPeriod}` },
    { label: 'Vanaf vorige maand', value: `${prevPeriod}..${curPeriod}` },
    { label: `Vanaf begin dit jaar`, value: `${curYear}01..${curPeriod}` }
];

const initAccount = { name: 'Alle rekeningen', id: '' };

export const initialFilters = {
    fetched: null,
    current: {
        period: periodOptions[1],
        account: { label: initAccount.name, value: initAccount.id }
    },
    changed: true,
    onlyOpen: false
}

export const MatchFilters = (props) => {
    const { accounts, filterState, onChangeFilters, onChangeShow, onSubmit } = props;
    const accountOptions = [initAccount, ...accounts]
        .map(account => {
            return { label: account.name, value: account.id }
        });
    const btnClass = (filterState.changed) ? 'btn' : 'btn disabled';
    return (
        <li>
            <div>
                <span>Selectie van betalingen</span>
            </div>
            <ul className='sidenav-dropdown'>
                <li>
                    <Select
                        options={periodOptions}
                        styles={customStyles}
                        defaultValue={filterState.current.period}
                        onChange={(list, action) => onChangeFilters({ key: 'period', value: list })}
                        name="period"
                        className="basic-select"
                        classNamePrefix="select"
                    />
                </li>
                <li>
                    <Select
                        options={accountOptions}
                        styles={customStyles}
                        defaultValue={filterState.current.account}
                        onChange={(list, action) => onChangeFilters({ key: 'account', value: list })}
                        name="account"
                        className="basic-select"
                        classNamePrefix="select"
                    />
                </li>
                <li>
                    <div className='right-align'>
                        <button className={btnClass} onClick={onSubmit}>Betalingen ophalen</button>
                    </div>
                </li>
                <li>
                    <div className="switch">
                        <label>
                            Alle transacties tonen
										<input type="checkbox"
                                checked={filterState.onlyOpen}
                                onChange={onChangeShow} />
                            <span className="lever"></span>
                            Alleen openstaand
						</label>
                    </div>
                </li>
            </ul>
        </li>
    );
}

export const filterReducer = (state, action) => {
    const { fetched, current } = state;
    const { payload } = action;
    switch (action.type) {
        case 'SET_FILTER':
            const newCurrent = { ...current, [payload.key]: payload.value };
            const isSame =
                fetched
                && (fetched.account && fetched.account.value === newCurrent.account.value)
                && (fetched.period && fetched.period.value === newCurrent.period.value);
            return { ...state, current: newCurrent, changed: !isSame }

        case 'SET_FETCHED':
            const newFet = { account: { ...current.account }, period: { ...current.period } };
            return { ...state, fetched: newFet, changed: false }

        case 'SET_ONLYOPEN':
            return {...state, onlyOpen: !state.onlyOpen}

        default:
            return state;
    }
}

export default MatchFilters;