import React from "react"
import Header from "./Components/Header"
import Filter from "./Components/Filter"
import AirportList from "./Components/AirportList"
import Pagination from "./Components/Pagination"
import "./App.css"

class App extends React.Component {

  state = {
    rawData: [],
    displayData: [],
    activeFilters: [],
    searchTerm: "",
    currentPage: 1
  }


  componentDidMount() {
    caches.keys().then(keys => {
      if(keys.includes("airportdata")) {
        caches.open('airportdata').then(cache => {
          cache.match('data/airports.json').then(res => res.json())
          .then(res => {
            if(res.length > 0) { this.setState({ rawData: res, displayData: res,}, () => {
                this.setState({
                  activeFilters:  JSON.parse(window.localStorage.getItem("checkboxFilters")) || [],
                  searchTerm: window.localStorage.getItem("searchInput") || "",
                  displayData: JSON.parse(window.localStorage.getItem("displayData")) || res
                })
              })
            }
          })
      })
    } else {
          fetch("data/airports.json")
          .then( resp => resp.json())
          .then( resp => this.setState({
              rawData: resp, 
              displayData: resp
            }, () => {
              this.setState({
                activeFilters:  JSON.parse(window.localStorage.getItem("checkboxFilters")) || [],
                searchTerm: window.localStorage.getItem("searchInput") || "",
                displayData: JSON.parse(window.localStorage.getItem("displayData")) || resp
              })
          }))
          this.setCache();
      }
    })
}

setCache = () => {
if ('caches' in window) {
  caches.open('airportdata').then(cache => {
    cache.add("data/airports.json")
  })
}
  }

  handleChange = (e) => {

    const {type, name, value, checked} =  e.target;
    const { rawData, activeFilters, searchTerm} = this.state;

    this.setState({currentPage: 1});

    const searchInput = type === "text"  ? value : searchTerm;
    const checkboxFilters = type === "checkbox" ? checked ?  activeFilters.concat(name) :  activeFilters.filter(filter => filter !== name) : activeFilters;
    
    
    const typeFilteredData = checkboxFilters.length ? rawData.filter( data => checkboxFilters.includes(data.type) ) : rawData;
  

    const searchFilteredData = searchInput.length ? typeFilteredData.filter(data => (
      data.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      data.icao.toLowerCase().includes(searchInput.toLowerCase()) ||
      (data.iata && data.iata.toLowerCase().includes(searchInput.toLowerCase())) ||
      (data.city && data.city.toLowerCase().includes(searchInput.toLowerCase())) ||
      String(data.latitude).includes(searchInput.toLowerCase()) ||
      String(data.longitude).includes(searchInput.toLowerCase()) ||
      data.country.toLowerCase().includes(searchInput.toLowerCase())
    )) : typeFilteredData;

    this.setState({
      activeFilters: checkboxFilters,
      displayData: searchFilteredData,
      searchTerm: searchInput
    }, () => {
      window.localStorage.setItem("checkboxFilters", JSON.stringify(checkboxFilters));
      window.localStorage.setItem("searchInput", searchInput);
      window.localStorage.setItem("displayData", JSON.stringify(searchFilteredData));
    })
  }
  handleNavigation = (action) => {
    const {displayData, currentPage} = this.state;
    if(action === "prev" && currentPage > 1) {
      this.setState({ currentPage: this.state.currentPage - 1 })
    } else if(action === "next" && displayData.length / 4 > currentPage ) {
      this.setState({ currentPage: this.state.currentPage + 1 });
    }
  }


  render() {
    const {searchTerm, activeFilters, currentPage, displayData} = this.state;
    return (
      <div className="App">
        <Header />
        <Filter onChange={this.handleChange} searchTerm={searchTerm} activeFilters={activeFilters} />
        <AirportList displayData={displayData} currentPage={currentPage}  handleClick={this.handleClick}/>
        <Pagination  displayData={displayData} handleClick={this.handleNavigation} currentPage={currentPage} />
      </div>
    );
  }
}

export default App;
