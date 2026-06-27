import * as Location from 'expo-location';
import { calculateDeliveryQuote, KIGALI_DELIVERY_FEE_RWF } from './delivery';

export type DeliveryLocationResult = {
  latitude: number | null;
  longitude: number | null;
  label: string | null;
  deliveryFee: number;
  distanceKm: number;
  source: 'gps' | 'manual' | 'flat-fallback';
};

/**
 * Requests device location permission and, if granted, fetches the current
 * position and reverse-geocodes it to a human-readable label. Falls back to a
 * flat delivery fee with no coordinates if permission is denied or location
 * fails for any reason — the order can still be placed, just without a
 * distance-based quote.
 */
export async function getDeliveryLocation(manualLabel?: string): Promise<DeliveryLocationResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      return {
        latitude: null,
        longitude: null,
        label: manualLabel || null,
        deliveryFee: KIGALI_DELIVERY_FEE_RWF,
        distanceKm: 0,
        source: manualLabel ? 'manual' : 'flat-fallback',
      };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = position.coords;
    const quote = calculateDeliveryQuote(latitude, longitude);

    let label = manualLabel || null;
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (place) {
        const parts = [place.street, place.district || place.subregion, place.city, place.region].filter(Boolean);
        label = parts.join(', ') || label;
      }
    } catch {
      // Reverse geocoding failed; keep manual label (if any) and still use coordinates for the fee.
    }

    return {
      latitude,
      longitude,
      label,
      deliveryFee: quote.deliveryFee,
      distanceKm: quote.distanceKm,
      source: 'gps',
    };
  } catch {
    return {
      latitude: null,
      longitude: null,
      label: manualLabel || null,
      deliveryFee: KIGALI_DELIVERY_FEE_RWF,
      distanceKm: 0,
      source: manualLabel ? 'manual' : 'flat-fallback',
    };
  }
}
