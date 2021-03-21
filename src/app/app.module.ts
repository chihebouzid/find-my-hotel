import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';

import { CardComponent } from './card/card.component';
import { CarouselComponent } from './carousel/carousel.component';
import { HeaderComponent } from './header/header.component';
import { HeaderMenuComponent } from './header-menu/header-menu.component';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { HomeComponent } from './home/home.component';

import { AgmCoreModule } from '@agm/core';
import { NearByPlacesService } from './services/getNearByPlaces.service';
import { SpinnerComponent } from './spinner/spinner.component';
import { GOOGLE_API_KEY } from 'constants';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    CardComponent,
    CarouselComponent,
    HeaderComponent,
    HeaderMenuComponent,
    BookingFormComponent,
    HomeComponent,
    SpinnerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: GOOGLE_API_KEY,
      libraries: ['places'],
    }),
  ],
  providers: [NearByPlacesService],
  bootstrap: [AppComponent],
})
export class AppModule {}
