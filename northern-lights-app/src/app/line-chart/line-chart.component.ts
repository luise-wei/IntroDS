import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { Chart } from 'chart.js';
import { Weather } from '../weather';
import * as moment from 'moment';


@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit {

  private _data = []
  private _labels = []
  // private maximum = 0;

  @Input() set data(incomingData: any) {
    var workingData = incomingData;
    if (workingData === undefined || workingData.length === 0) {
      return;
    }
    this._data = workingData;
    // calculate maximun
    // this.maximum = this._data.reduce((a, b) => a > b ? a : b)

    this.updateChart();
  }

  @Input() set labels(incomingData: any) {
    var label = incomingData;
    if (label != undefined && label.length != 0) {
      this._labels = incomingData
      setTimeout(() => this.updateChart(), 1000)
    }
  }
  // @ViewChild('canvas', {static: false}) canvasRef: ElementRef;

  constructor() { }

  // weatherLabels = [];

  chart: any; //= new Chart();

  temperature = [];
  temp_max = [13, 15, 11, 10];
  temp_min = [9, 12, 9, 7];

  ngOnInit() {
    //let htmlRef = this.elementRef.nativeElement.querySelector(`#canvas`);
    //var ctx = this.canvasRef.nativeElement.getContext('2d');

    // this.weatherLabels = this.weatherDates.map(date => date.toLocaleDateString())
    this.chart = new Chart('canvas', {
      type: 'line',
      data: {
        labels: this.labels,
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
            display: true,
            type: 'time',
            time: {
              unit: 'day'
            },
            scaleLabel: {
              labelString: "Next 24 hours",
              display: true
            },
            // ticks: {
              // Include a dollar sign in the ticks
              // callback: function (value, index, values) {
              //   return value.format("DD.MM. LT");
              // }
            // }
          }],
          yAxes: [{
            display: true,
            ticks: {
              min: 0,
              max: 100,
              stepSize: 25
            },
            scaleLabel: {
              labelString: "Likelihood in %",
              display: true
            }
          }],
        }
      }
    });
    // this.chart.canvas.parentNode.style.height = '300px';
    // this.chart.canvas.parentNode.style.width = '600px';
  }

  updateChart() {
    console.log("data", this._data, "labels", this._labels)

    this.chart.data.labels = this._labels;
    this.chart.data.datasets = [{
      data: this._data,
      borderColor: "#3cba9f",
      fill: false
    }];
    this.chart.update();
  }

}
