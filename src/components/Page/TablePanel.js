import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import InputAdornment from '@material-ui/core/InputAdornment';
import Tooltip from '@material-ui/core/Tooltip';
import Icon from '@material-ui/core/Icon';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import { TableLink } from './helpers';

function desc(a, b, orderBy) {
    if (!a[orderBy] || b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (!b[orderBy] || b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function stableSort(array, cmp) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = cmp(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
    return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

function EnhancedTableHead(props) {
    const { classes, onSelectAllClick, order, orderBy, selectable,
        numSelected, rowCount, onRequestSort, headCells } = props;
    const createSortHandler = property => event => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                {selectable && <TableCell padding="checkbox">
                    <Checkbox
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={numSelected === rowCount && rowCount > 0}
                        onClick={onSelectAllClick}
                        inputProps={{ 'aria-label': 'alle betalingen selecteren' }}
                        color='primary'
                    />
                </TableCell>}
                {headCells.map(headCell => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : headCell.center ? 'center' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'default'}
                        sortDirection={orderBy === headCell.id ? order : false}
                        style={{
                            [headCell.numeric ? 'paddingLeft' : 'paddingRight']: headCell.wider,
                            width: headCell.width || 'inherit'
                        }}
                    >
                        {!headCell.disableSort && <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={order}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <span className={classes.visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </span>
                            ) : null}
                        </TableSortLabel>}
                        {headCell.disableSort && headCell.label}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles(theme => ({
    root: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1),
    },
    highlight:
        theme.palette.type === 'light'
            ? {
                color: theme.palette.primary.main,
                backgroundColor: lighten(theme.palette.primary.light, 0.85),
            }
            : {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.secondary.dark,
            },
    spacer: {
        flex: '1 1 100%',
    },
    actions: {
        color: theme.palette.text.secondary,
        display: 'flex'
    },
    title: {
        flex: '0 0 auto',
    },
}));

const EnhancedTableToolbar = props => {
    const classes = useToolbarStyles();
    const { numSelected, onDownload, onMulti, tableTitle, onSaveEdit } = props;

    return (
        <Toolbar
            className={clsx(classes.root, {
                [classes.highlight]: numSelected > 0,
            })}
        >
            <div className={classes.title}>
                {numSelected > 0 ? (
                    <Typography color="inherit" variant="subtitle1">
                        {numSelected} regel{numSelected !== 1 && 's'} geselecteerd
                    </Typography>
                ) : (
                        <Typography variant="h6" id="tableTitle">
                            {tableTitle}
                        </Typography>
                    )}
            </div>
            <div className={classes.spacer} />
            <div className={classes.actions}>
                {numSelected === 0 && onSaveEdit && <Tooltip title="Bewerkingen opslaan">
                    <Button aria-label="Opslaan bewerkingen" color='primary' size='small'
                        fullWidth={true}
                        onClick={onSaveEdit}>
                        Edits opslaan
                    </Button>
                </Tooltip>}
                {numSelected > 0 && onMulti && <Tooltip title="Bewerk geselecteerde regels">
                    <IconButton aria-label="Bewerk regels" onClick={onMulti}>
                        <Icon>edit</Icon>
                    </IconButton>
                </Tooltip>
                }
                {numSelected > 0 && onDownload && <Tooltip title="Download selectie als xlsx">
                    <IconButton aria-label="Download selectie" onClick={onDownload}>
                        <Icon>cloud_download</Icon>
                    </IconButton>
                </Tooltip>
                }
            </div>
        </Toolbar>
    );
};

EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
};

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing(3),
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(2),
    },
    table: {
        minWidth: 750,
    },
    tableWrapper: {
        overflowX: 'auto',
    },
    visuallyHidden: {
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: 1,
        margin: -1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        top: 20,
        width: 1,
    },
    editIcon: {
        padding: '6px'
    }
}));

