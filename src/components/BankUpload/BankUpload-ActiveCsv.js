import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setBank } from '../../actions/actions';
import { parseCsv } from '../../store/reducer-helpers-bank';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

const useStyles = makeStyles(theme => ({
    root: {
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        marginTop: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#b3e5fc'
    },
    panelTitle: {
        flexBasis: '25%',
        flexShrink: 0,
    },
    secTitle: {
        color: theme.palette.text.secondary,
        flex: 1
    },
    button: {
        marginLeft: theme.spacing(1)
    },
    tableCell: {
        padding: '4px 16px',
        whiteSpace: 'nowrap',
    }
}))

export const BankActiveCsv = (props) => {
    const { activeCsv, onConvert } = props;
    const { apiData, filename } = activeCsv;
    const dispatch = useDispatch();
    const classes = useStyles();
    const [csvVisible, setCvsVisible] = useState(false);
    const csvData = parseCsv(apiData.toJS().data);

    const onClearCsv = () => {
        dispatch(setBank({
            type: 'resetCsv'
        }));
    }
    // const headState = (data) ? 'csv-menu-enabled' : 'csv-menu-disabled';
    // const btnClass = (data) ? 'btn btn-flat waves-effect waves-light'
    //     : 'btn btn-flat waves-effect waves-light disabled';
    // return <div>
    //     <Header filename={filename} headState={headState} btnClass={btnClass}
    //         onClick={() => setCvsVisible(true)}
    //         onClearCsv={onClearCsv} />
    //     {(data && csvVisible) ?
    //         <div style={{ width: '100%', height: '0', position: 'relative' }}>
    //             <div className='csv-card card grey lighten-3'>
    //                 <Header filename={filename} headState='csv-menu-open'
    //                     btnClass={btnClass} onClick={() => setCvsVisible(false)} />
    //                 <div className='csv-scroll-area'>
    //                     <CsvTable rowData={data} />
    //                 </div>
    //             </div>
    //         </div>
    //         : <></>
    //     }
    // </div>
    return <>
        <Paper className={classes.root}>
            <Typography className={classes.panelTitle}>
                Actief csv-bestand:{'\u00A0'}
            </Typography>
            <Typography className={classes.secTitle}>
                {filename}
            </Typography>
            <Button color='primary' size='medium' className={classes.button}
                onClick={onConvert}>
                Converteer
            </Button>
            <IconButton variant='contained' color='primary' size='medium' className={classes.button}
                onClick={() => setCvsVisible(true)}>
                <Icon fontSize='small'>open_with</Icon>
            </IconButton>
            <IconButton variant='contained' color='primary' size='medium' className={classes.button}
                onClick={onClearCsv}>
                <Icon fontSize='small'>close</Icon>
            </IconButton>
        </Paper>
        <Dialog fullWidth maxWidth='lg' open={csvVisible} onClose={() => setCvsVisible(false)}>
            <DialogTitle>{filename}</DialogTitle>
            <CsvTable rowData={csvData} />
        </Dialog>
    </>
}

const CsvTable = (props) => {
    const { rowData } = props;
    return <div style={{ position: 'relative', overflow: 'scroll', padding: '0 16px 32px 16px' }}>
        <Table stickyHeader>
            <TableHead>
                <CsvRow cellData={rowData[0]} />
            </TableHead>
            <TableBody>
                {rowData.slice(1).map((row, i) => {
                    return <CsvRow key={'row' + i + row[0]} cellData={row} isHeader={(i === 0)} />
                })}
            </TableBody>
        </Table>
    </div>
}

const CsvRow = (props) => {
    const { cellData } = props;
    const classes = useStyles();
    return <TableRow>
        {cellData.map((cell, j) => {
            return <TableCell key={'cell' + j + cell} className={classes.tableCell}>
                {cell}
            </TableCell>
        })}
    </TableRow>
}

const Header = (props) => {
    const { filename, headState, btnClass, onClick, onClearCsv } = props;
    const headClass = (headState === 'csv-menu-enabled') ? 'csv-menu card s12 flex'
        : (headState === 'csv-menu-open') ?
            'csv-menu csv-menu-open s12 flex'
            : (filename) ? 'csv-menu s12 flex grey-text'
                : 'csv-menu s12 flex white-text';
    const clearFunc = (headState === 'csv-menu-open') ? onClick : onClearCsv;
    return <div className={headClass}>
        <span>{filename}</span>
        <div className='csv-buttons'>
            {(headState === 'csv-menu-open') ?
                <></>
                :
                <button className={btnClass} onClick={onClick}>
                    <i className='material-icons'>loupe</i>
                </button>
            }
            <button className={btnClass} onClick={clearFunc}>
                <i className='material-icons'>clear</i>
            </button>
        </div>
    </div>
}