import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {HttpService} from "../shared/http.service";
import {Subject} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {ActivatedRoute, Router} from '@angular/router';

import OlMap from 'ol/Map';
import OlXYZ from 'ol/source/XYZ';
import OlTileLayer from 'ol/layer/Tile';
import OlView from 'ol/View';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import MultiPoint from 'ol/geom/MultiPoint.js';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';
import Geolocation from 'ol/Geolocation.js';
import Point from 'ol/geom/Point.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';

import {fromLonLat} from 'ol/proj';
@Component({
    selector: 'app-google-map',
    templateUrl: './google-map.component.html',
    styleUrls: ['./google-map.component.css'],
    providers: [HttpService]
})
export class GoogleMapComponent implements OnInit, AfterViewInit {
    address: any = {};
    coordinates: Array<any> = [];
    orgCoordinates: Array<any> = [];
    center: Array<any> = [];
    geojsonObject: any;

    map: OlMap;
    source: OlXYZ;
    layer: OlTileLayer;
    view: OlView;
    styles = [
        new Style({
            stroke: new Stroke({
                color: 'blue',
                width: 3
            }),
            fill: new Fill({
                color: 'rgba(0, 0, 255, 0.1)'
            })
        }),
        new Style({
            image: new CircleStyle({
                radius: 5,
                fill: new Fill({
                    color: 'orange'
                })
            }),
            geometry: (feature) => {
                let coordinates = feature.getGeometry().getCoordinates()[0];
                return new MultiPoint(coordinates);
            }
        })
    ];

    constructor(private _httpService: HttpService,
                private _toastr: ToastrService) {
    }

    ngOnInit() {
        this.address = '';
        // this.renderOLMap();
    }

    getDeliveryAreas() {
        if (!this.address) {
            return this._toastr.error(`Please enter address`);
        }
        this._httpService.get(`/api/getDeliveryAreas/${this.address}`)
            .subscribe(
                (result: { data: Array<any>, message: any, status: number }) => {
                    if (result.status === 1) {
                        this.orgCoordinates = result.data;
                        this.convertCoordinates(result.data);
                        // this.coordinates = [[-5e6, 6e6], [-5e6, 8e6], [-3e6, 8e6],  [-3e6, 6e6], [-5e6, 6e6]];
                        this._toastr.success(`Request Successful`, `${this.coordinates.length} Co-ordinates found`);

                    } else {
                        this._toastr.error(`${result.message}`, `Nothing to process`);
                    }
                },
                (error) => {
                    console.log(error);
                    this._toastr.error(`Please contact admin`, `Server Error`);
                }
            );
    }

    ngAfterViewInit() {
        // this.map.setTarget('map');
    }

    ngOnDestroy() {
    };

    convertCoordinates(data) {
        debugger;
        this.center = fromLonLat(data[0]);
        this.coordinates = data.map((val) => {
            return fromLonLat(val);
        });
        this.renderOLMap();
    }

    renderOLMap() {
        // this.view = new OlView({
        //     center: fromLonLat([6.661594, 50.433237]),
        //     zoom: 30
        // });
        this.geojsonObject = {
            'type': 'FeatureCollection',
            'crs': {
                'type': 'name',
                'properties': {
                    'name': 'EPSG:3857'
                }
            },
            'features': [{
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [
                        this.coordinates
                    ]
                }
            }]
        };

        this.source = new VectorSource({
            features: (new GeoJSON()).readFeatures(this.geojsonObject)
        });

        this.layer = new VectorLayer({
            source: this.source,
            style: this.styles
        });

        let view = new View({
            center: this.center,
            zoom: 12
        });

        this.map = new Map({
            layers: [
                new TileLayer({
                    source: new OSM()
                }),
                this.layer],
            target: 'map',
            view: view
        });
    }
}


/*
 customPaths: Array<any> = [
 [16.377182, 48.186919],
 [16.3419914, 48.1805096],
 [16.3505745, 48.1690622],
 [16.3608742, 48.1508555],
 [16.408596, 48.1410052],
 [16.4446449, 48.1525734],
 [16.453743, 48.1778769],
 [16.4232625, 48.1880656],
 [16.386731, 48.177247],
 [16.385551, 48.179364],
 [16.384886, 48.184458],
 [16.377182, 48.186919]
 ]
 * */