const Editable = (props) => {
    const { onChange: emitChange, initValue, curValue: curPropValue } = props;
    const [isEditing, setIsEditing] = useState(false);
    const [curValue, setCurValue] = useState(curPropValue);
    const classes = useStyles();
    const handleChange = newVal => {
        setCurValue(newVal);
    }
    const handleSubmit = () => {
        setIsEditing(false);
        emitChange(curValue);
    }
    const onKey = e => {
        if (e.keyCode === 13) handleSubmit(e.target.value);
        if (e.keyCode === 27) handleSubmit(e.target.value);
    }
    const onClick = e => {
        setIsEditing(true)
    }

    const fieldStyle = {
        color: (initValue !== curValue) ? '#128675' : 'inherit'
    }
    return isEditing ?
        <TextField value={curValue || ''}
            fullWidth={true}
            inputProps={{ style: { ...fieldStyle, width: '100%' } }}
            InputProps={{
                autoFocus: true,
                onKeyDown: onKey,
                onBlur: () => handleSubmit(),
                endAdornment: <InputAdornment position="end">
                    <IconButton
                        aria-label="toggle edit"
                    ><Icon fontSize='small'>keyboard_return</Icon>
                    </IconButton>
                </InputAdornment>
            }}
            onChange={e => handleChange(e.target.value)} />
        : <Box style={{ display: 'flex', alignItems: 'center' }} onClick={onClick}>
            <Typography style={{ ...fieldStyle, flex: 1 }}>{curValue}</Typography>
            <IconButton className={classes.editIcon}>
                <Icon fontSize='small'>edit</Icon>
            </IconButton>
        </Box>
}

const RowCell = (props) => {
    const { row, cellConfig, edits, onChange, onSelect, isSelected } = props;
    const { key, padding, align, prettify, hrefBase, hrefKey, editable, render } = cellConfig;
    const initValue = row[key];
    const curValue = typeof edits === 'string' ? edits : initValue;
    const content = prettify ? prettify(initValue, row) : initValue;
    const isJustContent = !hrefBase && !editable && !render;
    return <TableCell padding={padding || 'default'} align={align || 'inherit'} >
        <TableLink hrefBase={hrefBase} hrefEnd={row[hrefKey]} initValue={initValue} content={content} />
        {editable && <Editable initValue={initValue} curValue={curValue} onChange={onChange} />}
        {isJustContent && content}
        {render && render(row, isSelected, onSelect)}
    </TableCell>
}

