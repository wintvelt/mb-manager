import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { getPayments, getContacts, getAccounts } from '../../actions/apiActions-new';

import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/Box';

import { LoadingComp } from '../../helpers/apiData/apiData-components';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
        flexBasis: '10rem',
        flexShrink: 0,
        display: 'flex'
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.primary,
    },
    icon: {
        marginRight: '1rem'
    }
}));

const ExpandMoreIcon = () => <Icon>expand_more</Icon>

export default function Payments() {
    const classes = useStyles();
    const payments = useSelector(store => store.payments);
    const paymentsList = payments.apiData;
    const accessToken = useSelector(store => store.accessToken);
    const access_token = accessToken.data;
    const dispatch = useDispatch();
    const [expanded, setExpanded] = useState(['loading']);
    const [period, setPeriod] = useState(',period:this_quarter');

    useEffect(() => {
        dispatch(getAccounts(access_token));
        dispatch(getContacts(access_token));
    },[dispatch, access_token])

    useEffect(() => {
        dispatch(getPayments(access_token, period));
    },[dispatch, access_token, period])

    const handleChange = panel => (event, isIn) => {
        const newExpanded = (!isIn) ?
            expanded.filter(it => it !== panel)
            : [...expanded, panel];
        setExpanded(newExpanded);
    };

    return (
        <div className={classes.root}>
            <ExpansionPanel expanded={expanded.includes('loading')} onChange={handleChange('loading')}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                >
                    <Typography className={classes.heading}>
                        <Icon className={classes.icon}>cloud_queue</Icon>Geladen
                        </Typography>
                    <Typography className={classes.secondaryHeading}>
                    </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <List>
                        <LoadingComp name='rekeningen' apiData={accountsList} />
                        <LoadingComp name='betalingen' apiData={paymentsList} />
                        <LoadingComp name='contacten' apiData={contactsList} />
                    </List>
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel expanded={expanded.includes('panel2')} onChange={handleChange('panel2')}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2bh-content"
                    id="panel2bh-header"
                >
                    <Typography className={classes.heading}>
                        <Icon className={classes.icon}>filter_list</Icon>
                        Filters
                        </Typography>
                    <Typography className={classes.secondaryHeading}>
                        2 filters toegepast.
                    </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Typography>
                        Donec placerat, lectus sed mattis semper, neque lectus feugiat lectus, varius pulvinar
                        diam eros in elit. Pellentesque convallis laoreet laoreet.
          </Typography>
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel expanded={expanded.includes('panel3')} onChange={handleChange('panel3')} disabled>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel3bh-content"
                    id="panel3bh-header"
                >
                    <Typography className={classes.heading}>
                        <Icon className={classes.icon}>build</Icon>
                        Actie
                    </Typography>
                    <Typography className={classes.secondaryHeading}>
                        Geen selectie gemaakt.
                    </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Typography>
                        Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer sit amet egestas eros,
                        vitae egestas augue. Duis vel est augue.
                    </Typography>
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <Box>
                Table goes here
            </Box>
        </div >
    );
}