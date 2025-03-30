declare module 'react-native-maps-super-cluster' {
    import React from 'react';
    import { MapViewProps, MarkerProps } from 'react-native-maps';
    import { ViewStyle } from 'react-native';
  
    export interface ClusterMapProps extends MapViewProps {
      data: any[];
      renderMarker: (item: any) => JSX.Element;
      renderCluster?: (cluster: {
        id: string;
        geometry: {
          coordinates: [number, number];
        };
        onPress: () => void;
        properties: {
          point_count: number;
        };
      }) => JSX.Element;
      radius?: number;
      extent?: number;
      nodeSize?: number;
      minZoom?: number;
      maxZoom?: number;
      style?: ViewStyle;
    }
  
    const ClusteredMapView: React.ComponentType<ClusterMapProps>;
  
    export default ClusteredMapView;
  }
  