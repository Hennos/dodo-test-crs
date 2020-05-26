import React from "react";
import PropTypes from "prop-types";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";

const roundMeter = (point) => point.multiplyBy(100).floor().divideBy(100);

const PointMarker = ({ point }) => {
  const roundedPoint = roundMeter(L.point(point.lat, point.lng));
  return (
    <Marker
      position={point}
      onAdd={({ target }) => {
        target.openPopup();
      }}
      onMove={({ target }) => {
        target.openPopup();
      }}
    >
      <Popup closeButton={false}>
        {roundedPoint.x} / {roundedPoint.y}
      </Popup>
    </Marker>
  );
};

PointMarker.propTypes = {
  point: PropTypes.instanceOf(L.LatLng).isRequired,
};

export default PointMarker;
