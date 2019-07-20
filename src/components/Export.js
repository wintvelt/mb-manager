//Content for Finvision
import React, { Component } from 'react';
import { connect } from "react-redux";
import Select from 'react-select';
import moment from 'moment';

import { getIncomingSums } from '../actions/apiActions';
import { exportRows, exportHeaders } from '../constants/data-helpers-export';
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
        getIncomingSums: () => dispatch(getIncomingSums())
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
        };
        this.setYear = this.setYear.bind(this);
        this.sync = this.sync.bind(this);
        this.onChangeInput = this.onChangeInput.bind(this);
        if (props.accessToken && !props.incomingSums) props.getIncomingSums();
    }
    setYear(value) {
        this.setState({ selectedYear: value });
    }
    sync() {
        alert('syncing');
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
            const { yearOptions, createFromTo, invoiceFromTo, docCount, unexportedCount,
                mutatedCount, fileStats, selection
            } = getFromSums(this.props.incomingSums, this.state);
            const selectedYear = this.state.year || yearOptions[0];
            const yearComp = (yearOptions.length > 0) ?
                <div style={{ display: "inline-block" }}>
                    <Select
                        options={[2019, 2018].map(i => { return { value: i, label: i } })}
                        styles={customStyles}
                        defaultValue={selectedYear}
                        onChange={(list, action) => this.setYear(list.value)}
                        name="jaar"
                        className='inline_select'
                        classNamePrefix='inline_select'
                    />
                </div>
                : yearOptions[0];
            const selected = this.props.incomingSums.filter(item => {
                return (selection.filter(sel => sel === item.id).length > 0)
            }).map(item => item.id);
            const exportBtnClass = (selection.length > 0) ? 'btn-small' : 'btn-small disabled';
            return (
                <div className="container">
                    <h4>Inkomende facturen uit {yearComp}</h4>
                    <div className="row">
                        <h5>
                            {docCount}&nbsp; documenten totaal &nbsp;
                            <span style={{ fontSize: '60%' }}>
                                (laatste sync op {moment(this.props.lastSync).format('D MMM YYYY')}
                                <span className="btn-flat waves-effect waves-teal teal-text"
                                    style={{ zIndex: "0" }}
                                    onClick={this.sync}>
                                    <i className="material-icons">sync</i>
                                </span>)
                            </span>
                        </h5>
                        <ul>
                            <li className="col s12 m4 l3">toegevoegd tussen {createFromTo.min} en {createFromTo.max}</li>
                            <li className="col s12 m4 l3">facturatiedatum van {invoiceFromTo.min} t/m {invoiceFromTo.max}</li>
                            <li className="col s12 m4 l3">{unexportedCount} nieuwe verwerkte documenten</li>
                            <li className="col s12 m4 l3">{mutatedCount} met mutaties sinds export</li>
                        </ul>
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
                            <span className={exportBtnClass}><i className='material-icons right'>cloud_download</i>Export</span>
                        </p>
                        <pre className='col s12'>{JSON.stringify(selected)}</pre>
                    </div>
                    <div className="row">
                        <h5>Eerdere export-bestanden</h5>
						<div className="section">
							<SortableTable headers={exportHeaders} rows={exportRows(fileStats)} 
								onSelect={() => {}} hideKey={false}/>
						</div>
                        <pre>{JSON.stringify(selected, null, 2)}</pre>
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

// to extract info from incomingSums
// USES MUTABLES INSIDE
function getFromSums(incomingSums, state) {
    var yearOptions = [];
    var createFromTo = { min: "", max: "" };
    var invoiceFromTo = { min: "", max: "" };
    var unexportedCount = 0;
    var mutatedCount = 0;
    var fileStats = {}; // uses fileName as key
    var selection = incomingSums.filter(item => {
        const inState = (state.mutSelected && item.mutations.length > 0) || (!state.mutSelected && !item.fileName);
        const inCreatedFrom = (!state.createFrom || state.createFrom.length < 7) ||
            (item.createDate >= state.createFrom);
        const inCreatedTo = (!state.createTo || state.createTo.length < 7) ||
            (item.createDate.slice(0, state.createTo.length) <= state.createTo);
        const inInvoiceFrom = (!state.invoiceFrom || state.invoiceFrom.length < 7) ||
            (item.invoiceDate >= state.invoiceFrom);
        const inInvoiceTo = (!state.invoiceTo || state.invoiceTo.length < 7) ||
            (item.invoiceDate.slice(0, state.invoiceTo.length) <= state.invoiceTo);
        return inState && inCreatedFrom && inCreatedTo && inInvoiceFrom && inInvoiceTo;
    }).map(item => item.id);
    for (let i = 0; i < incomingSums.length; i++) {
        const el = incomingSums[i];
        if (el.invoiceDate) { yearOptions.push(el.invoiceDate.slice(0, 4)) }
        setMinMax(createFromTo, el.createDate.slice(0, 10));
        setMinMax(invoiceFromTo, el.invoiceDate);
        if (el.fileName) {
            // update filestats
            var fileStatObj = fileStats[el.fileName] ||
                {
                    fileName: el.fileName, mutatedCount: 0, docCount: 0,
                    createFromTo: { min: "", max: "" },
                    invoiceFromTo: { min: "", max: "" }
                };
            fileStatObj.docCount++;
            setMinMax(fileStatObj.createFromTo, el.createDate.slice(0, 10));
            setMinMax(fileStatObj.invoiceFromTo, el.invoiceDate);
            // updated fileStat and overall mutated count if needed
            if (el.mutations && el.mutations.length > 0) {
                mutatedCount++;
                fileStatObj.mutatedCount++;
            }
            // add file to stats if needed
            if (!fileStats[el.fileName]) { fileStats[el.fileName] = fileStatObj }
        } else {
            unexportedCount++;
        }
    }
    return {
        yearOptions: [...new Set(yearOptions)].sort().reverse()
            .map(i => { return { value: i, label: i } }),
        createFromTo: createFromTo,
        invoiceFromTo: invoiceFromTo,
        docCount: incomingSums.length,
        unexportedCount: unexportedCount,
        mutatedCount: mutatedCount,
        fileStats: Object.keys(fileStats).map(key => fileStats[key]).sort().reverse(),
        selection: selection
    }
}

// helper to update min and max dates
// MUTABLE FUNCTION
function setMinMax(updatable = { min: "", max: "" }, dateValue) {
    if (!updatable.min || dateValue < updatable.min) { updatable.min = dateValue }
    if (!updatable.max || dateValue > updatable.max) { updatable.max = dateValue }
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