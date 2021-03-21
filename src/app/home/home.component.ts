import { Component, OnInit } from '@angular/core';
import { NearByPlacesService } from '../services/getNearByPlaces.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  showSpinner: boolean = true;

  constructor(public nearByPlacesService: NearByPlacesService) {}

  ngOnInit(): void {
    this.nearByPlacesService.places$.subscribe((data) => {
      if (data) {
        this.showSpinner = false;
      }
    });
  }
}
