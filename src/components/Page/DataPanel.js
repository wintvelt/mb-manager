// DataPanel.js
// Generic Panel to use on a generic page
import React from 'react';
import { LoadingComp, LoadingIcon } from '../../helpers/apiData/apiData-components';

import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
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

export const makeLoadingApiData = dataSources => {
    return {
        isLoading: dataSources.reduce((out, data) => out || data.isLoading, false),
        hasError: dataSources.reduce((out, data) => out || data.hasError, false),
        hasAllData: dataSources.reduce((out, data) => out && data.hasAllData, true),
    }
}

// receives data through props
export const DataPanel = (props) => {
    const { apiDataSources = [], apiTitles = [], expanded, onChange, title, loadingText } = props;
    const dataSources = apiDataSources.map(apiData => apiData.toJS());

    const loadingApiData = makeLoadingApiData(dataSources);
    const loadingApiText = loadingText || (loadingApiData.hasAllData) ?
        `${dataSources[0].data.length} ${title} opgehaald.`
        : loadingApiData.hasError ? 'Fout bij het laden.'
            : loadingApiData.isLoading ? `...${title} ophalen.`
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
                {apiTitles.map((apiTitle, i) => {
                    return <LoadingComp key={apiTitle} name={apiTitle} apiData={dataSources[i]} />
                })}
            </List>
        </ExpansionPanelDetails>
        {props.children && <ExpansionPanelActions>
            {props.children}
        </ExpansionPanelActions>
        }
    </ExpansionPanel>
}