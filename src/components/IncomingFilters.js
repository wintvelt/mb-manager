// IncomingFilters.js
// For displaying and managing filters in section on Incoming page

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

const IncomingFilters = (props) => {
	return (
		<SideNavDropDown chip={props.chip} title="Filters" icon="tune">
	    			<li>
	    					<Select 
	    						options={props.statusOptions} 
	    						styles={customStyles}
	    						placeholder="Alle statussen.."	    						
	    						defaultValue={props.statusFilter}
	    						onChange={ (list, action) => props.onChange({type: "status", list: list}) }  
							    isMulti
							    name="colors"
							    className="basic-multi-select"
							    classNamePrefix="select"
							/>
	    			</li>
	    			<li>
	    				<div className="switch">
						    <label>
						      Alle categorieën
						      <input type="checkbox" 
						      	checked={props.catFilter} 
						      	onChange={() => props.onChange({type:"cat"})}/>
						      <span className="lever"></span>
						      Alleen afwijkend
						    </label>
					 	</div>
						</li>
						<li>
	    					<Select 
	    						options={props.payOptions} 
	    						styles={customStyles}
	    						placeholder="Alle betaalmethoden.."	    						
	    						defaultValue={props.payFilter}
	    						onChange={ (list, action) => props.onChange({type: "pay", list: list}) }  
							    isMulti
							    name="colors"
							    className="basic-multi-select"
							    classNamePrefix="select"
								/>
	    			</li>
	    			<li>
	    					<Select 
	    						options={props.ownerOptions} 
	    						styles={customStyles}
	    						placeholder="Alle owners.."	    						
	    						defaultValue={props.ownerFilter}
	    						onChange={ (list, action) => props.onChange({type: "owner", list: list}) }  
							    isMulti
							    name="colors"
							    className="basic-multi-select"
							    classNamePrefix="select"
								/>
	    			</li>
	    			<li>
	    					<Select 
	    						options={props.supplierOptions} 
	    						styles={customStyles}
	    						placeholder="Alle leveranciers.."	    						
	    						defaultValue={props.supplierFilter}
	    						onChange={ (list, action) => props.onChange({type: "supplier", list: list}) }  
							    isMulti
							    name="colors"
							    className="basic-multi-select"
							    classNamePrefix="select"
								/>
	    			</li>
	    			<li>
	    				<div className="switch">
						    <label>
						      Alles tonen
						      <input type="checkbox" 
						      	checked={props.selFilter}
						      	disabled={!props.hasSelection} 
						      	onChange={() => props.onChange({type:"sel"})}/>
						      <span className="lever"></span>
						      Alleen selectie
						    </label>
					 		</div>
					</li>
		</SideNavDropDown>
	);
}

export default IncomingFilters;