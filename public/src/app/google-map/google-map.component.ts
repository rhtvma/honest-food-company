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
import {toStringXY} from 'ol/coordinate';
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
        this.address = 'Stumpergasse 51, 1060 Vienna';
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
                        this._toastr.success(`Request Successful`, `${this.coordinates.length} Co-ordinates found`);
                    } else {
                        this.convertCoordinates([]);
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
    }

    ngOnDestroy() {
    };

    renderOLMap() {
        this.geojsonObject = {
            'type': 'FeatureCollection',
            'crs': {
                'type': 'name',
                'properties': {
                    'name': 'EPSG:3857',
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
        if (!this.map) {
            this.map = new Map({
                layers: [
                    new TileLayer({
                        source: new OSM()
                    }),
                    this.layer],
                target: 'map',
                view: view
            });
        } else {
            let l = this.map.getLayers().getArray()[1];
            l.setSource(this.source);
        }
    }

    convertCoordinates(data) {
        if (data.length > 0) {
            const center = data[0];
            this.center = fromLonLat([parseFloat(center[0]), parseFloat(center[1])]);
            this.coordinates = data.map((val) => {
                return fromLonLat([parseFloat(val[0]), parseFloat(val[1])]);
            });
        } else {
            this.center = fromLonLat([16.3156304, 48.1712003]);
            this.coordinates = [];
        }

        this.renderOLMap();
    }
}
