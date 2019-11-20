// PaymentsData.js
import React from 'react';
import { LoadingComp, LoadingIcon } from '../../helpers/apiData/apiData-components';

import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';


// styles
const useStyles = makeStyles(theme => ({
    heading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
        flexBasis: '10rem',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center'
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.primary,
        alignSelf: 'center'
    },
    icon: {
        marginRight: '1rem',
        height: '24px;'
    },
    listButton: {
        marginRight: '1rem'
    }
}));

// receives data through props
export default (props) => {
    const { contacts, ledgers, expanded, onChange } = props;

    const contactsList = contacts.toJS();
    const ledgersList = ledgers.toJS();
    const loadingApiData = {
        isLoading: contactsList.isLoading || ledgersList.isLoading,
        hasError: contactsList.hasError || ledgersList.hasError,
        hasAllData: contactsList.hasAllData && ledgersList.hasAllData
    }
    const loadingApiText = (loadingApiData.hasAllData) ?
        `${contactsList.data.length} contacten opgehaald.`
        : loadingApiData.hasError ? 'Fout bij het laden.'
            : loadingApiData.isLoading ? `...contacten ophalen.`
                : '';

    const classes = useStyles();

    return <ExpansionPanel expanded={expanded} onChange={onChange}>
        <ExpansionPanelSummary
            expandIcon={<Icon>expand_more</Icon>}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
        >
            <Box className={classes.heading}>
                <span className={classes.icon}>
                    <LoadingIcon apiData={loadingApiData} defaultIcon='cloud_queue' />
                </span>
                Gegevens
            </Box>
            <Typography className={classes.secondaryHeading}>
                {loadingApiText}
            </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
            <List>
                <LoadingComp name='contacten' apiData={contactsList} />
                <LoadingComp name='categorieën' apiData={ledgersList} />
            </List>
        </ExpansionPanelDetails>
    </ExpansionPanel>
}