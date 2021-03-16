import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  zoom = 15;
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  marker: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  options: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: false,
    disableDefaultUI: true,
  };

  ngOnInit() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      this.marker = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    });
  }
}
