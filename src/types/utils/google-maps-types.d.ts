
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element | null, opts?: MapOptions);
      fitBounds(bounds: LatLngBounds): void;
      getCenter(): LatLng;
      getZoom(): number;
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      panTo(latLng: LatLng | LatLngLiteral): void;
      panBy(x: number, y: number): void;
      setOptions(options: MapOptions): void;
      addListener(eventName: string, handler: (...args: any[]) => void): MapsEventListener;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng);
      extend(latLng: LatLng | LatLngLiteral): LatLngBounds;
      contains(latLng: LatLng | LatLngLiteral): boolean;
      getCenter(): LatLng;
      getNorthEast(): LatLng;
      getSouthWest(): LatLng;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      getMap(): Map | null;
      setPosition(latLng: LatLng | LatLngLiteral): void;
      getPosition(): LatLng | null;
      setTitle(title: string): void;
      getTitle(): string | null;
      setIcon(icon: string | Icon | Symbol): void;
      setLabel(label: string | MarkerLabel): void;
      setDraggable(draggable: boolean): void;
      setVisible(visible: boolean): void;
      addListener(eventName: string, handler: (...args: any[]) => void): MapsEventListener;
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      open(map: Map, anchor?: MVCObject): void;
      close(): void;
      setContent(content: string | Node): void;
      getContent(): string | Node;
      setPosition(latLng: LatLng | LatLngLiteral): void;
      getPosition(): LatLng | null;
    }

    class Geocoder {
      geocode(request: GeocoderRequest, callback: (results: GeocoderResult[], status: GeocoderStatus) => void): void;
    }

    class DirectionsService {
      route(request: DirectionsRequest, callback: (result: DirectionsResult | null, status: DirectionsStatus) => void): void;
    }

    class DirectionsRenderer {
      constructor(opts?: DirectionsRendererOptions);
      setMap(map: Map | null): void;
      getMap(): Map | null;
      setDirections(directions: DirectionsResult): void;
      getDirections(): DirectionsResult | null;
      setRouteIndex(routeIndex: number): void;
      getRouteIndex(): number;
    }

    class DistanceMatrixService {
      getDistanceMatrix(request: DistanceMatrixRequest, callback: (response: DistanceMatrixResponse, status: DistanceMatrixStatus) => void): void;
    }

    class MapsEventListener {
      remove(): void;
    }

    class MVCObject {
      addListener(eventName: string, handler: Function): MapsEventListener;
      bindTo(key: string, target: MVCObject, targetKey?: string, noNotify?: boolean): void;
      get(key: string): any;
      notify(key: string): void;
      set(key: string, value: any): void;
      setValues(values: any): void;
      unbind(key: string): void;
      unbindAll(): void;
    }

    // Enums
    enum MapTypeId {
      ROADMAP = 'roadmap',
      SATELLITE = 'satellite',
      HYBRID = 'hybrid',
      TERRAIN = 'terrain'
    }

    enum TravelMode {
      DRIVING = 'DRIVING',
      WALKING = 'WALKING',
      BICYCLING = 'BICYCLING',
      TRANSIT = 'TRANSIT'
    }

    enum UnitSystem {
      METRIC = 0,
      IMPERIAL = 1
    }

    enum GeocoderStatus {
      OK = 'OK',
      ZERO_RESULTS = 'ZERO_RESULTS',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      INVALID_REQUEST = 'INVALID_REQUEST',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR'
    }

    enum DirectionsStatus {
      OK = 'OK',
      NOT_FOUND = 'NOT_FOUND',
      ZERO_RESULTS = 'ZERO_RESULTS',
      MAX_WAYPOINTS_EXCEEDED = 'MAX_WAYPOINTS_EXCEEDED',
      INVALID_REQUEST = 'INVALID_REQUEST',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR'
    }

    enum DistanceMatrixStatus {
      OK = 'OK',
      INVALID_REQUEST = 'INVALID_REQUEST',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR',
      MAX_ELEMENTS_EXCEEDED = 'MAX_ELEMENTS_EXCEEDED',
      MAX_DIMENSIONS_EXCEEDED = 'MAX_DIMENSIONS_EXCEEDED'
    }

    // Interfaces
    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: MapTypeId | string;
      heading?: number;
      tilt?: number;
      clickableIcons?: boolean;
      disableDefaultUI?: boolean;
      gestureHandling?: string;
      restriction?: MapRestriction;
      [key: string]: any;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MapRestriction {
      latLngBounds: LatLngBounds | LatLngBoundsLiteral;
      strictBounds?: boolean;
    }

    interface LatLngBoundsLiteral {
      east: number;
      north: number;
      south: number;
      west: number;
    }

    interface MarkerOptions {
      position: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: string | Icon | Symbol;
      label?: string | MarkerLabel;
      draggable?: boolean;
      clickable?: boolean;
      visible?: boolean;
      zIndex?: number;
      [key: string]: any;
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
      scaledSize?: Size;
      labelOrigin?: Point;
    }

    interface Symbol {
      path: string | SymbolPath;
      fillColor?: string;
      fillOpacity?: number;
      scale?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      [key: string]: any;
    }

    enum SymbolPath {
      CIRCLE = 0,
      FORWARD_CLOSED_ARROW = 1,
      FORWARD_OPEN_ARROW = 2,
      BACKWARD_CLOSED_ARROW = 3,
      BACKWARD_OPEN_ARROW = 4
    }

    class Point {
      constructor(x: number, y: number);
      x: number;
      y: number;
      equals(other: Point): boolean;
      toString(): string;
    }

    class Size {
      constructor(width: number, height: number);
      width: number;
      height: number;
      equals(other: Size): boolean;
      toString(): string;
    }

    interface InfoWindowOptions {
      content?: string | Node;
      disableAutoPan?: boolean;
      maxWidth?: number;
      pixelOffset?: Size;
      position?: LatLng | LatLngLiteral;
      zIndex?: number;
    }

    interface GeocoderRequest {
      address?: string;
      bounds?: LatLngBounds | LatLngBoundsLiteral;
      location?: LatLng | LatLngLiteral;
      placeId?: string;
      region?: string;
      componentRestrictions?: GeocoderComponentRestrictions;
    }

    interface GeocoderComponentRestrictions {
      route?: string;
      locality?: string;
      administrativeArea?: string;
      postalCode?: string;
      country?: string;
    }

    interface GeocoderResult {
      address_components: GeocoderAddressComponent[];
      formatted_address: string;
      geometry: GeocoderGeometry;
      place_id: string;
      types: string[];
    }

    interface GeocoderAddressComponent {
      long_name: string;
      short_name: string;
      types: string[];
    }

    interface GeocoderGeometry {
      location: LatLng;
      location_type: GeocoderLocationType;
      viewport: LatLngBounds;
      bounds?: LatLngBounds;
    }

    enum GeocoderLocationType {
      APPROXIMATE = 'APPROXIMATE',
      GEOMETRIC_CENTER = 'GEOMETRIC_CENTER',
      RANGE_INTERPOLATED = 'RANGE_INTERPOLATED',
      ROOFTOP = 'ROOFTOP'
    }

    interface DirectionsRequest {
      origin: string | LatLng | LatLngLiteral | Place;
      destination: string | LatLng | LatLngLiteral | Place;
      travelMode: TravelMode;
      transitOptions?: TransitOptions;
      drivingOptions?: DrivingOptions;
      unitSystem?: UnitSystem;
      waypoints?: DirectionsWaypoint[];
      optimizeWaypoints?: boolean;
      provideRouteAlternatives?: boolean;
      avoidFerries?: boolean;
      avoidHighways?: boolean;
      avoidTolls?: boolean;
      region?: string;
    }

    interface TransitOptions {
      arrivalTime?: Date;
      departureTime?: Date;
      modes?: TransitMode[];
      routingPreference?: TransitRoutePreference;
    }

    enum TransitMode {
      BUS = 'BUS',
      RAIL = 'RAIL',
      SUBWAY = 'SUBWAY',
      TRAIN = 'TRAIN',
      TRAM = 'TRAM'
    }

    enum TransitRoutePreference {
      FEWER_TRANSFERS = 'FEWER_TRANSFERS',
      LESS_WALKING = 'LESS_WALKING'
    }

    interface DrivingOptions {
      departureTime: Date;
      trafficModel?: TrafficModel;
    }

    enum TrafficModel {
      BEST_GUESS = 'BEST_GUESS',
      OPTIMISTIC = 'OPTIMISTIC',
      PESSIMISTIC = 'PESSIMISTIC'
    }

    interface DirectionsWaypoint {
      location: string | LatLng | LatLngLiteral | Place;
      stopover?: boolean;
    }

    interface Place {
      location: LatLng | LatLngLiteral;
      placeId: string;
      query: string;
    }

    interface DirectionsResult {
      routes: DirectionsRoute[];
    }

    interface DirectionsRoute {
      bounds: LatLngBounds;
      copyrights: string;
      legs: DirectionsLeg[];
      overview_path: LatLng[];
      overview_polyline: string;
      warnings: string[];
      waypoint_order: number[];
    }

    interface DirectionsLeg {
      arrival_time: Time;
      departure_time: Time;
      distance: Distance;
      duration: Duration;
      duration_in_traffic: Duration;
      end_address: string;
      end_location: LatLng;
      start_address: string;
      start_location: LatLng;
      steps: DirectionsStep[];
      via_waypoints: LatLng[];
    }

    interface DirectionsStep {
      distance: Distance;
      duration: Duration;
      end_location: LatLng;
      instructions: string;
      path: LatLng[];
      start_location: LatLng;
      steps: DirectionsStep[];
      transit: TransitDetails;
      travel_mode: TravelMode;
    }

    interface Distance {
      text: string;
      value: number;
    }

    interface Duration {
      text: string;
      value: number;
    }

    interface Time {
      text: string;
      time_zone: string;
      value: Date;
    }

    interface TransitDetails {
      arrival_stop: TransitStop;
      arrival_time: Time;
      departure_stop: TransitStop;
      departure_time: Time;
      headsign: string;
      headway: number;
      line: TransitLine;
      num_stops: number;
    }

    interface TransitStop {
      location: LatLng;
      name: string;
    }

    interface TransitLine {
      agencies: TransitAgency[];
      color: string;
      icon: string;
      name: string;
      short_name: string;
      text_color: string;
      url: string;
      vehicle: TransitVehicle;
    }

    interface TransitAgency {
      name: string;
      phone: string;
      url: string;
    }

    interface TransitVehicle {
      icon: string;
      local_icon: string;
      name: string;
      type: VehicleType;
    }

    enum VehicleType {
      BUS = 'BUS',
      CABLE_CAR = 'CABLE_CAR',
      COMMUTER_TRAIN = 'COMMUTER_TRAIN',
      FERRY = 'FERRY',
      FUNICULAR = 'FUNICULAR',
      GONDOLA_LIFT = 'GONDOLA_LIFT',
      HEAVY_RAIL = 'HEAVY_RAIL',
      HIGH_SPEED_TRAIN = 'HIGH_SPEED_TRAIN',
      INTERCITY_BUS = 'INTERCITY_BUS',
      METRO_RAIL = 'METRO_RAIL',
      MONORAIL = 'MONORAIL',
      OTHER = 'OTHER',
      RAIL = 'RAIL',
      SHARE_TAXI = 'SHARE_TAXI',
      SUBWAY = 'SUBWAY',
      TRAM = 'TRAM',
      TROLLEYBUS = 'TROLLEYBUS'
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
      icons?: IconSequence[];
      map?: Map;
      path?: LatLng[] | LatLngLiteral[] | MVCArray<LatLng>;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      visible?: boolean;
      zIndex?: number;
    }

    interface IconSequence {
      fixedRotation?: boolean;
      icon?: Symbol;
      offset?: string;
      repeat?: string;
    }

    interface DistanceMatrixRequest {
      origins: string[] | LatLng[] | LatLngLiteral[] | Place[];
      destinations: string[] | LatLng[] | LatLngLiteral[] | Place[];
      travelMode: TravelMode;
      transitOptions?: TransitOptions;
      drivingOptions?: DrivingOptions;
      unitSystem?: UnitSystem;
      avoidHighways?: boolean;
      avoidTolls?: boolean;
      avoidFerries?: boolean;
      region?: string;
    }

    interface DistanceMatrixResponse {
      originAddresses: string[];
      destinationAddresses: string[];
      rows: DistanceMatrixResponseRow[];
    }

    interface DistanceMatrixResponseRow {
      elements: DistanceMatrixResponseElement[];
    }

    interface DistanceMatrixResponseElement {
      status: DistanceMatrixElementStatus;
      duration?: Duration;
      durationInTraffic?: Duration;
      distance?: Distance;
      fare?: TransitFare;
    }

    enum DistanceMatrixElementStatus {
      NOT_FOUND = 'NOT_FOUND',
      ZERO_RESULTS = 'ZERO_RESULTS',
      MAX_ROUTE_LENGTH_EXCEEDED = 'MAX_ROUTE_LENGTH_EXCEEDED',
      OK = 'OK'
    }

    interface TransitFare {
      currency: string;
      value: number;
      text: string;
    }

    // Event namespace
    namespace event {
      function addDomListener(instance: object, eventName: string, handler: (...args: any[]) => void, capture?: boolean): MapsEventListener;
      function addDomListenerOnce(instance: object, eventName: string, handler: (...args: any[]) => void, capture?: boolean): MapsEventListener;
      function addListener(instance: object, eventName: string, handler: (...args: any[]) => void): MapsEventListener;
      function addListenerOnce(instance: object, eventName: string, handler: (...args: any[]) => void): MapsEventListener;
      function clearInstanceListeners(instance: object): void;
      function clearListeners(instance: object, eventName: string): void;
      function removeListener(listener: MapsEventListener): void;
      function trigger(instance: object, eventName: string, ...args: any[]): void;
    }

    class MVCArray<T> extends MVCObject {
      constructor(array?: T[]);
      clear(): void;
      forEach(callback: (elem: T, i: number) => void): void;
      getArray(): T[];
      getAt(i: number): T;
      getLength(): number;
      insertAt(i: number, elem: T): void;
      pop(): T;
      push(elem: T): number;
      removeAt(i: number): T;
      setAt(i: number, elem: T): void;
    }
  }
}
