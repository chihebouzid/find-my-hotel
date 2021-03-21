import { MapsAPILoader } from '@agm/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { NearByPlacesService } from '../services/getNearByPlaces.service';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  latitude: number = 0;
  longitude: number = 0;
  zoom: number = 12;
  @ViewChild('map') public mapElementRef: any;
  map: any;
  nearByResults: Array<any> = [];
  nearByMarkers: Array<any> = [];

  constructor(
    private mapsAPILoader: MapsAPILoader,
    public nearByPlacesService: NearByPlacesService
  ) {}

  // wait for map to load than get the user's current location
  ngOnInit() {
    this.mapsAPILoader.load().then(() => {
      this.map = new google.maps.Map(this.mapElementRef);
      this.setCurrentLocation();
    });
  }

  // Perform a Places Nearby Search Request
  // TODO: Handle the case of error
  getNearPlaces(position: any) {
    // check if there is data in local storage and use it instead of making another request
    let results = JSON.parse(localStorage.getItem('results'));
    if (results) {
      this.processFromLocalStorage(results);
      return;
    }

    let request = {
      location: position,
      rankBy: google.maps.places.RankBy.DISTANCE,
      keyword: 'hotel',
    };
    let service = new google.maps.places.PlacesService(this.map);

    service.nearbySearch(request, this.nearbyCallback.bind(this));
  }

  // Handle the results (up to 20) of the Nearby Search
  // TODO: Handle the case of error
  nearbyCallback(results: any, status: any) {
    const callBackResults = new Observable((observer) => {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        observer.next(results);
      } else {
        observer.error('Cant get Nearby Search results');
      }
    });

    callBackResults.subscribe((results: any) => {
      this.nearByResults = results;
      this.nearByPlacesService.places$.next(results);
      this.createMarkers(results);
      this.storeSearchResults(results);
    });
  }

  storeSearchResults(results: any) {
    localStorage.setItem('results', JSON.stringify(results));
  }

  processFromLocalStorage(results: any) {
    console.info('Getting data from local storage');
    this.nearByResults = results;
    this.createMarkers(results);
    this.nearByPlacesService.places$.next(results);
  }

  // Get Current Location Coordinates
  private setCurrentLocation() {
    // Create an Observable that will start listening to geolocation updates
    // when a consumer subscribes.
    const locations = new Observable((observer) => {
      let watchId: number;

      // geolocation API check provides values to publish
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position: any) => {
            observer.next(position);
          },
          (error: any) => {
            observer.error(error);
          }
        );
      } else {
        observer.error('Geolocation not available');
      }

      // When the consumer unsubscribes, clean up data ready for next subscription.
      return {
        unsubscribe() {
          navigator.geolocation.clearWatch(watchId);
        },
      };
    });

    // start listening for updates.
    const locationsSubscription = locations.subscribe((position: any) => {
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;
      let pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      this.getNearPlaces(pos);
    });

    // Stop listening for location after 10 seconds
    setTimeout(() => {
      locationsSubscription.unsubscribe();
    }, 10000);
  }

  // TODO: Handle the case of error
  createMarkers(places: any) {
    places.forEach((place: { geometry: { location: any }; name: any }) => {
      let marker = new google.maps.Marker({
        position: place.geometry.location,
        map: this.map,
        title: place.name,
      });

      let nearByMarker = {
        lat: marker.getPosition()?.lat(),
        lng: marker.getPosition()?.lng(),
        icon: '../../assets/home-icon.svg',
      };

      this.nearByMarkers.push(nearByMarker);
    });
  }
}
