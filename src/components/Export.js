//Content for Finvision
import React, { Component } from 'react';
import { connect } from "react-redux";
import Select from 'react-select';
import moment from 'moment';

import { getIncomingSums, exportDocs, deleteFile, syncFiles } from '../actions/api-AWS-actions';
import { exportRows, exportHeaders, getFromSums } from '../constants/data-helpers-export';
import { SortableTable, tHeadAddSelect } from '../constants/table-helpers';
import { doSnack } from "../actions/actions";



const mapStateToProps = state => {
    return {
        accessToken: state.accessToken,
        incomingSums: state.incomingSums,
        exportPending: state.exportPending,
        lastSync: state.lastSync,
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
        if (props.accessToken.hasData && !props.incomingSums) {
            props.getIncomingSums(this.props.accessToken.data)
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
        const hasToken = (this.props.accessToken.hasData);
        const hasData = (hasToken && this.props.incomingSums);

        if (hasData) {
            // main view with data
            const { yearOptions, createFromTo, invoiceFromTo, unexportedCount, docCount,
                mutatedCount, fileStats, selection, selStats, selectedYear
            } = getFromSums(this.props.incomingSums, this.state, this.props.optDeleted);
            const yearComp = (yearOptions.length > 1) ?
                <div style={{ display: "inline-block" }}>
                    <Select
                        options={yearOptions}
                        styles={customStyles}
                        defaultValue={selectedYear}
                        onChange={(list, action) => this.setYear(list)}
                        name="jaar"
                        className='inline_select'
                        classNamePrefix='inline_select'
                    />
                </div>
                : yearOptions[0].value;
            const exportBtnClass = (selection.length > 0 && this.props.exportPending === 0) ? 'btn-small' : 'btn-small disabled';
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
                <div className="container">
                    <h4>Inkomende facturen uit {yearComp}</h4>
                    <div className="row">
                        {[
                            {
                                title: moment(this.props.lastSync).format('D MMM YYYY'),
                                text: 'Datum van laatste sync',
                                icon: 'sync', btnFunc: (() => this.sync(this.props.accessToken.data)),
                                pending: this.props.syncPending
                            },
                            {
                                title: docCount + ' / ' + unexportedCount + ' / ' + mutatedCount,
                                text: 'Documenten totaal / nieuw / met mutaties'
                            },
                            { title: moment(invoiceFromTo.min).format('D MMM YYYY'), text: 'Oudste factuurdatum' },
                            { title: moment(invoiceFromTo.max).format('D MMM YYYY'), text: 'Laatste factuurdatum' },
                            { title: moment(createFromTo.min).format('D MMM YYYY'), text: 'Eerste opvoerdatum' },
                            { title: moment(createFromTo.max).format('D MMM YYYY'), text: 'Laatste opvoerdatum' },
                        ].map(Widget)}
                    </div>
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
                                            {Radio('all', 'Archief ('+docCount+' documenten, zonder log)', 
                                                'Archief ('+docCount+')',
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
        if (hasToken) {
            // loading screen
            return (
                <div className="container">
                    <div className="section">
                        <h4>Documenten voor export</h4>
                        <p className="flex">
                            <span>Nog even samenvattingen van inkomende facturen aan het ophalen</span>
                        </p>
                    </div>
                    <div className="divider"></div>
                    <div className="section center">
                        <div className="progress">
                            <div className="indeterminate"></div>
                        </div>
                    </div>
                </div>
            );
        }
        // no data, no connection
        return (
            <div className="container">No connection</div>
        );
    }

}

// stat widget
function Widget({ title, text, icon, btnFunc, pending }) {
    return (
        <div key={text} className="col s6 m3 l2 small-card min">
            <div className="card blue-grey lighten-4">
                <div className="card-content">
                    <span className="card-title">{title}</span>
                    <p>{text}</p>
                    {(icon && pending) ?
                        <div className="progress small">
                            <div className="indeterminate"></div>
                        </div>
                        : <div></div>
                    }
                </div>
                {(icon && !pending) ?
                    <span className='btn-small btn-floating' onClick={btnFunc}>
                        <i className="material-icons">{icon}</i>
                    </span>
                    : <div></div>
                }
            </div>
        </div>
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
        <p key={key+text}>
            <span className='export-stats'>{val}</span>
            {text}
        </p>
    );
}

// styling for select
const customStyles = {
    control: (base, state) => ({
        ...base,
        height: '42px',
        minHeight: '42px'
    }),
    container: (base) => ({
        ...base,
        width: '4.2em',
        height: '42px',
        marginRight: '8px'
    })
};



const Export = connect(mapStateToProps, mapDispatchToProps)(ConnectedExport);


export default Export;