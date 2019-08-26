import React, { useState } from 'react';

export const BankActiveCsv = (props) => {
    const { activeCsv } = props;
    const { data, origin } = activeCsv;
    const [csvVisible, setCvsVisible] = useState(false);
    const filename = (origin) ? origin.split('/').slice(-1)[0] : '(geen actieve csv)';
    const cardClass = (data) ? 'card s12 flex' : 's12 flex grey-text';
    const btnClass = (data) ? 'btn btn-flat waves-effect waves-light' : 'btn btn-flat waves-effect waves-light disabled';
    return <div>
        <div className={cardClass} style={{ minHeight: '36px', padding: '4px', margin: '7px 0 14px 0' }}>
            <span style={{ flex: '1 1 auto', padding: '0 8px' }}>{filename}</span>
            <button className={btnClass} onClick={() => setCvsVisible(true)}>
                <i className='material-icons'>arrow_drop_down</i>
            </button>
        </div>
        {(data) ?
            <div style={{ width: '100%', height: '0', position: 'relative' }}>
                <div style={{ overflow: 'scroll' }} style={{position: 'absolute', width: '100%'}}>
                    <CsvTable rowData={data} />
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