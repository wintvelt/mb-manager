//Content for Finvision
import React, { Component } from 'react';
import { connect } from "react-redux";
import Select from 'react-select';
import moment from 'moment';

import { getIncomingSums, exportDocs, deleteFile, syncFiles } from '../actions/apiActions';
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
        getIncomingSums: () => dispatch(getIncomingSums()),
        exportDocs: (body, accessToken) => dispatch(exportDocs(body, accessToken)),
        syncFiles: (accessToken) => dispatch(syncFiles(accessToken)),
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
            mutSelected: false,
            selectedForDelete: ""
        };
        this.setYear = this.setYear.bind(this);
        this.sync = this.sync.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onClearDelete = this.onClearDelete.bind(this);
        this.onExport = this.onExport.bind(this);
        this.onChangeInput = this.onChangeInput.bind(this);
        if (props.accessToken && !props.incomingSums) props.getIncomingSums();
    }
    setYear(value) {
        this.setState({ selectedYear: value });
    }
    sync(accessToken) {
        this.props.syncFiles(accessToken);
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
    onExport(selection, accessToken) {
        const body = {
            ids: selection,
            ext: (this.state.mutSelected) ? 'mutaties' : 'new'
        }
        this.props.exportDocs(body, accessToken)
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
                this.setState({ mutSelected: (value === 'true') })
                break;

            default:
                break;
        }
    }
    render() {
        const hasToken = (this.props.accessToken);
        const hasData = (hasToken && this.props.incomingSums);

        if (hasData) {
            // main view with data
            const { yearOptions, createFromTo, invoiceFromTo, unexportedCount, docCount,
                mutatedCount, fileStats, selection, selectedYear
            } = getFromSums(this.props.incomingSums, this.state, this.props.optDeleted);
            const yearComp = (yearOptions.length > 0) ?
                <div style={{ display: "inline-block" }}>
                    <Select
                        options={["2019", "2018"].map(i => { return { value: i, label: i } })}
                        styles={customStyles}
                        defaultValue={selectedYear}
                        onChange={(list, action) => this.setYear(list)}
                        name="jaar"
                        className='inline_select'
                        classNamePrefix='inline_select'
                    />
                </div>
                : yearOptions[0];
            const exportBtnClass = (selection.length > 0 && this.props.exportPending === 0) ? 'btn-small' : 'btn-small disabled';
            const headers = tHeadAddSelect(exportHeaders, this.onDelete, this.onClearDelete, 7);
            const rows = exportRows(fileStats).map(row => {
                if (row[0].value !== this.state.selectedForDelete) return row;
                const newDeleteCell = Object.assign({}, row[7],
                    { className: 'red white-text', value: 'delete_forever' })
                return [...row.slice(0, 7), newDeleteCell];
            });
            return (
                <div className="container">
                    <h4>Inkomende facturen uit {yearComp}</h4>
                    <div className="row">
                        {[
                            {
                                title: moment(this.props.lastSync).format('D MMM YYYY'),
                                text: 'Datum van laatste sync',
                                icon: 'sync', btnFunc: (() => this.sync(this.props.accessToken)),
                                pending: this.props.syncPending
                            },
                            {
                                title: docCount + ' / ' + unexportedCount + ' / ' + mutatedCount,
                                text: 'Documenten totaal / nieuw / met mutaties'
                            },
                            { title: invoiceFromTo.min, text: 'Oudste factuurdatum' },
                            { title: invoiceFromTo.max, text: 'Laatste factuurdatum' },
                            { title: createFromTo.min, text: 'Eerste opvoerdatum' },
                            { title: createFromTo.max, text: 'Laatste opvoerdatum' },
                        ].map(Widget)}
                    </div>
                    <div className="row">
                        <div className='col l6 m6 small-card'>
                            <div className='card export'>
                                <div className='card-content'>
                                    <div className='card-title'>Filters voor export</div>
                                    <div className='input-line'>
                                        <label>
                                            <input className="with-gap" name="group1" type="radio"
                                                value={false}
                                                checked={!this.state.mutSelected}
                                                onChange={(e) => this.onChangeInput('mutSelected', e.target.value)} />
                                            <span className='text'>Nieuwe verwerkte documenten</span>
                                        </label>
                                    </div>
                                    <div className='input-line'>
                                        <label>
                                            <input className="with-gap" name="group1" type="radio"
                                                value={true}
                                                checked={this.state.mutSelected}
                                                onChange={(e) => this.onChangeInput('mutSelected', e.target.value)} />
                                            <span className='text'>Met mutaties sinds export</span>
                                        </label>
                                    </div>
                                    <div className='whitespace-vert small'></div>
                                    {InputLine('Aangemaakt', 'van', 'createFrom', this.state.createFrom, this.onChangeInput)}
                                    {InputLine(null, 'tot en met', 'createTo', this.state.createTo, this.onChangeInput)}
                                    <div className='whitespace-vert small'></div>
                                    {InputLine('Factuurdatum', 'van', 'invoiceFrom', this.state.invoiceFrom, this.onChangeInput)}
                                    {InputLine(null, 'tot en met', 'invoiceTo', this.state.invoiceTo, this.onChangeInput)}
                                </div>
                            </div>
                        </div>
                        <div className='col l6 m6 small-card'>
                            <div className='card export'>
                                <div className='card-content'>
                                    <div className='card-title'>
                                        Documenten in selectie
                                    </div>
                                    <p className='input-line'>
                                        <span className="chip">{selection.length}</span>
                                        {(this.state.mutSelected) ? 'met mutaties' : 'nieuw te exporteren'}
                                    </p>
                                    <div className='whitespace-vert'></div>
                                    <p>
                                        <span className={exportBtnClass}
                                            onClick={() => this.onExport(selection, this.props.accessToken)}>
                                            <i className='material-icons right'>cloud_download</i>Export
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
                                    <p>{JSON.stringify(selection, null, 2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="section">
                            <SortableTable headers={headers} rows={rows}
                                onSelect={() => { }} hideKey={false} />
                        </div>
                        <pre>filestats{JSON.stringify(fileStats, null, 2)}</pre>
                        <pre>{JSON.stringify(this.props.incomingSums, null, 2)}</pre>
                    </div>
                </div>
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