export function EnhancedTable(props) {
    const { rows, selected = [], onSelect, selectable = true, edited = { ids: [], edits: [] },
        onEdit, onDownload, onMulti, onSaveEdit, tableTitle, headCells, rowCells } = props;
    const { initOrder = 'desc', initOrderBy = 'date' } = props;
    const classes = useStyles();
    const [order, setOrder] = React.useState(initOrder);
    const [orderBy, setOrderBy] = React.useState(initOrderBy);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(25);

    const handleRequestSort = (event, property) => {
        const isDesc = orderBy === property && order === 'desc';
        setOrder(isDesc ? 'asc' : 'desc');
        setOrderBy(property);
    };

    const handleSelectAllClick = event => {
        if (selected.length < rows.length) {
            const newSelecteds = rows.map(n => n.id);
            onSelect(newSelecteds);
            return;
        }
        onSelect([]);
    };

    const handleClick = (event, id) => {
        if (!selectable) {
            onSelect(id)
        } else {
            const selectedIndex = selected.indexOf(id);
            let newSelected = [];
            if (selectedIndex === -1) {
                newSelected = newSelected.concat(selected, id);
            } else if (selectedIndex === 0) {
                newSelected = newSelected.concat(selected.slice(1));
            } else if (selectedIndex === selected.length - 1) {
                newSelected = newSelected.concat(selected.slice(0, -1));
            } else if (selectedIndex > 0) {
                newSelected = newSelected.concat(
                    selected.slice(0, selectedIndex),
                    selected.slice(selectedIndex + 1),
                );
            }
            onSelect(newSelected);
        }
    };

    const handleEdit = (initVal = '', newVal = '', id, field) => {
        const editedIndex = edited.ids.indexOf(id);
        const wasInList = (editedIndex !== -1);
        const isInit = (newVal === initVal);
        const newFieldRecord = { [field]: newVal };
        const oldRecordForRow = wasInList ? edited.edits[editedIndex] : {};
        const { [field]: removed, ...recordWithoutField } = oldRecordForRow;
        const hasOtherFields = (Object.keys(recordWithoutField).length > 0);
        const newEdited = hasOtherFields ?
            {
                ids: edited.ids,
                edits: [
                    ...edited.edits.slice(0, editedIndex),
                    isInit ? recordWithoutField : { ...recordWithoutField, ...newFieldRecord },
                    ...edited.edits.slice(editedIndex + 1)
                ]
            }
            : isInit ?
                {
                    ids: [...edited.ids.slice(0, editedIndex), ...edited.ids.slice(editedIndex + 1)],
                    edits: [
                        ...edited.edits.slice(0, editedIndex),
                        ...edited.edits.slice(editedIndex + 1)
                    ]
                }
                : wasInList ?
                    {
                        ids: edited.ids,
                        edits: [
                            ...edited.edits.slice(0, editedIndex),
                            newFieldRecord,
                            ...edited.edits.slice(editedIndex + 1)
                        ]
                    }
                    : {
                        ids: [...edited.ids, id],
                        edits: [...edited.edits, newFieldRecord]
                    }
        onEdit(newEdited);
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = event => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const isSelected = id => selected.indexOf(id) !== -1;
    const edits = id => {
        const editedIndex = edited.ids.indexOf(id);
        return editedIndex !== -1 ?
            edited.edits[editedIndex]
            : null
    }

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                {selectable && <EnhancedTableToolbar numSelected={selected.length}
                    onDownload={onDownload} onMulti={onMulti}
                    onSaveEdit={onSaveEdit} tableTitle={tableTitle} />}
                <div className={classes.tableWrapper}>
                    <Table
                        className={classes.table}
                        aria-labelledby="tableTitle"
                        size={'small'}
                    >
                        <EnhancedTableHead
                            selectable={selectable}
                            classes={classes}
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={rows.length}
                            headCells={headCells}
                        />
                        <TableBody>
                            {stableSort(rows, getSorting(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => {
                                    const isItemSelected = isSelected(row.id);
                                    const rowEdits = edits(row.id);
                                    const labelId = `enhanced-table-checkbox-${index}`;
                                    return (
                                        <TableRow
                                            hover
                                            role="checkbox"
                                            aria-checked={isItemSelected}
                                            tabIndex={-1}
                                            key={row.id || index}
                                            selected={isItemSelected}
                                        >
                                            {selectable && <TableCell padding="checkbox">
                                                <Checkbox
                                                    color='primary'
                                                    onClick={event => handleClick(event, row.id)}
                                                    checked={isItemSelected}
                                                    inputProps={{ 'aria-labelledby': labelId }}
                                                />
                                            </TableCell>}
                                            {rowCells.map((cellConfig, i) => {
                                                const edits = rowEdits && rowEdits[cellConfig.key];
                                                return <RowCell key={i}
                                                    row={row} cellConfig={cellConfig}
                                                    isSelected={isItemSelected}
                                                    edits={edits}
                                                    onSelect={event => handleClick(event, row.id)}
                                                    onChange={newVal => {
                                                        handleEdit(row[cellConfig.key], newVal, row.id, cellConfig.key)
                                                    }} />
                                            })}
                                        </TableRow>
                                    );
                                })}
                            {emptyRows > 0 && (
                                <TableRow style={{ height: (53) * emptyRows }}>
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <TablePagination
                    labelRowsPerPage='Rijen per pagina: '
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} van ${count}`}
                    rowsPerPageOptions={[25, 50, 100]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    backIconButtonProps={{
                        'aria-label': 'vorige pagina',
                    }}
                    nextIconButtonProps={{
                        'aria-label': 'volgende pagina',
                    }}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </Paper>
        </div>
    );
}