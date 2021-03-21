import { Component, OnInit } from '@angular/core';
import { Countries } from '../utils/countries';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.scss'],
})
export class BookingFormComponent implements OnInit {
  countries: any = Countries;
  formSubmitted: boolean = false;

  constructor() {}

  ngOnInit(): void {}

  submitForm() {
    this.formSubmitted = true;
  }
}
