// constants/table-helpers.js
// tCell() - takes string or cell object, and returns cell object
// tHead() - takes string or head object, returns head object
// tHeadAddSelect() - takes a headers, onSelect(id), onSelectAll(state), 
// 	colIndex, returns updated [] with function added
// tToggleSelect(rows, key, colIndex) - returns updated rows with selectionflipped in row[key] and colIndex

import React, { Component } from 'react';

const MAX_LENGTH = 28; // for field texts
const BRIEF_LENGTH = 7; // of shortened section

// Making cells
const defaultCell = {
	value: "",
	href: "",
	onSelect: null, // for clicking individual cells, will pass row key + colIndex
	className: "",
	data: "" // in case value is the icon name
}

export const tCell = (strOrObj) => {
	return (typeof strOrObj === "string")?
		Object.assign({}, defaultCell, { value : strOrObj} )
		: Object.assign({}, strOrObj);
}

// Making heads
// icon and className only used in cells, not in header
const defaultHead = {
	value: "",		// title
	align: "left",	// of cell col
	sortable: true,	// can column be sorted
	icon: false,	// if all cells are icons
	label: false,   // if cell to be displayed as label
	shorten: true, // if cell text needs to be shortened
	className: "",	// of the cells
	onSelect: null, // for selecting cells
	onSelectAll: null, // in selecting headers
	visibleIds: [] // for passing to onSelectAll
}

export const tHead = (strOrObj) => {
	return (typeof strOrObj === "string")?
		Object.assign({}, defaultHead, { value : strOrObj})
		: Object.assign({}, defaultHead, strOrObj);
}

// add a function to i-th header in array
export const tHeadAddSelect = (headers, onSelect, onSelectAll, index) => {
	return (
		headers.map((h, i) => {
			return (i === index)? 
				Object.assign({}, h, { onSelect : onSelect, onSelectAll: onSelectAll}) 
				: h
		})
	);
}
export const toggleCell = (cell, newVal) => {
	const newValue = (newVal)?
		newVal
		: (cell.value === "check_box")? "check_box_outline_blank" : "check_box"; 
	return (
		Object.assign({}, cell, 
			{ value: newValue })
	);
}

const toggleRow = (row, rowIndex, rowKey, colIndex) => {
	return (row[0].value === rowKey)?
		row.map((c,i) => (i === colIndex)? toggleCell(c) : c)
		: row;
}

export const tToggleSelect = (rows, rowKey, colIndex) => {
	return rows.map((r,i) => toggleRow(r,i, rowKey, colIndex))
}
// takes a tHead cell and returns Component
// i = index (used as key, columns are not moveable)
// onSort(tHead.value) = function for sorting
// sortValue : if this matches tHead value, then this is the column used in sorting
// sortDirection: up, down - used to show sorting icon
function hCell(item, i, onSort, sortValue, sortDirection) {
	var className = (item.align)? "h-"+item.align : "";
	if (item.className) { className = className + " " + item.className; }
	if ((onSort && item.sortable) || (item.onSelectAll))
		{ className = className + " clickable"; }
	const sortIcon = (item.value === sortValue && item.sortable)?
		<i className="material-icons">{(sortDirection === "up")?"arrow_drop_up":"arrow_drop_down"}</i>
		:
		"";
	if (item.onSelectAll) {
		return <th key={i} className={className} 
					onClick={() => item.onSelectAll(item.value, item.visibleIds)}>
				<i className="material-icons tiny">{item.value}</i>
			</th>
	}
	if (onSort && item.sortable) {
		return <th key={i} className={className} onClick={() => onSort(item.value)}>
			<div className="flex">{item.value}{sortIcon}</div></th>
	}
	return <th key={i} className={className} >{item.value}</th>

}

// [ tHead ]
// onSort(tHead.value) = function for sorting
// sortValue : if this matches tHead value, then this is the column used in sorting
// sortDirection: up, down - used to show sorting icon
// hideKey: true, *false for hiding first column with keys
function hRow(headers, onSort, sortValue, sortDirection, hideKey) {
	const headArr = (hideKey)? headers.slice(1,) : headers;
	return (
		<thead><tr>
			{headArr.map((item, i) => hCell(item, i, onSort, sortValue, sortDirection))}
		</tr></thead>
	);
}


