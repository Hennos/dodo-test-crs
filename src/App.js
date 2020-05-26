import React, { useState } from "react";
import L from "leaflet";
import { Map, ImageOverlay, FeatureGroup, Marker, Popup } from "react-leaflet";

import PointMarker from "./PointMarker";

import floorPlan from "./floorPlan.jpg";

import "./App.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default App;

const sizeFloorPlan = L.point(2560, 975);
const sizeRobotMap = L.point(640, 384);
const pixelMeterRobotMap = 0.05;
const robotMapOrigin = L.point(1.51, 9.67);

const FloorPlanTransformation = getFloorPlanTransformation({
  sizeFloorPlan,
  sizeRobotMap,
  robotMapOrigin,
  pixelMeterRobotMap,
});

const fromPixelToMeterPoint = (point) =>
  FloorPlanTransformation.transform(point);
const fromMeterToPixelPoint = (point) =>
  FloorPlanTransformation.untransform(point);

const meterLeftBottomBoundAngle = robotMapOrigin;
const meterRightTopBoundAngle = fromPixelToMeterPoint(sizeFloorPlan);
const meterFloorPlanBounds = [
  [-meterLeftBottomBoundAngle.x, -meterLeftBottomBoundAngle.y],
  [
    meterRightTopBoundAngle.x - meterLeftBottomBoundAngle.x,
    meterRightTopBoundAngle.y - meterLeftBottomBoundAngle.y,
  ],
];

L.Projection.RobotCoordinates = L.extend({}, L.CRS.LonLag, {
  project: ({ lat: meterPointY, lng: meterPointX }) => {
    return fromMeterToPixelPoint(L.point(meterPointY, meterPointX));
  },
  unproject: (point) => {
    const meterPoint = fromPixelToMeterPoint(point);
    return L.latLng([meterPoint.x, meterPoint.y]);
  },
});

L.CRS.Robot = L.extend({}, L.CRS.Simple, {
  projection: L.Projection.RobotCoordinates,
});

function App() {
  const [viewPoint, setViewPoint] = useState(null);

  return (
    <div className="App">
      <Map
        className="dodo-map"
        maxZoom={18}
        bounds={meterFloorPlanBounds}
        maxBounds={meterFloorPlanBounds}
        crs={L.CRS.Robot}
        onClick={({ latlng }) => {
          setViewPoint(latlng);
        }}
      >
        <ImageOverlay url={floorPlan} bounds={meterFloorPlanBounds} />
        <FeatureGroup>
          <Marker
            position={[0, 0]}
            closeOnClick={false}
            onAdd={({ target }) => {
              target.openPopup();
            }}
          >
            <Popup closeButton={false}>Точка отсчёта</Popup>
          </Marker>
          {viewPoint && <PointMarker point={viewPoint} />}
        </FeatureGroup>
      </Map>
    </div>
  );
}

/*
  Процедура, позволяющая получить объект трансформации для преобразования 
  координат из пикселей в метры. Из данных у нас есть размеры плана и карты 
  робота и сколько метров укладывается в одном пикселе карты робота и 
  положение начала координат в системе робота в пикселях.
*/
function getFloorPlanTransformation({
  sizeRobotMap,
  sizeFloorPlan,
  pixelMeterRobotMap,
}) {
  const [scaleMeterRobotMapY, scaleMeterRobotMapX] = [
    (sizeRobotMap.y / sizeFloorPlan.y) * pixelMeterRobotMap,
    (sizeRobotMap.x / sizeFloorPlan.x) * pixelMeterRobotMap,
  ];
  return new L.Transformation(scaleMeterRobotMapX, 0, scaleMeterRobotMapY, 0);
}
