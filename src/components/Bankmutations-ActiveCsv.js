import React, { useState } from 'react';

export const BankActiveCsv = (props) => {
    const { activeCsv } = props;
    const { data, origin } = activeCsv;
    const [csvVisible, setCvsVisible] = useState(false);
    const filename = (origin) ? origin.split('/').slice(-1)[0] : '';
    const cardClass = (data) ? 'card s12 flex' : 's12 flex grey-text';
    const btnClass = (data) ? 'btn btn-flat waves-effect waves-light' : 'btn btn-flat waves-effect waves-light disabled';
    return <div>
        <Header filename={filename} headClass={cardClass} btnClass={btnClass} 
            btnIcon='arrow_drop_down' onClick={() => setCvsVisible(true)} />
        {(data) ?
            <div style={{ width: '100%', height: '0', position: 'relative' }}>
                <div className='card' style={{ position: 'absolute', width: '100%' }} >
                    <Header filename={filename} btnClass={card} btnIcon='close' onClick={() => setCvsVisible(false)} />
                    <div style={{ overflow: 'scroll' }}>
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
    const { filename, headClass, btnClass, btnIcon, onClick } = props;
    const headerStyle = {
        minHeight: '36px',
        padding: '4px',
        margin: '7px 0 14px 0',
        justifyContent: 'flex-end'
    }
    return <div className={headClass} style={headerStyle}>
        <span style={{ flex: '1 1 auto', padding: '0 8px' }}>{filename}</span>
        <button className={btnClass} onClick={onClick}>
            <i className='material-icons'>{btnIcon}</i>
        </button>
    </div>
}