import { Component, OnInit } from '@angular/core';

import * as moment from 'moment';
import { WeatherStation } from '../weatherStation';
import { WeatherService } from '../weather.service';
// import * as ol from '../../../node_modules/ol';
import OSM from 'ol/source/OSM';
import OlMap from 'ol/Map';
import OlFeature from 'ol/Feature';
import OlPoint from 'ol/geom/Point';
import OlXYZ from 'ol/source/XYZ';
import OlTileLayer from 'ol/layer/Tile';
import OlView from 'ol/View';
import { fromLonLat } from 'ol/proj';
import { transform } from 'ol/proj';
import { Vector } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import VectorSource from 'ol/source/Vector';

export interface Forecast {
  day: any;
  visibility: number;
  clouds: number;
  likelihood: number;
}

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {

  days: any[]; // moment array
  stations: any = ['Inari', 'Ranua', 'Rovaniemi', 'Vantaa']
  selectedStation: WeatherStation;
  data = []
  timestamps = []
  forecast: Forecast[] = []

  map: OlMap;
  source: OlXYZ;
  layer: OlTileLayer;
  view: OlView;

  inariLayer;
  ranuaLayer;
  rovaniemiLayer;
  vantaaLayer;

  constructor(private weatherService: WeatherService) { }

  ngOnInit() {
    this.calculateDays()
    this.getStations()
    this.createLayers()
    this.createMap()
  }

  ngAfterViewInit() {
    this.map.setTarget('map');
  }

  calculateDays() {
    var tomorrow = moment(new Date()).add(1, 'days')
    var second = moment(new Date()).add(2, 'days')
    var third = moment(new Date()).add(3, 'days')
    var fourth = moment(new Date()).add(4, 'days')

    this.days = [tomorrow, second, third, fourth]
    this.forecast = []
    this.days.forEach(day => {
      var forecastObj: Forecast = { day: day, visibility: 0, clouds: 0, likelihood: 0 };
      this.forecast.push(forecastObj)
    })
  }

  // creates WeatherStation objects, that can be selected and shown on a map(lat/lon)
  // could also be done be JSON or csvimport, but that didn't work in the first placeso this is planB
  getStations() {
    this.stations = [];
    var station = new WeatherStation()
    station.city = "Inari"
    station.name = "Inari Nellim"
    station.latitude = 68.85
    station.longitude = 28.30
    this.stations.push(station)

    //set default selection
    this.selectedStation = station;
    this.onCitySelection()

    station = new WeatherStation()
    station.city = "Ranua"
    station.name = "Ranua lentokentta"
    station.latitude = 65.98
    station.longitude = 26.37
    this.stations.push(station)

    station = new WeatherStation()
    station.city = "Rovaniemi"
    station.name = "Rovaniemi Lentoasema"
    station.latitude = 66.56
    station.longitude = 25.84
    this.stations.push(station)

    var station = new WeatherStation()
    station.city = "Vantaa"
    station.name = "Vantaa Lentoasema"
    station.latitude = 60.31
    station.longitude = 24.97
    this.stations.push(station)
  }

  onCitySelection() {
    // console.log("selection changed to ")
    // console.log(this.selectedStation.city);

    this.weatherService.getPredictionForStation(this.selectedStation.name).subscribe((weather) => {
      console.log("got weather data");
      // console.log(weather.entries);

      var today = moment()
      var month = today.month()
      var day = today.date()
      var tomorrow = moment().add(1, 'days')

      this.data = []
      this.timestamps = []

      weather.entries.forEach(entry => {
        var currentTime = moment().hour()
        if (entry["Month"] == month && entry["Day"] == day && entry["Time"] >= currentTime) {
          //hopefully the days are sorted
          // console.log("added today's entry", entry)
          this.data.push(entry[this.selectedStation.name + " Proba"] * 100) // Likelihood
          var date = moment("2019-" + (month + 1) + "-" + day + " " + entry["Time"], "YYYY-MM-DD HH:mm")
          // console.log("todays date", date)
          this.timestamps.push(date) // timestamp of the measurement
        }
        if (entry["Month"] == tomorrow.month() && entry["Day"] == tomorrow.date() && entry["Time"] < currentTime) {
          // console.log("added tomorrow's entry", entry)
          this.data.push(entry[this.selectedStation.name + " Proba"] * 100) // Likelihood
          var date = moment("2019-" + (tomorrow.month() + 1) + "-" + tomorrow.date() + " " + entry["Time"], "YYYY-MM-DD HH:mm")
          // console.log("tomorrows date", date)
          this.timestamps.push(date) // timestamp of the measurement
        }

      });

      // console.log("retrieved k idices for " + day + "." + month + ": ", this.data, this.timestamps)
      this.fillForecast(weather.entries)

      this.view = new OlView({
        center: fromLonLat([this.selectedStation.longitude, this.selectedStation.latitude]),
        zoom: 6
      });

      this.map.setView(this.view);

      // remove existing layers
      this.map.removeLayer(this.inariLayer)
      this.map.removeLayer(this.ranuaLayer)
      this.map.removeLayer(this.rovaniemiLayer)
      this.map.removeLayer(this.vantaaLayer)

      // add only according layer to map
      if (this.selectedStation.city == "Inari")
        this.map.addLayer(this.inariLayer)
      if (this.selectedStation.city == "Ranua")
        this.map.addLayer(this.ranuaLayer)
      if (this.selectedStation.city == "Rovaniemi")
        this.map.addLayer(this.rovaniemiLayer)
      if (this.selectedStation.city == "Vantaa")
        this.map.addLayer(this.vantaaLayer)

    });
  }

  // gets the values for the forecast cards
  fillForecast(weatherData) {
    this.forecast.forEach(element => {
      var test = element;
      // console.log('forecast element before: ', test)

      // calculate mean over 3-hourly predictions
      // store values in array to calc the mean
      var visibility = []
      var clouds = []
      var likelihood = []

      var station = this.selectedStation.name

      weatherData.forEach(entry => {

        if (entry["Month"] == (element.day.month() + 1) && entry["Day"] == element.day.date()) {

          var visEntry = station + "_Horizontal visibility (m)"
          // console.log(visEntry)
          // console.log(entry[visEntry])

          var cloudEntry = station + "_Cloud amount (1/8)"
          // console.log(cloudEntry)
          // console.log(entry[cloudEntry])

          var likelihoodEntry = station + " Proba"
          // console.log(likelihoodEntry)
          // console.log(entry[likelihoodEntry])          

          visibility.push(entry[visEntry])
          clouds.push(entry[cloudEntry])
          likelihood.push(Math.round(entry[likelihoodEntry] * 100))
        }
      });

      // console.log("extracted values", clouds, visibility, likelihood)

      element.clouds = clouds.reduce((a, b) => { return a + b }) / clouds.length
      element.visibility = visibility.reduce((a, b) => { return a + b }) / visibility.length
      element.likelihood = likelihood.reduce((a, b) => { return a + b }) / likelihood.length

      element.visibility = parseFloat((Math.round(element.visibility) / 1000.0).toFixed(2)) // round two two digits
      element.likelihood = parseFloat(element.likelihood.toFixed(2)) // round to two digits

      // console.log("forecast element with values", element)
    })
  }

  createMap() {

    this.source = new OlXYZ({
      url: 'http://tile.osm.org/{z}/{x}/{y}.png'
    });

    this.layer = new OlTileLayer({
      source: this.source
    });


    var latitudeHelsinki = 60;
    var longitudeHelsinki = 25;

    this.view = new OlView({
      center: fromLonLat([longitudeHelsinki, latitudeHelsinki]),
      zoom: 6
    });

    this.map = new OlMap({
      target: 'map',
      layers: [this.layer],
      view: this.view
    });


    // map on click event - TODO: addon, click and select closest watherstation
    this.map.on('click', function (args) {
      // console.log("map on click", args.coordinate);
      var lonlat = transform(args.coordinate, 'EPSG:3857', 'EPSG:4326')
      // var lonlat = ol.proj.transform(args.coordinate, 'EPSG:3857', 'EPSG:4326');
      // console.log(lonlat);

      var lon = lonlat[0];
      var lat = lonlat[1];
      console.log("clicked on (lat, lon): ", lat, lon)
      // alert(`lat: ${lat} long: ${lon}`);
    });
  }

  createLayers() {
    // markers
    var inariMarker = new OlFeature({
      type: 'icon',
      geometry: new OlPoint(fromLonLat([this.stations[0].longitude, this.stations[0].latitude]))
    });
    var ranuaMarker = new OlFeature({
      type: 'icon',
      geometry: new OlPoint(fromLonLat([this.stations[1].longitude, this.stations[1].latitude]))
    });
    var rovaniemiMarker = new OlFeature({
      type: 'icon',
      geometry: new OlPoint(fromLonLat([this.stations[2].longitude, this.stations[2].latitude]))
    });
    var vantaaMarker = new OlFeature({
      type: 'icon',
      geometry: new OlPoint(fromLonLat([this.stations[3].longitude, this.stations[3].latitude]))
    });

    var styles = {
      'icon': new Style({
        image: new Icon({
          // color: '#000000',
          crossOrigin: 'anonymous',
          src: '../../assets/locationPinSmall.png',//"https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg"
        })
      })
    }

    // layer
    this.inariLayer = new VectorLayer({
      source: new VectorSource({
        features: [inariMarker]
      }),
      style: function (feature) {
        return styles[feature.get('type')];
      }
    });
    this.ranuaLayer = new VectorLayer({
      source: new VectorSource({
        features: [ranuaMarker]
      }),
      style: function (feature) {
        return styles[feature.get('type')];
      }
    });
    this.rovaniemiLayer = new VectorLayer({
      source: new VectorSource({
        features: [rovaniemiMarker]
      }),
      style: function (feature) {
        return styles[feature.get('type')];
      }
    });
    this.vantaaLayer = new VectorLayer({
      source: new VectorSource({
        features: [vantaaMarker]
      }),
      style: function (feature) {
        return styles[feature.get('type')];
      }
    });

  }
}
