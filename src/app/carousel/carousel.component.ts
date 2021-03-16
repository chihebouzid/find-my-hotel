import { Component, OnInit } from '@angular/core';

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
  isHeadOfList: boolean = false;

  constructor() {}

  ngOnInit(): void {}

  moveCarousel(direction: number) {
    if (direction === 1 && !this.isEndOfList) {
      this.currentOffset -= this.paginationFactor;
    } else if (direction === -1 && !this.isHeadOfList) {
      this.currentOffset += this.paginationFactor;
    }
    this.isEndOfList = this.atEndOfList();
    this.isHeadOfList = this.atHeadOfList();

    console.log(this.currentOffset);
  }

  atEndOfList() {
    return (
      this.currentOffset <= this.paginationFactor * -1 * (2 - this.carouselSize)
    );
  }

  atHeadOfList() {
    return this.currentOffset === this.paginationFactor;
  }
}
