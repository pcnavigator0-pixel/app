export const KIGALI_DELIVERY_FEE_RWF = 1500;
export const DELIVERY_RATE_PER_KM_RWF = 0;

// Approximate Kicukiro district center. Update these values if you want your exact warehouse coordinates.
export const BUSINESS_HQ = {
  district: 'Kicukiro District',
  label: 'Business HQ, Kicukiro District',
  latitude: -1.9706,
  longitude: 30.1044,
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function calculateDistanceKm(
  startLatitude: number,
  startLongitude: number,
  endLatitude: number,
  endLongitude: number,
) {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(endLatitude - startLatitude);
  const longitudeDelta = toRadians(endLongitude - startLongitude);
  const startLatitudeRad = toRadians(startLatitude);
  const endLatitudeRad = toRadians(endLatitude);

  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(startLatitudeRad) * Math.cos(endLatitudeRad) * Math.sin(longitudeDelta / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export function calculateDeliveryQuote(latitude: number, longitude: number) {
  const rawDistanceKm = calculateDistanceKm(
    BUSINESS_HQ.latitude,
    BUSINESS_HQ.longitude,
    latitude,
    longitude,
  );
  const distanceKm = Math.max(0.1, Number(rawDistanceKm.toFixed(2)));

  // Currently a flat fee (rate per km is 0). The distance-based multiplier is
  // already wired up for when DELIVERY_RATE_PER_KM_RWF is raised above 0.
  const distanceFee = distanceKm * DELIVERY_RATE_PER_KM_RWF;

  return {
    deliveryFee: KIGALI_DELIVERY_FEE_RWF + distanceFee,
    distanceKm,
    ratePerKm: DELIVERY_RATE_PER_KM_RWF,
  };
}
