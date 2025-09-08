
declare namespace google.maps {
  class Map {
    constructor(mapDiv: Element, opts?: MapOptions);
    fitBounds(bounds: LatLngBounds, padding?: number | Padding): void;
    getZoom(): number | undefined;
    setZoom(zoom: number): void;
    getCenter(): LatLng;
    setCenter(center: LatLng | LatLngLiteral): void;
    addListener(eventName: string, handler: () => void): MapsEventListener;
  }
  
  interface Padding {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }
  
  class LatLng {
    constructor(lat: number, lng: number, noWrap?: boolean);
    lat(): number;
    lng(): number;
    equals(other: LatLng): boolean;
    toString(): string;
    toJSON(): LatLngLiteral;
  }
  
  interface LatLngLiteral {
    lat: number;
    lng: number;
  }
  
  class LatLngBounds {
    constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
    extend(point: LatLng | LatLngLiteral): LatLngBounds;
    contains(latLng: LatLng | LatLngLiteral): boolean;
    getCenter(): LatLng;
  }
  
  class Marker {
    constructor(opts?: MarkerOptions);
    setMap(map: Map | null): void;
    setPosition(position: LatLng | LatLngLiteral): void;
    setTitle(title: string): void;
    setLabel(label: string | MarkerLabel): void;
    addListener(eventName: string, handler: () => void): MapsEventListener;
    getPosition(): LatLng;
  }
  
  interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map?: Map;
    title?: string;
    label?: string | MarkerLabel;
    icon?: string | Icon | Symbol;
    animation?: Animation;
    draggable?: boolean;
    clickable?: boolean;
  }
  
  interface MarkerLabel {
    text: string;
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
  }
  
  interface Icon {
    url: string;
    size?: Size;
    origin?: Point;
    anchor?: Point;
    labelOrigin?: Point;
    scaledSize?: Size;
  }
  
  class Size {
    constructor(width: number, height: number);
    width: number;
    height: number;
    equals(other: Size): boolean;
    toString(): string;
  }
  
  class Point {
    constructor(x: number, y: number);
    x: number;
    y: number;
    equals(other: Point): boolean;
    toString(): string;
  }
  
  class Geocoder {
    geocode(request: GeocoderRequest, callback: (results: GeocoderResult[], status: GeocoderStatus) => void): void;
  }
  
  interface GeocoderRequest {
    address?: string;
    location?: LatLng | LatLngLiteral;
    placeId?: string;
    bounds?: LatLngBounds | LatLngBoundsLiteral;
    componentRestrictions?: GeocoderComponentRestrictions;
    region?: string;
  }
  
  interface GeocoderComponentRestrictions {
    country: string | string[];
    postalCode?: string;
    administrativeArea?: string;
    locality?: string;
  }
  
  interface GeocoderResult {
    geometry: {
      location: LatLng;
      location_type?: GeocoderLocationType;
      viewport?: LatLngBounds;
      bounds?: LatLngBounds;
    };
    address_components: GeocoderAddressComponent[];
    formatted_address: string;
    place_id: string;
    plus_code?: {
      compound_code: string;
      global_code: string;
    };
    types: string[];
  }
  
  interface GeocoderAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
  }
  
  type GeocoderLocationType = 'ROOFTOP' | 'RANGE_INTERPOLATED' | 'GEOMETRIC_CENTER' | 'APPROXIMATE';
  
  type GeocoderStatus = 'OK' | 'ZERO_RESULTS' | 'OVER_DAILY_LIMIT' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR';
  
  interface LatLngBoundsLiteral {
    east: number;
    north: number;
    south: number;
    west: number;
  }
  
  class DirectionsService {
    route(request: DirectionsRequest, callback: (results: DirectionsResult | null, status: DirectionsStatus) => void): void;
  }
  
  interface DirectionsRequest {
    origin: string | LatLng | LatLngLiteral | Place;
    destination: string | LatLng | LatLngLiteral | Place;
    travelMode: TravelMode;
    transitOptions?: TransitOptions;
    drivingOptions?: DrivingOptions;
    waypoints?: DirectionsWaypoint[];
    optimizeWaypoints?: boolean;
    provideRouteAlternatives?: boolean;
    avoidFerries?: boolean;
    avoidHighways?: boolean;
    avoidTolls?: boolean;
    region?: string;
    unitSystem?: UnitSystem;
  }
  
  interface Place {
    location: LatLng | LatLngLiteral;
    placeId: string;
    query: string;
  }
  
  interface DirectionsWaypoint {
    location: string | LatLng | LatLngLiteral | Place;
    stopover: boolean;
  }
  
  interface TransitOptions {
    arrivalTime?: Date;
    departureTime?: Date;
    modes?: TransitMode[];
    routingPreference?: TransitRoutePreference;
  }
  
  type TransitMode = 'BUS' | 'RAIL' | 'SUBWAY' | 'TRAIN' | 'TRAM';
  
  type TransitRoutePreference = 'FEWER_TRANSFERS' | 'LESS_WALKING';
  
  interface DrivingOptions {
    departureTime: Date;
    trafficModel?: TrafficModel;
  }
  
  type TrafficModel = 'BEST_GUESS' | 'PESSIMISTIC' | 'OPTIMISTIC';
  
  type UnitSystem = 0 | 1;
  
  type TravelMode = 'BICYCLING' | 'DRIVING' | 'TRANSIT' | 'WALKING';
  
  class DirectionsRenderer {
    constructor(opts?: DirectionsRendererOptions);
    setMap(map: Map | null): void;
    setPanel(panel: Element): void;
    setDirections(directions: DirectionsResult): void;
    setRouteIndex(routeIndex: number): void;
  }
  
  interface DirectionsRendererOptions {
    directions?: DirectionsResult;
    draggable?: boolean;
    hideRouteList?: boolean;
    infoWindow?: InfoWindow;
    map?: Map;
    markerOptions?: MarkerOptions;
    panel?: Element;
    polylineOptions?: PolylineOptions;
    preserveViewport?: boolean;
    routeIndex?: number;
    suppressBicyclingLayer?: boolean;
    suppressInfoWindows?: boolean;
    suppressMarkers?: boolean;
    suppressPolylines?: boolean;
  }
  
  interface PolylineOptions {
    clickable?: boolean;
    draggable?: boolean;
    editable?: boolean;
    geodesic?: boolean;
    icons?: Array<{
      icon: Symbol;
      offset: string;
      repeat: string;
    }>;
    path?: LatLng[] | LatLngLiteral[];
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    visible?: boolean;
    zIndex?: number;
  }
  
  interface DirectionsResult {
    available_travel_modes: TravelMode[];
    geocoded_waypoints: DirectionsGeocodedWaypoint[];
    routes: DirectionsRoute[];
  }
  
  interface DirectionsGeocodedWaypoint {
    geocoder_status: GeocoderStatus;
    place_id: string;
    types: string[];
  }
  
  interface DirectionsRoute {
    bounds: LatLngBounds;
    copyrights: string;
    fare?: DirectionsFare;
    legs: DirectionsLeg[];
    overview_path: LatLng[];
    overview_polyline: string;
    warnings: string[];
    waypoint_order: number[];
  }
  
  interface DirectionsFare {
    currency: string;
    text: string;
    value: number;
  }
  
  interface DirectionsLeg {
    arrival_time?: Time;
    departure_time?: Time;
    distance?: Distance;
    duration?: Duration;
    duration_in_traffic?: Duration;
    end_address: string;
    end_location: LatLng;
    start_address: string;
    start_location: LatLng;
    steps: DirectionsStep[];
    via_waypoints: LatLng[];
  }
  
  interface Time {
    text: string;
    time_zone: string;
    value: Date;
  }
  
  interface Distance {
    text: string;
    value: number;
  }
  
  interface Duration {
    text: string;
    value: number;
  }
  
  interface DirectionsStep {
    distance: Distance;
    duration: Duration;
    end_location: LatLng;
    instructions: string;
    path: LatLng[];
    start_location: LatLng;
    steps: DirectionsStep[];
    travel_mode: TravelMode;
  }
  
  type DirectionsStatus = 'OK' | 'ZERO_RESULTS' | 'MAX_WAYPOINTS_EXCEEDED' | 'MAX_ROUTE_LENGTH_EXCEEDED' | 'INVALID_REQUEST' | 'OVER_DAILY_LIMIT' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'UNKNOWN_ERROR';
  
  class InfoWindow {
    constructor(opts?: InfoWindowOptions);
    open(map?: Map, anchor?: MVCObject): void;
    close(): void;
    getContent(): string | Element;
    setContent(content: string | Element): void;
    getPosition(): LatLng;
    setPosition(position: LatLng | LatLngLiteral): void;
  }
  
  interface InfoWindowOptions {
    content?: string | Element;
    disableAutoPan?: boolean;
    maxWidth?: number;
    pixelOffset?: Size;
    position?: LatLng | LatLngLiteral;
    zIndex?: number;
  }
  
  class MVCObject {
    addListener(eventName: string, handler: (...args: any[]) => void): MapsEventListener;
    bindTo(key: string, target: MVCObject, targetKey?: string, noNotify?: boolean): void;
    get(key: string): any;
    notify(key: string): void;
    set(key: string, value: any): void;
    setValues(values: object): void;
    unbind(key: string): void;
    unbindAll(): void;
  }
  
  interface MapsEventListener {
    remove(): void;
  }
  
  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    clickableIcons?: boolean;
    disableDefaultUI?: boolean;
    disableDoubleClickZoom?: boolean;
    draggable?: boolean;
    draggableCursor?: string;
    draggingCursor?: string;
    fullscreenControl?: boolean;
    fullscreenControlOptions?: FullscreenControlOptions;
    gestureHandling?: 'cooperative' | 'greedy' | 'none' | 'auto';
    heading?: number;
    keyboardShortcuts?: boolean;
    mapTypeControl?: boolean;
    mapTypeControlOptions?: MapTypeControlOptions;
    mapTypeId?: string | MapTypeId;
    maxZoom?: number;
    minZoom?: number;
    noClear?: boolean;
    panControl?: boolean;
    panControlOptions?: PanControlOptions;
    rotateControl?: boolean;
    rotateControlOptions?: RotateControlOptions;
    scaleControl?: boolean;
    scaleControlOptions?: ScaleControlOptions;
    scrollwheel?: boolean;
    streetView?: StreetViewPanorama;
    streetViewControl?: boolean;
    streetViewControlOptions?: StreetViewControlOptions;
    styles?: MapTypeStyle[];
    tilt?: number;
    zoom?: number;
    zoomControl?: boolean;
    zoomControlOptions?: ZoomControlOptions;
  }

  type MapTypeId = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  
  interface FullscreenControlOptions {
    position?: ControlPosition;
  }
  
  interface MapTypeControlOptions {
    mapTypeIds?: (string | MapTypeId)[];
    position?: ControlPosition;
    style?: MapTypeControlStyle;
  }
  
  type MapTypeControlStyle = 0 | 1 | 2;
  
  interface MapTypeStyle {
    elementType?: MapElementType;
    featureType?: MapFeatureType;
    stylers: MapStyler[];
  }
  
  type MapElementType = 'all' | 'geometry' | 'geometry.fill' | 'geometry.stroke' | 'labels' | 'labels.icon' | 'labels.text' | 'labels.text.fill' | 'labels.text.stroke';
  
  type MapFeatureType = 'all' | 'administrative' | 'administrative.country' | 'administrative.land_parcel' | 'administrative.locality' | 'administrative.neighborhood' | 'administrative.province' | 'landscape' | 'landscape.man_made' | 'landscape.natural' | 'landscape.natural.landcover' | 'landscape.natural.terrain' | 'poi' | 'poi.attraction' | 'poi.business' | 'poi.government' | 'poi.medical' | 'poi.park' | 'poi.place_of_worship' | 'poi.school' | 'poi.sports_complex' | 'road' | 'road.arterial' | 'road.highway' | 'road.highway.controlled_access' | 'road.local' | 'transit' | 'transit.line' | 'transit.station' | 'transit.station.airport' | 'transit.station.bus' | 'transit.station.rail' | 'water';
  
  interface MapStyler {
    color?: string;
    gamma?: number;
    hue?: string;
    invert_lightness?: boolean;
    lightness?: number;
    saturation?: number;
    visibility?: string;
    weight?: number;
  }
  
  interface PanControlOptions {
    position?: ControlPosition;
  }
  
  interface RotateControlOptions {
    position?: ControlPosition;
  }
  
  interface ScaleControlOptions {
    style?: ScaleControlStyle;
  }
  
  type ScaleControlStyle = 0;
  
  interface StreetViewControlOptions {
    position?: ControlPosition;
  }
  
  interface ZoomControlOptions {
    position?: ControlPosition;
  }
  
  type ControlPosition = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

  class Symbol {
    constructor(opts?: SymbolOptions);
  }
  
  interface SymbolOptions {
    anchor?: Point;
    fillColor?: string;
    fillOpacity?: number;
    labelOrigin?: Point;
    path?: string | SymbolPath;
    rotation?: number;
    scale?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
  }
  
  type SymbolPath = 0 | 1 | 2 | 3 | 4 | 5;
  
  type Animation = 1 | 2;
  
  class StreetViewPanorama {
    constructor(container: Element, opts?: StreetViewPanoramaOptions);
  }
  
  interface StreetViewPanoramaOptions {
    addressControl?: boolean;
    addressControlOptions?: StreetViewAddressControlOptions;
    clickToGo?: boolean;
    disableDefaultUI?: boolean;
    disableDoubleClickZoom?: boolean;
    enableCloseButton?: boolean;
    fullscreenControl?: boolean;
    fullscreenControlOptions?: FullscreenControlOptions;
    imageDateControl?: boolean;
    linksControl?: boolean;
    motionTracking?: boolean;
    motionTrackingControl?: boolean;
    motionTrackingControlOptions?: MotionTrackingControlOptions;
    panControl?: boolean;
    panControlOptions?: PanControlOptions;
    pano?: string;
    position?: LatLng | LatLngLiteral;
    pov?: StreetViewPov;
    scrollwheel?: boolean;
    showRoadLabels?: boolean;
    visible?: boolean;
    zoomControl?: boolean;
    zoomControlOptions?: ZoomControlOptions;
  }
  
  interface StreetViewAddressControlOptions {
    position?: ControlPosition;
  }
  
  interface MotionTrackingControlOptions {
    position?: ControlPosition;
  }
  
  interface StreetViewPov {
    heading: number;
    pitch: number;
  }

  class event {
    static addListener(instance: object, eventName: string, handler: (...args: any[]) => void): MapsEventListener;
    static addDomListener(instance: Element, eventName: string, handler: (event: Event) => void, capture?: boolean): MapsEventListener;
    static addDomListenerOnce(instance: Element, eventName: string, handler: (event: Event) => void, capture?: boolean): MapsEventListener;
    static addListenerOnce(instance: object, eventName: string, handler: (...args: any[]) => void): MapsEventListener;
    static clearInstanceListeners(instance: object): void;
    static clearListeners(instance: object, eventName: string): void;
    static hasListeners(instance: object, eventName: string): boolean;
    static removeListener(listener: MapsEventListener): void;
  }
}

