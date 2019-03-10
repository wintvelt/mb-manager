// ContactFilters.js

import React from 'react';
import Select from 'react-select';
import { SideNavDropDown } from './SideNav';

// to adjust weird height of Select Component
const customStyles = {
    control: (base, state) => ({
      ...base,
      height: '32px',
      minHeight: '32px',
      lineHeight: '12px'
    }),
};


export const ContactFilters = (props) => {
		return (
			<SideNavDropDown chip={props.chip} title="Filters" icon="tune">
							<li>
									<Select 
										options={props.contactOptions} 
										styles={customStyles}
										placeholder="Alle leveranciers.."	    						
										defaultValue={props.contactFilter}
										onChange={ (list, action) => props.onChange({type: "contact", list: list}) }  
										isMulti
										name="leverancier"
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
											name="owner"
											className="basic-multi-select"
											classNamePrefix="select"
									/>
							</li>
							<li>
								<Select 
										options={props.stdLedgerOptions} 
										styles={customStyles}
										placeholder="Alle categorieën.."	    						
										defaultValue={props.stdLedgerFilter}
										onChange={ (list, action) => props.onChange({type: "cat", list: list}) }  
										isMulti
										name="categorie"
										className="basic-multi-select"
										classNamePrefix="select"
								/>
							</li>
							<li>
								<Select 
										options={props.payOptions} 
										styles={customStyles}
										placeholder="Alle betaalwijzen.."	    						
										defaultValue={props.payFilter}
										onChange={ (list, action) => props.onChange({type: "pay", list: list}) }  
										isMulti
										name="betaling"
										className="basic-multi-select"
										classNamePrefix="select"
								/>
							</li>
							<li>
								<Select 
										options={props.EOLOptions} 
										styles={customStyles}
										placeholder="Alle EOL nrs.."	    						
										defaultValue={props.EOLfilter}
										onChange={ (list, action) => props.onChange({type: "EOL", list: list}) }  
										name="EOL"
										classNamePrefix="select"
								/>
							</li>
							<li>
								<div className="switch">
									<label>
										Alle MB nrs
										<input type="checkbox" 
											checked={props.MBFilter} 
											onChange={() => props.onChange({type:"MB"})}/>
										<span className="lever"></span>
										Alleen afwijkend
									</label>
								</div>

							</li>
							<li>
								<div className="switch">
									<label>
										Alles tonen
										<input type="checkbox" 
											checked={props.selFilter} 
											onChange={() => props.onChange({type:"sel"})}/>
										<span className="lever"></span>
										Alleen selectie
									</label>
								</div>
							</li>
			</SideNavDropDown>
		);
}

export default ContactFilters;