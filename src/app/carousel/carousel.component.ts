import { Component, OnInit } from '@angular/core';
import { NearByPlacesService } from '../services/getNearByPlaces.service';
import { mockData } from '../utils/mock-data';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements OnInit {
  currentOffset: number = 0;
  carouselSize: number = 1;
  paginationFactor: number = 285;
  isEndOfList: boolean = false;
  isHeadOfList: boolean = true;
  myNearByPlaces: any;
  dynamicMarginLeft: number = 0;
  showNav: boolean = false;
  mockData = mockData;

  constructor(public nearByPlacesService: NearByPlacesService) {}

  ngOnInit(): void {
    // add margin left to carsoul cards countainer dynamicly depending on curren screen width
    this.dynamicMarginLeft =
      screen.width < 768
        ? screen.width / 2 - 140
        : screen.width - (screen.width - 100);

    this.nearByPlacesService.places$.subscribe((data) => {
      if (data) {
        this.myNearByPlaces = data.map((place: any) => {
          return this.convertToPlaceSchema(place);
        });
        this.showNav = true;
      }
    });
  }

  moveCarousel(direction: number) {
    if (direction === 1 && !this.isEndOfList) {
      this.currentOffset -= this.paginationFactor;
    } else if (direction === -1 && !this.isHeadOfList) {
      this.currentOffset += this.paginationFactor;
    }
    this.isEndOfList = this.atEndOfList();
    this.isHeadOfList = this.atHeadOfList();
  }

  atEndOfList() {
    return (
      this.currentOffset <=
      this.paginationFactor * -1 * (20 - this.carouselSize)
    );
  }

  atHeadOfList() {
    return this.currentOffset === 0;
  }

  convertToPlaceSchema(data: any) {
    let photos = data.photos[0].getUrl
      ? data.photos[0].getUrl()
      : 'https://q-xx.bstatic.com/images/hotel/max1024x768/282/282297641.jpg';
    let placeData = {
      name: data.name,
      photoUrl: photos,
    };
    return placeData;
  }
}
