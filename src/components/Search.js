import React from 'react';
import '../Search.css';
import axios from 'axios';
import Loader from '../loader.gif';
import PageNavigation from './PageNavigation';

class Search extends React.Component {

	constructor( props ) {
		super( props );

		this.state = {
			query: '',
			results: {},
			loading: false,
			message: '',
			totalResults: 0,
			totalPages: 0,
			currentPageNo: 0,
		};

		this.cancel = '';
	}

	getPageCount = ( total, denominator ) => {
		const divisible	= 0 === total % denominator;
		const valueToBeAdded = divisible ? 0 : 1;
		return Math.floor( total/denominator ) + valueToBeAdded;
	};
	
	componentDidMount() {
		const searchUrl = `https://rickandmortyapi.com/api/episode`;
		if( this.cancel ) {
			this.cancel.cancel();
		}

		this.cancel = axios.CancelToken.source();
		axios.get( searchUrl, {
			cancelToken: this.cancel.token
		} )
			.then( res => {
				const total = res.data.info.count;
				const totalPagesCount = this.getPageCount(total, 6);
				const resultNotFoundMsg = ! res.data.results.length
										? 'There are no more search results. Please try a new search'
										: '';
				this.setState( {
					results: res.data.results,
					message: resultNotFoundMsg,
					totalResults: total,
					totalPages: totalPagesCount,
					currentPageNo: 1,
					loading: false
				} )
			} )
			.catch( error => {
				if ( axios.isCancel(error) || error ) {
					this.setState({
						loading: false,
						message: 'Failed to fetch the data. Please check network'
					})
				}
			} )
	}
	
	fetchSearchResults = ( updatedPageNo = '', query ) => {
		const pageNumber = updatedPageNo ? `?page=${updatedPageNo}` : '';
		const searchUrl = `https://rickandmortyapi.com/api/episode/?name=${query}`;

		if( this.cancel ) {
			this.cancel.cancel();
		}

		this.cancel = axios.CancelToken.source();

		axios.get( searchUrl, {
			cancelToken: this.cancel.token
		} )
			.then( res => {
				const total = res.data.info.count;
				const totalPagesCount = this.getPageCount(total, 4);
				const resultNotFoundMsg = ! res.data.results.length
										? 'There are no more search results. Please try a new search'
										: '';
				this.setState( {
					results: res.data.results,
					message: resultNotFoundMsg,
					totalResults: total,
					totalPages: totalPagesCount,
					currentPageNo: updatedPageNo,
					loading: false
				} )
			} )
			.catch( error => {
				if ( axios.isCancel(error) || error ) {
					this.setState({
						loading: false,
						message: 'Failed to fetch the data. Please check network'
					})
				}
			} )
	};

	handleOnInputChange = ( event ) => {
		const query = event.target.value;
		if ( ! query ) {
			this.setState( { query, results: {}, message: '', totalPages: 0, totalResults: 0 } );
		} else {
			this.setState( { query, loading: true, message: '' }, () => {
				this.fetchSearchResults( 1, query );
			} );
		}
	};

	handlePageClick = ( type ) => {
		event.preventDefault();
		const updatePageNo = 'prev' === type
			? this.state.currentPageNo - 1
			: this.state.currentPageNo + 1;

		if( ! this.state.loading  ) {
			this.setState( { loading: true, message: '' }, () => {
				this.fetchSearchResults( updatePageNo, this.state.query );
			} );
		}
	};

	renderSearchResults = () => {
		const { results } = this.state;
        console.log(results.length)
		if ( Object.keys( results ).length && results.length ) {
			return (
				<>
					<section className="banner-sec"/>
						<div className="container">
						<div className="row  pt-3">
								{results.map(val=>
									<div className="col-md-3" >
									<div className="card"  style={{marginTop:'40px'}}> 
										  <div className="card-body">
												<div className="news-title">
												<h2 className=" title-small"><a href="#">Name: <b><i>{val.name}</i></b></a></h2>
												</div>
												<p>Episode: <b><i>{val.episode}</i></b></p>
												<p className="card-text"><small className="text-time"><em>Date: {val.air_date}</em></small></p>
										  </div>													
										</div>
									</div>	
								)}
							</div>
						</div>
					<section />
				</>
			)
		}
	};

	render() {
		const { query, loading, message, currentPageNo, totalPages } = this.state;

		const showPrevLink = 1 < currentPageNo;
		const showNextLink = totalPages > currentPageNo;

		return (
			<div className="container">
			{/*	Heading*/}
			<h2 className="heading bigblue"> The Rick and Morty</h2>
			{/* Search Input*/}
			<label className="search-label" htmlFor="search-input">
				<input
					type="text"
					name="query"
					value={ query }
					id="search-input"
					placeholder="Search..."
					onChange={this.handleOnInputChange}
				/>
				<i className="fa fa-search search-icon" aria-hidden="true"/>
			</label>

			{/*	Error Message*/}
				{message && <p className="message">{ message }</p>}

			{/*	Loader*/}
			<img src={ Loader } className={`search-loading ${ loading ? 'show' : 'hide' }`} alt="loader"/>

			{/*Navigation*/}
			<PageNavigation
				loading={loading}
				showPrevLink={showPrevLink}
				showNextLink={showNextLink}
				handlePrevClick={ () => this.handlePageClick('prev', event )}
				handleNextClick={ () => this.handlePageClick('next', event )}
			/>

			{/*	Result*/}
			{ this.renderSearchResults() }

			{/*Navigation*/}
			<PageNavigation
				loading={loading}
				showPrevLink={showPrevLink}
				showNextLink={showNextLink}
				handlePrevClick={ () => this.handlePageClick('prev', event )}
				handleNextClick={ () => this.handlePageClick('next', event )}
			/>

			</div>
		)
	}
}

export default Search
