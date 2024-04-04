'use client';

import { Suspense, useEffect, useState } from 'react';
import { AspectRatio } from '@chakra-ui/react';
import { Map } from 'react-kakao-maps-sdk';
import { useFindMyLocation } from '@/hooks/useFindMyLocation';
import { useGetStationsNearby } from '@/hooks/useGetQueries';
import { Coordinates } from '@/types/location';
import { DEFAULT_LAT, DEFAULT_LNG, DEFAULT_RADIUS } from '@/constants/location';
import { GetStationsNearbyRequest, Station } from '@/types/common';
import { useStationStore } from '@/stores/useStationStore';
import { MapMarkerContainer } from '@/components/map/MapMarkerContainer';

export const MapContainer = () => {
  const [coordinates, setCoordinates] = useState<Coordinates>({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
  });
  const { station } = useStationStore();
  const [stationsNearby, setStationsNearby] = useState<Station[]>();
  const location = useFindMyLocation();

  useEffect(() => {
    // 위치 정보를 허용한 경우
    if (location.coordinates) {
      const { lat, lng } = location.coordinates;
      setCoordinates({
        lat,
        lng,
      });
      // 검색창에서 아이템을 선택한 경우
    } else if (station.arsId) {
      const { xlatitude, ylongitude } = station;
      setCoordinates({
        lat: xlatitude,
        lng: ylongitude,
      });
      // 위치 정보를 허용하지 않은 경우
    } else {
      setCoordinates({
        lat: DEFAULT_LAT,
        lng: DEFAULT_LNG,
      });
    }
  }, [location, station]);

  const request: GetStationsNearbyRequest = {
    xlatitude: coordinates.lat,
    ylongitude: coordinates.lng,
    radius: DEFAULT_RADIUS,
  };
  const { data } = useGetStationsNearby(request);

  useEffect(() => {
    if (data) {
      setStationsNearby(data.result);
    }
  }, [data]);

  return (
    <AspectRatio ratio={16 / 9}>
      <Suspense fallback={<p>로딩중..</p>}>
        {location.loaded && stationsNearby && (
          <Map center={coordinates} isPanto style={{ width: '100%', height: '100%' }} level={4}>
            {stationsNearby.map((item) => {
              const { xlatitude, ylongitude } = item;
              return (
                <MapMarkerContainer
                  key={`${item.xlatitude}-${item.ylongitude}`}
                  position={{ lat: xlatitude, lng: ylongitude }}
                  item={item}
                />
              );
            })}
          </Map>
        )}
      </Suspense>
    </AspectRatio>
  );
};
