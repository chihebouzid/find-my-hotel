import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NearByPlacesService {
  places$ = new BehaviorSubject<any>(null);
}
