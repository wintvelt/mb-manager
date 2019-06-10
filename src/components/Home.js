//Content on Home page
import React, { Component } from 'react';

const cards =
	[
		{
			title: "Welkom",
			par: "Welkom bij Moblybird, een online hulp voor Moneybird voor Mobly. Via deze site kun je bepaalde dingen makkelijker en sneller doen dan direct op de Moneybird site. Het is iets makkelijker om bepaalde facturen, betalingen, of contacten terug te vinden. Daarnaast kun je met Moblybird ook meerdere bewerkingen in 1 keer doen, zoals bijvoorbeeld een set van facturen aan een categorie (rekening) toewijzen."		
		},
		{
			title: "Connectie",
			par: "Handig om bij de connectie met Moneybird te starten. Zie de link in het menu rechtsboven. Als het poppetje wit is, dan moet je nog een connectie maken. Klik op dat menu item, en volg de instructies daar."
		}
	].map((obj, i) => { return Object.assign({}, obj, { id: i }) });

const cardView = (card, clickFunc) => {
	return (
		<div className="col s12 m4" key={card.id}>
			<div className="card blue-grey darken-1">
				<div className="card-content white-text">
					<span className="card-title">{card.title}</span>
					<p>{card.par}</p>
				</div>
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
		this.state = { cards: cards }
		this.dismiss = this.dismiss.bind(this)
	}
	dismiss(id) {
		this.setState({ cards: this.state.cards.filter(c => (c.id !== id)) });
	}
	render() {
		return (
			<div className="container">
				<div className="row">
					{this.state.cards.map(c => cardView(c, this.dismiss))}
				</div>
				<div className="row">
					<h5>I am h5 header</h5>
				</div>
				<div className="divider"></div>
				<div className="row">
					<h6>I am H6 header</h6>
				</div>

			</div>
		);
	}

}

export default Home;