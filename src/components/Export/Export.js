//Content for Finvision
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";
import moment from 'moment';

import { exportDocs, deleteFile, syncFiles } from '../../actions/api-AWS-actions';
import { getIncomingSums } from '../../actions/apiActions-new';
import { exportRows, exportHeaders, getFromSums } from '../../constants/data-helpers-export';
import { SortableTable, tHeadAddSelect } from '../../constants/table-helpers';
import { doSnack } from "../../actions/actions";

import { DataPanel } from '../Page/DataPanel';
import { ExportStats } from './ExportStats';

/*
fetch (all AWS):
    sync (to sync AWS with Moneybird)
    GET summary
    export selection
    delete a file
in store:
    incomingsums
    lastSync (date of last sync, comes with incoming sums)
    exportPending (temp store of no of docs in export)
    optDeleted (temp filename to be deleted)
    syncPending (boolean while sync is in progress)
*/

export const Export = props => {
    const { accessToken, incomingSums, exportPending, optDeleted, syncPending } = useSelector(store => {
        const { accessToken, incomingSums, exportPending, optDeleted, syncPending } = store;
        return { accessToken, incomingSums, exportPending, optDeleted, syncPending }
    });
    const dispatch = useDispatch();
    const [selectedYear, setYear] = useState({ value: 'loading', label: 'loading' });
    const [selectedForDelete, setSelectedForDelete] = useState('');
    const [filters, setFilters] = useState({
        createFrom: "",
        createTo: "",
        invoiceFrom: "",
        invoiceTo: "",
        mutSelected: 'new'
    });
    const onChangeInput = (field, value) => {
        setFilters({ ...filters, [field]: value });
    }
    useEffect(() => {
        if (accessToken && incomingSums.toJS().notAsked) {
            dispatch(getIncomingSums());
        }
    }, [dispatch, accessToken, incomingSums]);

    const onDelete = (filename) => {
        if (filename === selectedForDelete) {
            dispatch(doSnack('exportbestand "' + filename + '" verwijderd.'));
            dispatch(deleteFile(filename));
            setSelectedForDelete('');
        } else {
            setSelectedForDelete(filename)
        }
    }
    const onClearDelete = () => {
        setSelectedForDelete('')
    }
    const onExport = (selection, access_token) => {
        var body = {
            ids: selection,
        }
        switch (filters.mutSelected) {
            case 'new':
                body.ext = 'new';
                break;

            case 'mut':
                body.ext = 'mutaties';
                break;

            default:
                body.ext = 'all';
                body.noLog = true;
                break;
        }
        dispatch(exportDocs(body, access_token));
    }

    // main view with data
    const incomingSumsList = incomingSums.toJS().data && incomingSums.toJS().data.list;
    const lastSyncDate = incomingSums.toJS().data && incomingSums.toJS().syncDate;
    console.log({lastSyncDate})
    const { yearOptions, createFromTo, invoiceFromTo, unexportedCount, docCount,
        mutatedCount, fileStats, selection, selStats
    } = getFromSums(incomingSumsList, filters, selectedYear, optDeleted);
    const activeYear = yearOptions[0] ? ` uit ${yearOptions[0].value}` : '';
    const exportBtnClass = (selection.length > 0 && exportPending === 0) ?
        'btn-small' : 'btn-small disabled';
    const headers = tHeadAddSelect(exportHeaders, onDelete, onClearDelete, 7);
    const rows = exportRows(fileStats).map(row => {
        if (row[0].value.includes('initial')) {
            return [...row.slice(0, 7),
            Object.assign({}, row[7], { value: 'do_not_disturb', disabled: true })]
        }
        if (row[0].value !== selectedForDelete) return row;
        const newDeleteCell = Object.assign({}, row[7],
            { className: 'red white-text', value: 'delete_forever' })
        return [...row.slice(0, 7), newDeleteCell];
    }).sort((a, b) => {
        var x = 0;
        if (a[0].value > b[0].value) x = 1;
        if (a[0].value < b[0].value) x = -1;
        return x;
    });
    return (
        <div>
            <DataPanel expanded={true} onChange={() => { }}
                title={`inkomende facturen en statistieken${activeYear}`}
                apiDataSources={[incomingSums]}
                apiTitles={['statistieken']}
            />
            <ExportStats lastSync={lastSyncDate} accessToken={accessToken}
                syncPending={syncPending}
                invoiceFromTo={invoiceFromTo} createFromTo={createFromTo}
                docCount={docCount} unexportedCount={unexportedCount} mutatedCount={mutatedCount} />
            <div className="row">
                <div className='col l6 m6 s12 small-card'>
                    <div className='card export'>
                        <div className='card-content'>
                            <div className='card-title'>Filters voor export</div>
                            <div className="row" style={{ marginBottom: '0' }}>
                                <div className="col l6 m6">
                                    {Radio('new', 'Nieuwe documenten (' + unexportedCount + ')',
                                        'Nieuw (' + unexportedCount + ')',
                                        filters.mutSelected, (unexportedCount === 0),
                                        onChangeInput)}
                                    {Radio('mut', 'Met mutaties sinds export (' + mutatedCount + ')',
                                        'Gemuteerd (' + mutatedCount + ')',
                                        filters.mutSelected, (mutatedCount === 0),
                                        onChangeInput)}
                                </div>
                                <div className="col l6 m6">
                                    {Radio('all', 'Archief (' + docCount + ' documenten, zonder log)',
                                        'Archief (' + docCount + ')',
                                        filters.mutSelected, false, onChangeInput)}
                                </div>
                            </div>
                            {InputLine('Factuurdatum', 'van', 'invoiceFrom', filters.invoiceFrom, onChangeInput)}
                            {InputLine(null, 'tot en met', 'invoiceTo', filters.invoiceTo, onChangeInput)}
                            <div className='whitespace-vert small'></div>
                            {InputLine('Aangemaakt', 'van', 'createFrom', filters.createFrom, onChangeInput)}
                            {InputLine(null, 'tot en met', 'createTo', filters.createTo, onChangeInput)}
                        </div>
                    </div>
                </div>
                <div className='col l6 m6 s12 small-card'>
                    <div className='card export'>
                        <div className='card-content'>
                            <div className='card-title'>
                                Documenten in selectie
                                    </div>
                            <div className='row' style={{ marginBottom: '0' }}>
                                <div className='col l6 m12 s12'>
                                    <p className='input-line'>
                                        <span className="chip">{selection.length}</span>
                                        {(filters.mutSelected === 'mut') ? 'met mutaties' :
                                            (filters.mutSelected === 'new') ?
                                                'nieuw te exporteren' : 'archief (zonder log)'}
                                    </p>
                                    <div className='whitespace-vert'></div>
                                    <p>
                                        <span className={exportBtnClass}
                                            onClick={() => onExport(selection, accessToken.data)}>
                                            <i className='material-icons right'>cloud_download</i>Maak xlsx export
                                            </span>
                                    </p>
                                    <div className='whitespace-vert small'></div>
                                    {(exportPending > 0) ?
                                        <div>
                                            <p className='input-line'>Export-bestand aan het maken..</p>
                                            <div className="progress">
                                                <div className="indeterminate"></div>
                                            </div>
                                        </div>
                                        : <div></div>
                                    }
                                </div>
                                <div className='col l6 hide-on-med-and-down'>
                                    {[
                                        { value: selStats.docCount, text: 'documenten' },
                                        { value: selStats.mutatedCount, text: 'met mutaties' },
                                        { value: selStats.unexportedCount, text: 'nieuw' },
                                        { date: selStats.invoiceFromTo.min, text: 'eerste factuurdatum' },
                                        { date: selStats.invoiceFromTo.max, text: 'laatste factuurdatum' },
                                        { date: selStats.createFromTo.min, text: 'eerst opgevoerd' },
                                        { date: selStats.createFromTo.max, text: 'laatst opgevoerd' }
                                    ].map(miniStat)
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
            <div className="row">
                <div className="section">
                    <SortableTable headers={headers} rows={rows}
                        onSelect={() => { }} hideKey={false}
                        sortValue='Bestand' sortDirection='down' />
                </div>
            </div>
        </div >
    );
}

function Radio(option, fullText, smallText, checked, disabled, changeFunc) {
    const radioClass = (disabled) ? 'text disabled' : 'text';
    return (
        <div className='input-line'>
            <label>
                <input className="with-gap" name="group1" type="radio"
                    value={option}
                    checked={(checked === option)}
                    disabled={disabled}
                    onChange={(e) => changeFunc('mutSelected', e.target.value)} />
                <span className={radioClass}>
                    <span className='hide-on-med-and-down'>{fullText}</span>
                    <span className='hide-on-large-only'>{smallText}</span>
                </span>
            </label>
        </div>
    );
}

function InputLine(text1, text2, fieldId, value, changeFunc) {
    return (
        <div className='input-line'>
            {(text1) ?
                <div className='text'>{text1}</div>
                : <div></div>
            }
            <div className='text right-align'>{text2}</div>
            <div className="input-field">
                <input id={fieldId} type="text"
                    value={value} placeholder='JJJJ-MM-DD'
                    onChange={(e) => changeFunc(fieldId, e.target.value)} />
            </div>
        </div>
    );
}

function miniStat({ value, date, text }) {
    const val = (date) ? moment(date).format('D MMM YYYY') : value;
    const key = value || date;
    return (
        <p key={key + text}>
            <span className='export-stats'>{val}</span>
            {text}
        </p>
    );
}

export default Export;