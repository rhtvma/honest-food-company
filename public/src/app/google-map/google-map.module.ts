import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {GoogleMapComponent} from './google-map.component';
import {AgmCoreModule} from '@agm/core'
import { FormsModule } from '@angular/forms';

const routes: Routes = [
    {
        path: '',
        component: GoogleMapComponent,
        children: []
    }, {
        path: 'google-map',
        component: GoogleMapComponent,
        children: []
    }
];

@NgModule({
    imports: [
        CommonModule, FormsModule,
        RouterModule.forChild(routes),
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyBMU1CIgYL3wBwMBjE_rcATHvNs4pZAab0'
        })
    ],
    declarations: [GoogleMapComponent]
})
export class GoogleMapModule {
}


//https://angular-maps.com/guides/getting-started/