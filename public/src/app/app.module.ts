import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core'
import {HashLocationStrategy, LocationStrategy, CommonModule} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {AppComponent} from './app.component';
import {RouterModule, Routes} from "@angular/router";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ToastrModule} from 'ngx-toastr';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule} from '@angular/forms';
import {HttpService} from "./shared/http.service";

const routes: Routes = [
    {
        path: '',
        redirectTo: '/google-map',
        pathMatch: 'full'
    }, {
        path: 'google-map',
        loadChildren: './google-map/google-map.module#GoogleMapModule'
    }
];

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        CommonModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot({
            timeOut: 910000
        }),
        HttpClientModule,
        FormsModule,
        BrowserModule,
        NgbModule,
        RouterModule.forRoot(routes),
    ],
    providers: [HttpService, {
        provide: LocationStrategy,
        useClass: HashLocationStrategy
    }],
    bootstrap: [AppComponent]
})
export class AppModule {
}
