import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private weatherURL = 'http://localhost:3000';  // URL to web api

  constructor(private http: HttpClient) { }

  getHostoricalData() {
    console.log('weather service called')
    return this.http.get<any>(this.weatherURL + '/data')
  }

  getPredictionForStation(stationName:string){
    let params = new HttpParams();
    params = params.append('city', stationName);
    return this.http.get<any>(this.weatherURL + '/data/city/', {params:params})
  }

  getWeatherFromYear(year:number){
    let params = new HttpParams();
    params = params.append('year', year+"");
    return this.http.get<any>(this.weatherURL + '/data/year/', {params:params})
  }
}
