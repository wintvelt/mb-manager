// for simpler matching of payments to open invoices
/*
(to add to filters Component)
Selection of period (start and end optional)
Bank account selection (optional)
Fetch button - gets transactions with filter from Moneybird

State veranderen zodat lastFetched + current duidelijk is,
Na submit: copy paste van Current naar lastFetched

gets open invoices and receipts (with sync logic) nb: only purchases
gets all contacts (to retrieve standard payment method + payment matching keywords)
gets open payments (with sync logic) - NB: only outgoing

lists payments, and allows each payment to be linked to invoice/ receipt
(TODO, allow for currency conversion differences - and booking to currency diff account)
(TODO, allow for booking on account)

when individual link is made, payment line is set to 'Done'/ 'Connected', and green
also, connected invoice no longer linkable

When done, click process button to send all links to Moneybird

Logic to sort for link:
When amount matches + account matches (with standard from contact) + date-diff < 3 days make auto-link
Otherwise match contact keywords, and show all open invoices from contact

(TODO: link logic configurable in setup for admin, retrieved/saved on AWS)
*/
import React, { useReducer } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SideNavWrapper, SideNav, MainWithSideNav } from './SideNav';
import { MatchFilters, filterReducer, initialFilters } from './MatchFilters';
import MatchMain from './Match-Main';
import { getAccounts } from '../actions/apiActions';
import { Link } from 'react-router-dom';
import { fetchMatchData } from './Match-store';


const MatchBankTransactions = () => {
    const { accessToken, accounts, matchStuff } = useSelector(store => store);
    const dispatch = useDispatch();
    const [filterState, setFilterState] = useReducer(filterReducer, initialFilters);
    if (accounts.notAsked) dispatch(getAccounts());

    const onChangeFilters = (payload) => {
        setFilterState({ type: 'SET_FILTER', payload });
    }
    const onChangeOnlyOpen = () => {
        setFilterState({ type: 'SET_ONLYOPEN' });
    }
    const onChangeMatched = () => {
        setFilterState({ type: 'SET_MATCHED' });
    }
    const onSubmit = () => {
        // load invoices, receipts, payments
        fetchMatchData({matchStuff, filterState, accessToken, dispatch});
        setFilterState({ type: 'SET_FETCHED'})
    }

    if (accessToken.hasData && accounts.hasAllData) {
        const activeAccounts = accounts.data.filter(a => a.active);
        const hasToppers = matchStuff.hasToppers;
        return <SideNavWrapper>
            <SideNav>
                <MatchFilters accounts={activeAccounts} filterState={filterState} hasToppers={hasToppers}
                    onChangeFilters={onChangeFilters} onChangeOnlyOpen={onChangeOnlyOpen} 
                    onChangeMatched={onChangeMatched}
                    onSubmit={onSubmit} />
            </SideNav>
            <MainWithSideNav>
                <MatchMain 
                    filterState={filterState} 
                    matchStuff={matchStuff}/>
            </MainWithSideNav>
        </SideNavWrapper>
    }
    if (accessToken.hasData && !accounts.hasError) return (
        // loading screen
        <div className="container">
            <div className="section">
                <h4>Rekeningen uploaden</h4>
                <p className="flex">
                    <span>Nog even gegevens van bankrekeningen aan het ophalen..</span>
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
    // no data, no connection
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

export default MatchBankTransactions;