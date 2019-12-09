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
    flatPanel: {
        marginBottom: theme.spacing(3),
        backgroundColor: 'inherit',
        boxShadow: 'none'
    },
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

export const makeLoadingApiData = apiDataSources => {
    const dataSources = apiDataSources.map(apiData => apiData.toJS());
    return {
        isLoading: dataSources.reduce((out, data) => out || data.isLoading, false),
        hasError: dataSources.reduce((out, data) => out || data.hasError, false),
        hasAllData: dataSources.reduce((out, data) => out && data.hasAllData, true),
    }
}

// receives data through props
export const DataPanel = (props) => {
    const { apiDataSources = [], apiTitles = [], expanded, onChange, title, loadingText, flat } = props;

    const loadingApiData = makeLoadingApiData(apiDataSources);
    const dataCount = !apiDataSources[0].toJS().data ? '0'
        : apiDataSources[0].toJS().data.length ?
            apiDataSources[0].toJS().data.length : '';
    const loadingApiText = loadingText || ((loadingApiData.hasAllData) ?
        `${dataCount} ${title} opgehaald.`
        : loadingApiData.hasError ? 'Fout bij het laden.'
            : loadingApiData.isLoading ? `...${title} ophalen (${dataCount}).`
                : '');

    const classes = useStyles();
    const panelClass = flat && classes.flatPanel;
    const hasOneData = apiTitles.length === 1;
    const hasOneAction = props.children && React.Children.count(props.children) === 1;

    return <ExpansionPanel expanded={expanded} onChange={onChange} className={panelClass}>
        <ExpansionPanelSummary
            expandIcon={(hasOneData && hasOneAction)? props.children : <Icon>expand_more</Icon>}
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
        {!hasOneData && <ExpansionPanelDetails>
            <List>
                {apiTitles.map((apiTitle, i) => {
                    return <LoadingComp key={apiTitle} name={apiTitle} apiData={apiDataSources[i].toJS()} />
                })}
            </List>
        </ExpansionPanelDetails>}
        {props.children && <ExpansionPanelActions>
            {props.children}
        </ExpansionPanelActions>
        }
    </ExpansionPanel>
}