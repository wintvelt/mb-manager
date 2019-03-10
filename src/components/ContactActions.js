import React, { Component } from 'react';
import Select from 'react-select';
import { SideNavDropDown } from './SideNav';

// to adjust weird height of Select Component
const customStyles = {
    control: (base, state) => ({
      ...base,
      height: '42px',
      minHeight: '42px'
  	}),
  	container: (base) => ({
  		...base,
      	flex: 1,
      	marginRight: '8px'
    })
};

class ContactActions extends Component {
	constructor(props) {
		super(props);
		this.state = {
			stdLedger: "",
			newOwner: "",
			newPayment: ""
		}
		this.onChange = this.onChange.bind(this);
	}
	onChange(field, newValue) {
		switch (field) {
			case "stdLedger": {
				this.setState({
					stdLedger: newValue
				});
				break;
			}
			case "newOwner": {
				this.setState({
					newOwner: newValue
				});
				break;
			}
			case "newPayment": {
				this.setState({
					newPayment: newValue
				});
				break;
			}
			default:
				break;
		}
	}
	render() {
		const btnClass = (this.props.chips >0)? "btn" : "btn disabled";
		const icon = (this.props.chips > 0)? "play_circle_outline" : "check_box_outline_blank";
		return (
			<SideNavDropDown chip={this.props.chips} title="Acties" icon={icon}>
		    			<li>
		    				<div className="sidenav-input">
			    				<div className="input-field" style={{ flex: 1, marginRight: '8px'}}>
		          					<input id="owner" type="text"
		          						value={this.state.newOwner}
		          						onChange={(e) => this.onChange("newOwner",e.target.value)}/>
		          					<label htmlFor="owner">Nieuwe owner</label>
		        				</div>
			    				<div className={btnClass} onClick={ () => {
			    						this.props.onPatch(
		    								{ fieldId: "243235712412944078", newValue: this.state.newOwner }
		    							);
		    							this.setState({ newOwner: ""});
		    						}}>
			    					Go
			    				</div>
		    				</div>
		    			</li>
		    			<li>
		    				<div className="sidenav-input">
		    					<Select 
		    						options={this.props.stdLedgerOptions} 
		    						styles={customStyles}
		    						placeholder="Nieuwe std cat"	    						
		    						onChange={(item,action) => this.onChange("stdLedger", item.label)}
								    name="stdLedger"
								    className="basic-single"
								    classNamePrefix="select"
								/>
			    				<div className={btnClass} onClick={ () => this.props.onPatch(
		    							{ fieldId: "243301268733298558", newValue: this.state.stdLedger }
		    						) }>
			    					Go
			    				</div>
		    				</div>
		    			</li>
		    			<li>
		    				<div className="sidenav-input">
			    				<div className="input-field" style={{ flex: 1, marginRight: '8px'}}>
		          					<input id="payment" type="text"
		          						value={this.state.newPayment}
		          						onChange={(e) => this.onChange("newPayment",e.target.value)}/>
		          					<label htmlFor="payment">Nieuwe standaard betaling</label>
		        				</div>
			    				<div className={btnClass} onClick={ () => {
			    						this.props.onPatch(
		    								{ fieldId: "243256711800948256", newValue: this.state.newPayment }
		    							);
		    							this.setState({ newPayment: ""});
		    						}}>
			    					Go
			    				</div>
		    				</div>
		    			</li>
		    			<li>
							<div className="sidenav-input">
		    				<p>Update met EOL nr</p>
		    				<div className={btnClass} onClick={ () => {
								this.props.onPatch(
									{ fieldId: "customer_id" }
								)
							}}>
		    					<i className="material-icons">sync</i>
		    				</div>
		    				</div>
		    			</li>
		    			<li>
							<div className="sidenav-input">
		    				<p>Update Klant nr</p>
		    				<div className={btnClass} onClick={ () => {
								this.props.onPatch(
									{ fieldId: "mb_id" }
								)
							}}>
		    					<i className="material-icons">vpn_key</i>
		    				</div>
		    				</div>
		    			</li>
		    			<li>
							<div className="sidenav-input">
		    				<p>Download csv</p>
		    				<div className={btnClass} onClick={this.props.onDownload}>
		    					<i className="material-icons">cloud_download</i>
		    				</div>
		    				</div>
		    			</li>
		    		</SideNavDropDown>
		);
	}
}

export default ContactActions;