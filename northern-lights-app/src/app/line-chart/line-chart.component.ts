import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit {

  // @ViewChild('canvas', {static: false}) canvasRef: ElementRef;

  constructor() { }

  weatherDates: Date[] = [
    new Date("September 14 2019 12:30"),
    new Date("September 14 2019 18:30"),
    new Date("September 15 2019 00:30"),
    new Date("September 15 2019 06:30")];

  weatherLabels = [];

  chart: any;
  
  temp_max = [13, 15, 11, 10]
  temp_min = [9, 12, 9, 7]

  ngOnInit() {
    //let htmlRef = this.elementRef.nativeElement.querySelector(`#canvas`);
    //var ctx = this.canvasRef.nativeElement.getContext('2d');

    this.weatherLabels = this.weatherDates.map(date => date.toLocaleDateString())
    console.log('Chart is about to be created')
    this.chart = new Chart('canvas', {
      type: 'line',
      data: {
        labels: this.weatherLabels,
        datasets: [
          {
            data: this.temp_max,
            borderColor: "#3cba9f",
            fill: false
          },
          {
            data: this.temp_min,
            borderColor: "#ffcc00",
            fill: false
          },
        ]
      },
      options: {
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            display: true
          }],
          yAxes: [{
            display: true
          }],
        }
      }
    });
    this.chart.canvas.parentNode.style.height = '500px';
    this.chart.canvas.parentNode.style.width = '500px';
  }

}
