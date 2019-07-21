//Content for Finvision
import React, { Component } from 'react';
import { connect } from "react-redux";
import Select from 'react-select';
import moment from 'moment';

import { getIncomingSums, exportDocs, deleteFile } from '../actions/apiActions';
import { exportRows, exportHeaders, getFromSums } from '../constants/data-helpers-export';
import { SortableTable, tHeadAddSelect } from '../constants/table-helpers';



const mapStateToProps = state => {
    return {
        accessToken: state.accessToken,
        incomingSums: state.incomingSums,
        lastSync: state.lastSync
    };
};

function mapDispatchToProps(dispatch) {
    return {
        getIncomingSums: () => dispatch(getIncomingSums()),
        exportDocs: (ids, accessToken) => dispatch(exportDocs(ids, accessToken)),
        deleteFile: (filename) => dispatch(deleteFile(filename))
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
    sync() {
        alert('syncing');
    }
    onDelete(filename) {
        if (filename === this.state.selectedForDelete) this.props.deleteFile(filename);
        this.setState({ selectedForDelete: filename });
    }
    onClearDelete() {
        this.setState({ selectedForDelete: '' });
    }
    onExport(selection, accessToken) {
        this.props.exportDocs(selection, accessToken)
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
                this.setState({ mutSelected: !this.state.mutSelected })
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
            } = getFromSums(this.props.incomingSums, this.state);
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
            const exportBtnClass = (selection.length > 0) ? 'btn-small' : 'btn-small disabled';
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
                                icon: 'sync', btnFunc: this.sync
                            },
                            { title: docCount, text: 'Documenten totaal' },
                            { title: unexportedCount, text: 'Nieuwe verwerkte documenten' },
                            { title: mutatedCount, text: 'Documenten met mutaties sinds laatste export' },
                            { title: invoiceFromTo.min, text: 'Oudste factuurdatum' },
                            { title: invoiceFromTo.max, text: 'Laatste factuurdatum' },
                            { title: createFromTo.min, text: 'Eerste opvoerdatum' },
                            { title: createFromTo.max, text: 'Laatste opvoerdatum' },
                        ].map(Widget)}
                        <h5>
                            <span style={{ fontSize: '60%' }}>
                                (laatste sync op {moment(this.props.lastSync).format('D MMM YYYY')}
                                <span className="btn-flat waves-effect waves-teal teal-text"
                                    style={{ zIndex: "0" }}
                                    onClick={this.sync}>
                                    <i className="material-icons">sync</i>
                                </span>)
                            </span>
                        </h5>
                    </div>
                    <div className="row">
                        <h5>Selectie voor export</h5>
                        <p className='col l12 input-line'>
                            <span className="switch">
                                <label>
                                    Nieuwe verwerkte documenten
										<input type="checkbox"
                                        checked={this.state.mutSelected}
                                        onChange={() => this.onChangeInput('mutSelected')} />
                                    <span className="lever"></span>
                                    Documenten met mutaties sinds export
									</label>
                            </span>
                        </p>
                        <p className='col l6 input-line'>
                            <span className='text'>Aangemaakt van</span>
                            <span className="input-field">
                                <input id="createFrom" type="text"
                                    value={this.state.createFrom}
                                    onChange={(e) => this.onChangeInput("createFrom", e.target.value)} />
                                <label htmlFor="createFrom">JJJJ-MM-DD</label>
                            </span>
                            <span className='text'>tot en met</span>
                            <span className="input-field">
                                <input id="createTo" type="text"
                                    value={this.state.createTo}
                                    onChange={(e) => this.onChangeInput("createTo", e.target.value)} />
                                <label htmlFor="createTo">JJJJ-MM-DD</label>
                            </span>
                        </p>
                        <p className='col l6 input-line'>
                            <span className='text'>Factuurdatum van</span>
                            <span className="input-field">
                                <input id="invoiceFrom" type="text"
                                    value={this.state.invoiceFrom}
                                    onChange={(e) => this.onChangeInput("invoiceFrom", e.target.value)} />
                                <label htmlFor="invoiceFrom">JJJJ-MM-DD</label>
                            </span>
                            <span className='text'>tot en met</span>
                            <span className="input-field">
                                <input id="invoiceTo" type="text"
                                    value={this.state.invoiceTo}
                                    onChange={(e) => this.onChangeInput("invoiceTo", e.target.value)} />
                                <label htmlFor="invoiceTo">JJJJ-MM-DD</label>
                            </span>
                        </p>
                        <div className='col s12 whitespace-vert'></div>
                        <p className="col s12 input-line">
                            <span>In selectie: </span>
                            <span className="chip">{selection.length}</span>
                            <span className={exportBtnClass}
                                onClick={() => this.onExport(selection, this.props.accessToken)}>
                                <i className='material-icons right'>cloud_download</i>Export
                            </span>
                        </p>
                        <pre className='col s12'>{JSON.stringify(selection)}</pre>
                    </div>
                    <div className="row">
                        <h5>Eerdere export-bestanden</h5>
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
function Widget({ title, text, icon, btnFunc }) {
    return (
        <div key={text} className="col s6 m3 l2 small-card">
            <div className="card blue-grey darken-1">
                <div className="card-content white-text">
                    <span className="card-title">{title}</span>
                    <p>{text}</p>
                </div>
                {(icon)? 
                <span className='btn-small btn-floating' onClick={btnFunc}>
                    <i className="material-icons">{icon}</i>
                </span>
                : <div></div>
                }
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