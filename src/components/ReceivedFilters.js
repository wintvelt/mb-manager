// ReceivedFilters.js

import React from 'react';
import Select from 'react-select';
import { SideNavDropDown } from './SideNav';

// to adjust weird height of Select Component
const customStyles = {
	control: (base, state) => ({
		...base,
		height: '42px',
		minHeight: '42px',
		lineHeight: '14px'
	}),
};

export const filterMonth = (row, filter) => {
	const rowDateString = row[2].value;
	var rowDate = new Date();
	rowDate.setTime(Date.parse(rowDateString));
	const today = new Date();
	if (!filter || !filter.value) return true;
	switch (filter.value) {
		case "Deze maand": {
			return (today.getMonth() === rowDate.getMonth())
		}
		case "Vorige maand": {
			const diff = today.getMonth() - rowDate.getMonth();
			return (diff === 1 || diff === -11)
		}
		case "Dit kwartaal": {
			return (today.getMonth() - rowDate.getMonth() < 3)
		}
		case "Dit jaar": {
			return (today.getFullYear() === rowDate.getFullYear())
		}
		default: {
			return true;
		}
	}
}

export const filterSearch = (row, filter) => {
	if (!filter || filter.length < 3) return true;
	const desc = row[7].value;
	return desc.toLowerCase().includes(filter);
}

export const filterAmount = (row, filter) => {
	if (!filter || !filter.value) return true;
	switch (filter.value) {
		case "Ontvangen": {
			return (row[3].value > "0")
		}
		case "Uitgegeven": {
			return (row[3].value < "0")
		}
		default: {
			return true;
		}
	}
}

export const filterAccount = (row, filter) => {
	if (!filter || !filter.value) return true;
	const account = row[8].value;
	return (account === filter.value);
}

export const filterStatus = (row, filter) => {
	if (!filter) return true;
	return (row[5].value === "open");
}

const ReceivedFilters = (props) => {
	return (
		<SideNavDropDown chip={props.chip} title="Filters" icon="tune">
			<li>
				<Select
					options={props.accountOptions}
					styles={customStyles}
					placeholder="Alle rekeningen.."
					defaultValue={props.accountFilter}
					onChange={(list, action) => props.onChange({ type: "account", list: list })}
					isClearable={true}
					name="account"
					className="basic-multi-select"
					classNamePrefix="select"
				/>
			</li>
			<li>
				<Select
					options={props.monthOptions}
					styles={customStyles}
					placeholder="Alle periodes.."
					defaultValue={props.monthFilter}
					onChange={(list, action) => props.onChange({ type: "month", list: list })}
					isClearable={true}
					name="maand"
					className="basic-multi-select"
					classNamePrefix="select"
				/>
			</li>
			<li>
				<div className="switch">
					<label>
						Alles statussen
						      <input type="checkbox"
							checked={props.statusFilter}
							onChange={() => props.onChange({ type: "status" })} />
						<span className="lever"></span>
						Alleen openstaand
						    </label>
				</div>
			</li>
			<li>
				<Select
					options={props.amountOptions}
					styles={customStyles}
					placeholder="In- en uitgaand"
					defaultValue={props.amountFilter}
					onChange={(list, action) => props.onChange({ type: "amount", list: list })}
					isClearable={true}
					name="amount"
					className="basic-multi-select"
					classNamePrefix="select"
				/>
			</li>
			<li>
				<div className="sidenav-input">
					<div className="input-field" style={{ flex: 1, marginRight: '8px' }}>
						<input id="search" type="text"
							value={props.searchText}
							placeholder="zoeken"
							onChange={(e) => props.onChange({ type: "search", list: e.target.value })} />
					</div>
				</div>
			</li>
			<li>
				<div className="switch">
					<label>
						Alles tonen
										<input type="checkbox"
							checked={props.selFilter}
							onChange={() => props.onChange({ type: "sel" })} />
						<span className="lever"></span>
						Alleen selectie
									</label>
				</div>
			</li>
		</SideNavDropDown>
	);
}

export default ReceivedFilters;