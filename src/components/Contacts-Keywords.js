// Keyword variant voor contacten

import React, { useReducer, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { Link } from 'react-router-dom';

import { getLedgers, getContacts, getCustomFields } from "../actions/apiActions";
import { batchContactCustomUpdate } from '../actions/batchActions';
import { doSnack } from "../actions/actions";
import ContactFilters from './ContactFilters';
import { SideNavWrapper, SideNav, MainWithSideNav } from './SideNav';
import { keywordReducer, makeRows, HeaderRow, Row, filterRow } from './Contacts-Keywords-helpers';
import { loadComp } from '../constants/helpers';

const ContactKeywords = (props) => {
    const { accessToken, contacts, customFields, ledgers } = useSelector(store => store);
    const dispatch = useDispatch();
    const [state, setState] = useReducer(keywordReducer, {
        keywords: [],
        hasChanges: false,
        filters: {
            ownerFilter: [],
            stdLedgerFilter: [],
            payFilter: [],
            contactFilter: [],
            changeFilter: false
        }
    });
    const [sortState, setSortState] = useState({ key: 1, asc: true });
    const onChangeKeyword = ({ contactId, oldKeywords, newKeywords }) => {
        setState({
            type: 'SET_KEYWORDS', payload: {
                contactId,
                oldKeywords,
                newKeywords
            }
        })
    }
    const onSubmit = () => {
        const fieldId = customFields.data.filter(it => (it.name === 'Keywords'))[0].id;
        const batchList = state.keywords.map(it => {
            return {
                contactId: it.contactId,
                fieldId,
                newValue: it.keywords
            }
        });
        const count = batchList.length;
        dispatch(doSnack(`Wijzigingen voor ${count} contact${(count === 1)? 'en': ''} doorgestuurd aan Moneybird`));
        dispatch(batchContactCustomUpdate(batchList));
        
        dispatch(getContacts(true)); // reload contacts
        setState({type: 'RESET_KEYWORDS'}); // reset state
    }
    if (ledgers.notAsked) dispatch(getLedgers());
    if (customFields.notAsked) dispatch(getCustomFields());
    if (contacts.notAsked) dispatch(getContacts());

    const hasError = (!accessToken.hasData);
    const hasData = (!hasError && ledgers.hasData && contacts.hasData && customFields.hasData);
    const hasLedgers = loadComp(ledgers,
        'Legders (nog) niet gevonden', 'Legders ophalen is helaas mislukt', 'ledgers opgehaald');
    const hasContacts = loadComp(contacts,
        'Contacten aan het ophalen', 'Ophalen contacten is mislukt', 'contacten opgehaald');
    const hasCustomFields = loadComp(customFields,
        'Custom velden aan het ophalen', 'Ophalen custom velden is mislukt', 'Custom velden binnen');
    const rowsRaw = (hasData && contacts.hasData) ?
        makeRows(contacts.data, state.keywords)
        : [];

    if (rowsRaw) {
        // const headers = tHeadAddSelect(contactHeaders, this.onSelect, this.onSelectAll, 1);

        const contactOptions =
            [...new Set(rowsRaw.map(row => row[1]))]
                .sort().map(v => { return { value: v, label: v } });

        const ownerOptions =
            [...new Set(rowsRaw.map(row => row[4]))]
                .sort().map(v => { return { value: v, label: v } });

        const stdLedgerOptions =
            [...new Set(rowsRaw.map(row => row[3]))]
                .sort().map(v => { return { value: v, label: v } });

        const payOptions =
            [...new Set(rowsRaw.map(row => row[2]))]
                .sort().map(v => { return { value: v, label: v } });

        const rows = rowsRaw
            .filter(row => filterRow(row, state.filters))
            .sort((a, b) => {
                const fst = a[sortState.key].toLowerCase();
                const snd = b[sortState.key].toLowerCase();
                const outVal = (sortState.asc) ? -1 : 1;
                if (fst < snd) return outVal;
                if (fst > snd) return -outVal;
                return 0
            });
        const saveClass = (state.hasChanges) ? 'btn waves-effect right' : 'btn waves-effect right disabled';

        return (
            <SideNavWrapper>
                <SideNav>
                    <ContactFilters
                        onChange={(payload) => setState({ type: 'SET_FILTERS', payload })}
                        chip={rows.length + " van " + rowsRaw.length}
                        contactOptions={contactOptions}
                        contactFilter={state.filters.contactFilter}
                        stdLedgerOptions={stdLedgerOptions}
                        stdLedgerFilter={state.filters.stdLedgerFilter}
                        payOptions={payOptions}
                        payFilter={state.filters.payFilter}
                        ownerOptions={ownerOptions}
                        ownerFilter={state.filters.ownerFilter}
                        changeFilter={state.filters.changeFilter}
                        changeDisabled={(!state.hasChanges)}
                    />
                </SideNav>
                <MainWithSideNav>
                    <div className="section">
                        <div className='row'>
                            <button className={saveClass} onClick={onSubmit}>Wijzigingen opslaan</button>
                        </div>
                        <ul>
                            <HeaderRow sort={sortState} onClickSort={setSortState} />
                            {rows.map((contact) => {
                                return <Row key={contact[0]} row={contact} onChange={onChangeKeyword} />
                            })}
                        </ul>
                    </div>
                </MainWithSideNav>
            </SideNavWrapper>
        );
    } else if (accessToken.hasData) {
        const hasError = (ledgers.hasError ||
            customFields.hasError || contacts.hasError);
        return (
            <div className="container">
                <div className="section">
                    <h4>Keywords van contacten</h4>
                    <p>Voor bij het matchen van transacties (betalingen) aan inkomende facturen en bonnetjes.</p>
                    {hasLedgers}
                    {hasContacts}
                    {hasCustomFields}
                </div>
                <div className="divider"></div>
                <div className="section center">
                    {(!hasError) ?
                        <div className="progress">
                            <div className="indeterminate"></div>
                        </div>
                        : <p>Er is iets misgegaan. Ik kan data nu niet ophalen.</p>
                    }
                </div>
            </div>
        );
    }
    return (
        <div className="container">
            <div className="section center">
                <h5>Helaas, er is geen verbinding..</h5>
                <p>Probeer anders eerst connectie te maken..</p>
                <div>
                    <Link to="/connection" className="flex flex-center">
                        <i className="material-icons">account_circle</i>
                        <span>Connectie</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}



export default ContactKeywords;