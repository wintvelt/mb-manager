//Content for Finvision
import React, { Component } from 'react';
import { connect } from "react-redux";
import moment from 'moment';

import { exportDocs, deleteFile, syncFiles } from '../../actions/api-AWS-actions';
import { getIncomingSums } from '../../actions/apiActions-new';
import { exportRows, exportHeaders, getFromSums } from '../../constants/data-helpers-export';
import { SortableTable, tHeadAddSelect } from '../../constants/table-helpers';
import { doSnack } from "../../actions/actions";

import { ExportData } from './ExportData';
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

const mapStateToProps = state => {
    return {
        accessToken: state.accessToken,
        incomingSums: state.incomingSums,
        exportPending: state.exportPending,
        optDeleted: state.optDeleted,
        syncPending: state.syncPending
    };
};

function mapDispatchToProps(dispatch) {
    return {
        getIncomingSums: (access_token) => dispatch(getIncomingSums(access_token)),
        exportDocs: (body, access_token) => dispatch(exportDocs(body, access_token)),
        syncFiles: (access_token) => dispatch(syncFiles(access_token)),
        deleteFile: (filename) => dispatch(deleteFile(filename)),
        doSnack: ((msg) => dispatch(doSnack(msg)))
    };
}

class ConnectedExport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedYear: "",
            createFrom: "",
            createTo: "",
            invoiceFrom: "",
            invoiceTo: "",
            mutSelected: 'new',
            selectedForDelete: ""
        };
        this.setYear = this.setYear.bind(this);
        this.sync = this.sync.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onClearDelete = this.onClearDelete.bind(this);
        this.onExport = this.onExport.bind(this);
        this.onChangeInput = this.onChangeInput.bind(this);
        if (props.accessToken.hasData && !props.incomingSums.toJS().hasData) {
            props.getIncomingSums()
        };
    }
    setYear(value) {
        this.setState({ selectedYear: value });
    }
    sync(access_token) {
        this.props.syncFiles(access_token);
    }
    onDelete(filename) {
        if (filename === this.state.selectedForDelete) {
            this.props.doSnack('exportbestand "' + filename + '" verwijderd.');
            this.props.deleteFile(filename);
            this.setState({
                selectedForDelete: ''
            })
        } else {
            this.setState({ selectedForDelete: filename });
        }
    }
    onClearDelete() {
        this.setState({ selectedForDelete: '' });
    }
    onExport(selection, access_token) {
        var body = {
            ids: selection,
        }
        switch (this.state.mutSelected) {
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
        this.props.exportDocs(body, access_token)
    }
    onChangeInput(field, value) {
        switch (field) {
            case 'createFrom':
                this.setState({ createFrom: value })
                break;

            case 'createTo':
                this.setState({ createTo: value })
                break;

            case 'invoiceFrom':
                this.setState({ invoiceFrom: value })
                break;

            case 'invoiceTo':
                this.setState({ invoiceTo: value })
                break;

            case 'mutSelected':
                this.setState({ mutSelected: value })
                break;

            default:
                break;
        }
    }
    render() {
        // main view with data
        const incomingSums = this.props.incomingSums.toJS().data && this.props.incomingSums.toJS().data.list;
        const lastSyncDate = this.props.incomingSums.toJS().data && this.props.incomingSums.toJS().syncDate;
        const { yearOptions, createFromTo, invoiceFromTo, unexportedCount, docCount,
            mutatedCount, fileStats, selection, selStats, selectedYear
        } = getFromSums(incomingSums, this.state, this.props.optDeleted);
        const exportBtnClass = (selection.length > 0 && this.props.exportPending === 0) ?
            'btn-small' : 'btn-small disabled';
        const headers = tHeadAddSelect(exportHeaders, this.onDelete, this.onClearDelete, 7);
        const rows = exportRows(fileStats).map(row => {
            if (row[0].value.includes('initial')) {
                return [...row.slice(0, 7),
                Object.assign({}, row[7], { value: 'do_not_disturb', disabled: true })]
            }
            if (row[0].value !== this.state.selectedForDelete) return row;
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
                <ExportData yearOptions={yearOptions} selectedYear={selectedYear} setYear={this.setYear}/>
                <ExportStats lastSync={lastSyncDate} accessToken={this.props.accessToken}
                    syncPending={this.props.syncPending}
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
                                            this.state.mutSelected, (unexportedCount === 0),
                                            this.onChangeInput)}
                                        {Radio('mut', 'Met mutaties sinds export (' + mutatedCount + ')',
                                            'Gemuteerd (' + mutatedCount + ')',
                                            this.state.mutSelected, (mutatedCount === 0),
                                            this.onChangeInput)}
                                    </div>
                                    <div className="col l6 m6">
                                        {Radio('all', 'Archief (' + docCount + ' documenten, zonder log)',
                                            'Archief (' + docCount + ')',
                                            this.state.mutSelected, false, this.onChangeInput)}
                                    </div>
                                </div>
                                {InputLine('Factuurdatum', 'van', 'invoiceFrom', this.state.invoiceFrom, this.onChangeInput)}
                                {InputLine(null, 'tot en met', 'invoiceTo', this.state.invoiceTo, this.onChangeInput)}
                                <div className='whitespace-vert small'></div>
                                {InputLine('Aangemaakt', 'van', 'createFrom', this.state.createFrom, this.onChangeInput)}
                                {InputLine(null, 'tot en met', 'createTo', this.state.createTo, this.onChangeInput)}
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
                                            {(this.state.mutSelected === 'mut') ? 'met mutaties' :
                                                (this.state.mutSelected === 'new') ?
                                                    'nieuw te exporteren' : 'archief (zonder log)'}
                                        </p>
                                        <div className='whitespace-vert'></div>
                                        <p>
                                            <span className={exportBtnClass}
                                                onClick={() => this.onExport(selection, this.props.accessToken.data)}>
                                                <i className='material-icons right'>cloud_download</i>Maak xlsx export
                                            </span>
                                        </p>
                                        <div className='whitespace-vert small'></div>
                                        {(this.props.exportPending > 0) ?
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

const Export = connect(mapStateToProps, mapDispatchToProps)(ConnectedExport);


export default Export;