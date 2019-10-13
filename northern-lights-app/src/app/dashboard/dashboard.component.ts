import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../weather.service';
import { Weather } from '../weather';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  data: any;

  constructor(private weatherService: WeatherService) {
    this.weatherService.getHostoricalData().subscribe((weather)=>{
      console.log("got weather data");
      console.log(weather);
      this.data = weather;
    });
  }

  ngOnInit() {}

}
