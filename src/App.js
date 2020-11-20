import React, { useState, useEffect } from 'react';
import FormControl from '@material-ui/core/FormControl'
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import './App.css';
import "leaflet/dist/leaflet.css";

import InfoBox from './InfoBox'
import Map from './Map'
import Table from './Table'
import LineGraph from './LineGraph'
import { sortData, prettyPrintStat } from './util';

function App() {
  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState("worldwide")
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([])
  const [mapCenter, setMapCenter] = useState({ lat: 20, lng: 70 })
  const [mapZoom, setMapZoom] = useState(3)
  const [mapCountries, setMapCountries] = useState([])
  const [casesType, setCasesType] = useState("cases")

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then(res => res.json())
    .then(data => {
      setCountryInfo(data) 
    })
  }, [])

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((res) => res.json())
      .then((data) => {
        const countries = data.map((country) => (
          {
            name: country.country,
            value: country.countryInfo.iso2
          }
        ))

        const sortedData = sortData(data)
        setTableData(sortedData)
        setMapCountries(data)
        setCountries(countries)
      })
    }

    getCountriesData()
  }, [])

  const onCountryChange = async (event) => {
    const countryCode = event.target.value

    const url =
      countryCode === "worldwide" ? 
        "https://disease.sh/v3/covid-19/all" : 
        `https://disease.sh/v3/covid-19/countries/${countryCode}`
    
    await fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCountry(countryCode)
        setCountryInfo(data)
        if(countryCode === "worldwide"){
          setMapCenter({ lat: 20, lng: 70 })
        }
        else {
          setMapCenter({
            lat: data.countryInfo.lat,
            lng: data.countryInfo.long
          })
        }
        setMapZoom(4)
      })
  }

  return (
    <div className="app">

      <div className="app_left">
        <div className="app_header">
          <h1>COVID - 19 TRACKER</h1>
          <FormControl className="app_dropdown">
            <Select 
              variant="outlined" 
              value={country} 
              onChange={onCountryChange}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {
                countries.map(country => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>

        <div className="app_stats">
            <InfoBox 
              isRed
              active={casesType === "cases"}
              onClick = {e => setCasesType('cases')}
              title="Coronavirus Cases" 
              cases={prettyPrintStat(countryInfo.todayCases)} 
              total={prettyPrintStat(countryInfo.cases)} 
            />
            <InfoBox 
              active={casesType === "recovered"}
              onClick = {e => setCasesType('recovered')}
              title="Recovered" 
              cases={prettyPrintStat(countryInfo.todayRecovered)} 
              total={prettyPrintStat(countryInfo.recovered)} 
            />
            <InfoBox 
              isRed
              active={casesType === "deaths"}
              onClick = {e => setCasesType('deaths')}
              title="Deaths" 
              cases={prettyPrintStat(countryInfo.todayDeaths)} 
              total={prettyPrintStat(countryInfo.deaths)} 
            />
        </div>

        <Map 
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>

      <Card className="app_right">
        <CardContent>
            <h3>Live Cases by Country</h3>
            <Table countries={tableData} />
            <h3 className="app_graphTitle">Worldwide new {casesType}</h3>
            <LineGraph className="app_graph" casesType={casesType}/>
        </CardContent>
      </Card>

    </div>
  );
}

export default App;
