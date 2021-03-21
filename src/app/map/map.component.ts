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
  setCurrentLocation() {
    // Create an Observable that will start listening to geolocation updates
    // when a consumer subscribes.
    const locations = new Observable((observer) => {
      // geolocation API check provides values to publish
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
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
        icon:
          'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cu%0AdzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdC%0Ab3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSI+CjxjaXJjbGUgY3g9IjE2IiBj%0AeT0iMTYiIHI9IjE2IiBmaWxsPSIjRThBNzQ2Ii8+CjxjaXJjbGUgY3g9IjE2%0AIiBjeT0iMTYiIHI9IjE2IiBmaWxsPSIjQkJDMkI5Ii8+CjxnIGNsaXAtcGF0%0AaD0idXJsKCNjbGlwMCkiPgo8cGF0aCBkPSJNMjAuNjY5NSAxNS40OTczTDE5%0ALjM2MzcgMTQuMTkxNUMxOS4zNTQgMTQuMTgxOCAxOS4zNDY0IDE0LjE3MDMg%0AMTkuMzQxMSAxNC4xNTc3QzE5LjMzNTkgMTQuMTQ1IDE5LjMzMzIgMTQuMTMx%0ANCAxOS4zMzMzIDE0LjExNzhWMTEuNjI1M0MxOS4zMzMzIDExLjUxNDcgMTku%0AMjg5NCAxMS40MDg4IDE5LjIxMTMgMTEuMzMwNkMxOS4xMzMxIDExLjI1MjUg%0AMTkuMDI3MSAxMS4yMDg2IDE4LjkxNjYgMTEuMjA4NkgxNy42NjY2QzE3LjU1%0ANjEgMTEuMjA4NiAxNy40NTAxIDExLjI1MjUgMTcuMzcyIDExLjMzMDZDMTcu%0AMjkzOSAxMS40MDg4IDE3LjI1IDExLjUxNDcgMTcuMjUgMTEuNjI1M1YxMS44%0AMjYxQzE3LjI1IDExLjg0NjcgMTcuMjQzOSAxMS44NjY5IDE3LjIzMjUgMTEu%0AODg0MUMxNy4yMjEgMTEuOTAxMiAxNy4yMDQ3IDExLjkxNDYgMTcuMTg1NyAx%0AMS45MjI1QzE3LjE2NjYgMTEuOTMwNCAxNy4xNDU3IDExLjkzMjUgMTcuMTI1%0ANCAxMS45Mjg0QzE3LjEwNTIgMTEuOTI0NCAxNy4wODY2IDExLjkxNDQgMTcu%0AMDcyIDExLjg5OThMMTYuMDg2MiAxMC45MTRDMTYuMDA4MSAxMC44MzU5IDE1%0ALjkwMjEgMTAuNzkyIDE1Ljc5MTYgMTAuNzkyQzE1LjY4MTEgMTAuNzkyIDE1%0ALjU3NTIgMTAuODM1OSAxNS40OTcgMTAuOTE0TDEwLjkxMzcgMTUuNDk3M0Mx%0AMC44NTU1IDE1LjU1NTYgMTAuODE1OCAxNS42Mjk4IDEwLjc5OTcgMTUuNzEw%0AN0MxMC43ODM2IDE1Ljc5MTUgMTAuNzkxOSAxNS44NzUyIDEwLjgyMzQgMTUu%0AOTUxNEMxMC44NTUgMTYuMDI3NSAxMC45MDg0IDE2LjA5MjYgMTAuOTc2OSAx%0ANi4xMzgzQzExLjA0NTQgMTYuMTg0MSAxMS4xMjU5IDE2LjIwODYgMTEuMjA4%0AMyAxNi4yMDg2SDExLjcyOTFDMTEuNzU2OCAxNi4yMDg2IDExLjc4MzMgMTYu%0AMjE5NiAxMS44MDI4IDE2LjIzOTFDMTEuODIyMyAxNi4yNTg2IDExLjgzMzMg%0AMTYuMjg1MSAxMS44MzMzIDE2LjMxMjhWMjAuMzc1M0MxMS44MzMzIDIwLjQ4%0ANTggMTEuODc3MiAyMC41OTE3IDExLjk1NTMgMjAuNjY5OUMxMi4wMzM1IDIw%0ALjc0OCAxMi4xMzk1IDIwLjc5MTkgMTIuMjUgMjAuNzkxOUgxNC42NDU4QzE0%0ALjY3MzQgMjAuNzkxOSAxNC42OTk5IDIwLjc4MDkgMTQuNzE5NSAyMC43NjE0%0AQzE0LjczOSAyMC43NDE5IDE0Ljc1IDIwLjcxNTQgMTQuNzUgMjAuNjg3OFYx%0AOC43MDg2QzE0Ljc1IDE4LjQzMjMgMTQuODU5NyAxOC4xNjc0IDE1LjA1NTEg%0AMTcuOTcyQzE1LjI1MDQgMTcuNzc2NyAxNS41MTU0IDE3LjY2NjkgMTUuNzkx%0ANiAxNy42NjY5QzE2LjA2NzkgMTcuNjY2OSAxNi4zMzI4IDE3Ljc3NjcgMTYu%0ANTI4MiAxNy45NzJDMTYuNzIzNSAxOC4xNjc0IDE2LjgzMzMgMTguNDMyMyAx%0ANi44MzMzIDE4LjcwODZWMjAuNjg3OEMxNi44MzMzIDIwLjcxNTQgMTYuODQ0%0AMyAyMC43NDE5IDE2Ljg2MzggMjAuNzYxNEMxNi44ODMzIDIwLjc4MDkgMTYu%0AOTA5OCAyMC43OTE5IDE2LjkzNzUgMjAuNzkxOUgxOS4zMzMzQzE5LjQ0Mzgg%0AMjAuNzkxOSAxOS41NDk4IDIwLjc0OCAxOS42Mjc5IDIwLjY2OTlDMTkuNzA2%0AMSAyMC41OTE3IDE5Ljc1IDIwLjQ4NTggMTkuNzUgMjAuMzc1M1YxNi4zMTI4%0AQzE5Ljc1IDE2LjI4NTEgMTkuNzYwOSAxNi4yNTg2IDE5Ljc4MDUgMTYuMjM5%0AMUMxOS44IDE2LjIxOTYgMTkuODI2NSAxNi4yMDg2IDE5Ljg1NDEgMTYuMjA4%0ANkgyMC4zNzVDMjAuNDU3NCAxNi4yMDg2IDIwLjUzNzkgMTYuMTg0MSAyMC42%0AMDY0IDE2LjEzODNDMjAuNjc0OSAxNi4wOTI2IDIwLjcyODMgMTYuMDI3NSAy%0AMC43NTk4IDE1Ljk1MTRDMjAuNzkxNCAxNS44NzUyIDIwLjc5OTYgMTUuNzkx%0ANSAyMC43ODM1IDE1LjcxMDdDMjAuNzY3NSAxNS42Mjk4IDIwLjcyNzggMTUu%0ANTU1NiAyMC42Njk1IDE1LjQ5NzNaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c+Cjxk%0AZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwIj4KPHJlY3QgeD0iMTEiIHk9IjEx%0AIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IndoaXRlIi8+CjwvY2xp%0AcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==',
      };

      this.nearByMarkers.push(nearByMarker);
    });
  }
}
