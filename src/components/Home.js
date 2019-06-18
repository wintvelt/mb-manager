//Content on Home page
import React, { Component } from 'react';

const cards =
	[
		{
			title: "Welkom",
			par: "Welkom bij Moblybird, een online hulp voor Moneybird voor Mobly. Een tooltje met extra functies voor Moneybird, speciaal voor Mobly."
		},
		{
			title: "Extra: Filteren en sorteren",
			par: "Uitgebreider filteren en sorteren. Handig voor..Als je een factuur zoekt en alleen bedrag weet. Of een betaling terugzoekt op bedrag."
		},
		{
			title: "Extra: Meerdere updates tegelijk",
			par: "Makkelijk regels selecteren en in 1x updaten. Handig voor.. Bijv facturen van een leverancier aan een andere categorie hangen."
		},
		{
			title: "Extra: Exporteren",
			par: "Selecties exporteren naar een csv bestand. Handig voor.. maandelijkse summary aan elk management-lid van zijn/haar kosten."
		},
		{
			title: "Connectie",
			par: "Het begint bij connectie. Via de link (rechtsboven) kun je connectie maken. Zodra je connectie hebt, zie je meer functies."
		},
		{
			title: "Menu: Contacten",
			par: "Overzicht van alle contacten, inclusief Mobly velden in 1 lijst. Handig om owners te updaten, of te exporteren voor check."
		},
		{
			title: "Menu: Inkomend (facturen)",
			par: "Overzicht van alle facturen, inclusief Mobly velden in 1 lijst. Handig om te checken of alles wel goed is geboekt"
		},
		{
			title: "Menu: Betalingen",
			par: "Overzicht van alle betalingen, inclusief poging om contact uit omschrijving te halen. Zoeken in betalingen kan in Moblybird wel."
		}
	].map((obj, i) => { return Object.assign({}, obj, { id: i }) });

const cardView = (card, clickFunc) => {
	return (
		<div className="col s12 m6 l4" key={card.id}>
			<div className="card blue-grey darken-1">
				<div className="card-content white-text">
					<span className="card-title">{card.title}</span>
					<p>{card.par}</p>
				</div>
				<div className="card-badge">{card.id+1}</div>
				<div className="card-action">
					<button className="btn-flat orange-text" onClick={e => clickFunc(card.id)}>Got it!</button>
				</div>
			</div>
		</div>
	);
}

class Home extends Component {
	constructor(props) {
		super(props);
		this.state = { cards: cards };
		this.dismiss = this.dismiss.bind(this);
		this.reset = this.reset.bind(this);
	}
	dismiss(id) {
		this.setState({ cards: this.state.cards.filter(c => (c.id !== id)) });
	}
	reset() {
		this.setState({ cards: cards });
	}
	render() {
		return (
			<div className="container">
				{(this.state.cards.length > 0)?
					<div className="row">
						{this.state.cards.map(c => cardView(c, this.dismiss))}
					</div>
					:
					<h6 className="empty center-align grey-text">Niks meer te doen hier. Kies uit het menu boven..</h6>
				}
				{(this.state.cards.length !== cards.length)?
					<div><span className="btn" onClick={this.reset}>Alle kaarten tonen</span></div>
					:
					<div></div>
				}
			</div>
		);
	}

}

export default Home;