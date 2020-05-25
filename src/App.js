import React, { useState } from "react";
import L from "leaflet";
import { Map, ImageOverlay, Marker, Popup } from "react-leaflet";

import floorPlan from "./floorPlan.jpg";

import "./App.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default App;

// L.CRS.Floor = L.extend({}, L.CRS.Simple, {
//   projection: L.Projection.LonLat,
//   transformation: new L.Transformation(20, 10, 20, 10),
//   scale: function (zoom) {
//     return Math.pow(2, zoom);
//   },
// });

const sizePlan = { height: 975, width: 2560 };
const sizeRobotMap = { height: 384, width: 640 };
const robotMapOrigin = [261, 181];
const pixelMeterRobotMap = 0.05;

const FloorTransformation = getFloorTransformation({
  sizeRobotMap,
  sizePlan,
  robotMapOrigin,
  pixelMeterRobotMap,
});

const bounds = [
  [0, 0],
  [sizePlan.height, sizePlan.width],
];

const getRealPosition = (point) => {
  return FloorTransformation.transform(point);
};
const getPlanPosition = (point) => {
  return FloorTransformation.untransform(point);
};
const roundMeter = (point) => point.multiplyBy(100).floor().divideBy(100);
const originPoint = getPlanPosition(L.point({ x: 0, y: 0 }));

function App() {
  const [viewPoint, setViewPoint] = useState(null);

  return (
    <div className="App">
      <Map
        className="dodo-map"
        maxZoom={18}
        bounds={bounds}
        maxBounds={bounds}
        crs={L.CRS.Simple}
        onClick={({ latlng }) => {
          setViewPoint(latlng);
        }}
      >
        <ImageOverlay url={floorPlan} bounds={bounds} />
        <Marker
          position={[originPoint.x, originPoint.y]}
          closeOnClick={false}
          onAdd={({ target }) => {
            target.openPopup();
          }}
        >
          <Popup closeButton={false}>Точка отсчёта</Popup>
        </Marker>
        {viewPoint && (
          <Marker
            position={viewPoint}
            onAdd={({ target }) => {
              target.openPopup();
            }}
            onMove={({ target }) => {
              target.openPopup();
            }}
          >
            <Popup closeButton={false}>
              {
                roundMeter(
                  getRealPosition(
                    L.point({ x: viewPoint.lat, y: viewPoint.lng })
                  )
                ).x
              }{" "}
              /{" "}
              {
                roundMeter(
                  getRealPosition(
                    L.point({ x: viewPoint.lat, y: viewPoint.lng })
                  )
                ).y
              }
            </Popup>
          </Marker>
        )}
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
function getFloorTransformation({
  sizeRobotMap = { height: 384, width: 640 },
  sizePlan = { height: 975, width: 2560 },
  robotMapOrigin: [robotMapOriginY, robotMapOriginX] = [261, 181],
  pixelMeterRobotMap = 0.05,
}) {
  const [scaleYRobotMap, scaleXRobotMap] = [
    sizeRobotMap.height / sizePlan.height,
    sizeRobotMap.width / sizePlan.width,
  ];
  const [scaleMeterY, scaleMeterX] = [
    scaleYRobotMap * pixelMeterRobotMap,
    scaleXRobotMap * pixelMeterRobotMap,
  ];
  const [robotMapOriginMeterY, robotMapOriginMeterX] = [
    robotMapOriginY * scaleMeterY,
    robotMapOriginX * scaleMeterX,
  ];
  return new L.Transformation(
    scaleMeterY,
    -robotMapOriginMeterY,
    scaleMeterX,
    -robotMapOriginMeterX
  );
}
