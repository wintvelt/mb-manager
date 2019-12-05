// Datapanel for export
import React from 'react';
import Select from 'react-select';

import { LoadingComp, LoadingIcon } from '../../helpers/apiData/apiData-components';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import { makeStyles } from '@material-ui/core/styles';
import { classes } from 'istanbul-lib-coverage';

const useStyles = makeStyles(theme => ({
    root: { flexGrow: 1 },
    paper: {
        padding: theme.spacing(1),
        position: 'relative',
        marginBottom: theme.spacing(2),
        display: 'flex'
    },
    syncButton: {
        position: 'absolute',
        right: theme.spacing(1),
        bottom: theme.spacing(1)
    }
}));

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

const yearComp = (yearOptions, selectedYear, setYear) => {
    return <Paper className={classes.paper}>
        {(yearOptions.length > 1) &&
            <Select
                options={yearOptions}
                styles={customStyles}
                defaultValue={selectedYear}
                onChange={(list, action) => setYear(list)}
                name="jaar"
                className='inline_select'
                classNamePrefix='inline_select'
            />}
        {yearOptions.length == 1 && yearOptions[0].value}
    </Paper>
}

export const ExportData = props => {
    const { yearOptions, selectedYear, setYear } = props;
    const classes = useStyles();
    return <Paper className={classes.paper}>
        <Icon>cloud</Icon>
        <Typography>
            Inkomende facturen uit {selectedYear.label}
        </Typography>
    </Paper>
}