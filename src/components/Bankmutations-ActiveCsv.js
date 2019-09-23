import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setBank } from '../store/actions';

export const BankActiveCsv = (props) => {
    const { activeCsv } = props;
    const { data, origin } = activeCsv;
    const dispatch = useDispatch();
    const [csvVisible, setCvsVisible] = useState(false);
    const filename = (origin) ? origin.split('/').slice(-1)[0] : '';
    const onClearCsv = () => {
        dispatch(setBank({ type: 'setCsv', content: { INIT: true } }));
        dispatch(setBank({ type: 'convertResult', content: { INIT: true } }));
    }
    const headState = (data) ? 'csv-menu-enabled' : 'csv-menu-disabled';
    const btnClass = (data) ? 'btn btn-flat waves-effect waves-light'
        : 'btn btn-flat waves-effect waves-light disabled';
    return <div>
        <Header filename={filename} headState={headState} btnClass={btnClass}
            onClick={() => setCvsVisible(true)}
            onClearCsv={onClearCsv} />
        {(data && csvVisible) ?
            <div style={{ width: '100%', height: '0', position: 'relative' }}>
                <div className='csv-card card grey lighten-3'>
                    <Header filename={filename} headState='csv-menu-open'
                        btnClass={btnClass} onClick={() => setCvsVisible(false)} />
                    <div className='csv-scroll-area'>
                        <CsvTable rowData={data} />
                    </div>
                </div>
            </div>
            : <></>
        }
    </div>
}

const CsvTable = (props) => {
    const { rowData } = props;
    return <table className='csv-table'>
        <tbody>
            {rowData.map((row, i) => {
                return <CsvRow key={'row' + i + row[0]} cellData={row} isHeader={(i === 0)} />
            })}
        </tbody></table>
}

const CsvRow = (props) => {
    const { cellData, isHeader } = props;
    return <tr className='csv-row'>
        {cellData.map((cell, j) => {
            return (isHeader) ?
                <th className='csv-cell' key={'cell' + j + cell}>
                    <span className='csv-text'>{cell}</span>
                </th>
                : <td className='csv-cell' key={'cell' + j + cell}>
                    <span className='csv-text'>{cell}</span>
                </td>
        })}
    </tr>
}

const Header = (props) => {
    const { filename, headState, btnClass, onClick, onClearCsv } = props;
    const headClass = (headState === 'csv-menu-enabled') ? 'csv-menu card s12 flex'
        : (headState === 'csv-menu-open') ?
            'csv-menu csv-menu-open s12 flex'
            : (filename) ? 'csv-menu s12 flex grey-text'
                : 'csv-menu s12 flex white-text';
    const clearFunc = (headState === 'csv-menu-open') ? onClick : onClearCsv;
    return <div className={headClass}>
        <span>{filename}</span>
        <div className='csv-buttons'>
            {(headState === 'csv-menu-open') ?
                <></>
                :
                <button className={btnClass} onClick={onClick}>
                    <i className='material-icons'>loupe</i>
                </button>
            }
            <button className={btnClass} onClick={clearFunc}>
                <i className='material-icons'>clear</i>
            </button>
        </div>
    </div>
}