// takes a tCell and returns Component
// i: index (used as key, columns are not moveable)
// head: tHead, used for styling
// rowKey: key of the row, used for passing to item.OnSelect
function cell(item, i, head, rowKey) {
	const onSelect = item.onSelect || head.onSelect;
	const value = (head.icon || !head.shorten)? item.value : short(item.value);
	const styling = Object.assign({}, 	
		(head.align !== "left")? { textAlign : head.align } : {},
		(head.icon)? { width: "1em" } : {}
	);
	var className = (onSelect)? head.className + " clickable" : head.className;
	className = (item.className)? className + " " + item.className : className;
	const content = (head.icon)?
		<i className="material-icons">{value}</i>
		: (head.label)?
			<span className={"label "+value}>{value}</span>
			: value;
	const contentWrapped = (item.href)?
		<a href={item.href} target="_blank" rel="noopener noreferrer">{content}</a> 
		: content;
	return ( (onSelect)? 
		<td className={className} key={i} style={styling} onClick={()=> {onSelect(rowKey,i)}}>
			{contentWrapped}</td>
		: <td className={className} key={i} style={styling}>{contentWrapped}</td>

	);
}

// arr = [ rowItems ]
// headers = [ header ]
function row(arr, j, headers, hideKey) {
	const row = (hideKey)? arr.slice(1,) : arr;
	const headArr = (hideKey)? headers.slice(1,) : headers;
	const ind = (index) => { return (hideKey)? index + 1 : index };
	const rowKey = arr[0].value;
	return (
		<tr key={rowKey}>
			{ row.map((item, i) => {
				return cell(item, ind(i), headArr[i], rowKey, headArr[i].onSelect)})
			}
		</tr>
	);
}

/* 	headers = [ strings ] or [ objects ]
	rows = [ strings ] or [ objects ]
	first item in each row needs to be unique key
	sortValue, sortDirection (optional): initial values
	hideKey = true: hide first column
*/
export const CustomTable = ({ headers, rows, onSort, sortValue, sortDirection, hideKey }) => {
	return (
		<table className='striped small'>
			{ hRow(headers, onSort, sortValue, sortDirection, hideKey) }
			<tbody>
				{ rows.map((r, i) => row(r, i, headers, hideKey) )}
			</tbody>
		</table>
	);
}


const compareRows = (a,b, i, direction = "up", isNum = false) => {
	const d = (direction === "up")? 1 : -1;
	const aival = (a[i].value)? 
		(isNum)?
			a[i].value.replace(/[.]/g, "").replace(/,/g, '.')*1
			: a[i].value.toLowerCase() 
		: null;
	const bival = (b[i].value)? 
		(isNum)?
			b[i].value.replace(/[.]/g, "").replace(/,/g, '.')*1
			: b[i].value.toLowerCase() 
		: null;
	if ( aival ) {
		if ( bival ) {
			if ( aival < bival ) return -1 * d
			else if ( aival > bival ) return 1 * d
			else return 0;
		} else {
			return 1 * d;
		}
	} else {
		if ( bival ) {
			return -1 * d;
		} else {
			return 0;
		}		
	}
}


const sortIndex = (arr, value) => {
	const index = arr.map((item) => item.value).indexOf(value);
	return (index === -1)? 0 : index;
}

export class SortableTable extends Component {
	constructor(props) {
		super(props);
		this.state= {
			sortValue: props.sortValue,
			sortDirection: props.sortDirection,
		}
		this.onSort = this.onSort.bind(this);
	}
	onSort(sortValue) {
		const newDir = (this.state.sortValue === sortValue && this.state.sortDirection === "up")?
			"down" : "up";
		this.setState({
			sortValue: sortValue,
			sortDirection: newDir,
		})
	}
	render() {
		const sortedRows = this.props.rows.sort((a,b) => 
				compareRows(a,b, 
					sortIndex(this.props.headers, this.state.sortValue), 
					this.state.sortDirection,(this.state.sortValue === "Bedrag")));
		return (
			<CustomTable 
				headers={this.props.headers} 
				rows={sortedRows}
				onSort={this.onSort}
				sortValue={this.state.sortValue}
				sortDirection={this.state.sortDirection}
				hideKey={this.props.hideKey}/>
		);
	}
}

const short = (value) => {
	return (value && value.length > MAX_LENGTH)?
		value.substring(0,BRIEF_LENGTH) + ".." + value.substring(value.length - BRIEF_LENGTH)
		: value;
}