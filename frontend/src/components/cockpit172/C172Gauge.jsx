import React from "react";
import { AirspeedIndicator } from "../cockpit/instruments/AirspeedIndicator.jsx";
import { AttitudeIndicator } from "../cockpit/instruments/AttitudeIndicator.jsx";
import { Altimeter } from "../cockpit/instruments/Altimeter.jsx";
import { TurnCoordinator } from "../cockpit/instruments/TurnCoordinator.jsx";
import { HeadingIndicator } from "../cockpit/instruments/HeadingIndicator.jsx";
import { VerticalSpeedIndicator } from "../cockpit/instruments/VerticalSpeedIndicator.jsx";

export function C172Gauge({ type, label, flight, active = false, onClick }) {
  if (type === "airspeed") {
    return (
      <AirspeedIndicator
        label={label}
        value={flight.airspeed}
        active={active}
        onClick={onClick}
      />
    );
  }

  if (type === "attitude") {
    return (
      <AttitudeIndicator
        label={label}
        pitch={flight.pitch}
        roll={flight.bank}
        active={active}
        onClick={onClick}
      />
    );
  }

  if (type === "altimeter") {
    return (
      <Altimeter
        label={label}
        altitude={flight.altitude}
        active={active}
        onClick={onClick}
      />
    );
  }

  if (type === "heading") {
    return (
      <HeadingIndicator
        label={label}
        heading={flight.heading}
        active={active}
        onClick={onClick}
      />
    );
  }

  if (type === "vsi") {
    return (
      <VerticalSpeedIndicator
        label={label}
        vsi={flight.verticalSpeed}
        active={active}
        onClick={onClick}
      />
    );
  }

  if (type === "turn") {
    const turnRate = (flight.bank ?? 0) / 15;
    return (
      <TurnCoordinator
        label={label}
        turnRate={turnRate}
        slip={0}
        active={active}
        onClick={onClick}
      />
    );
  }

  return null;
}

