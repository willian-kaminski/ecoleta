import { View, TouchableOpacity, Text, ScrollView, Image, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import React, { useState, useEffect } from 'react';

import { Feather as Icon } from '@expo/vector-icons'
import * as Location from 'expo-location';

import api from '../../services/api';
import styles from './style';


interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface Point {
  id: number;
  name: string;
  image: string;
  image_url: string;
  latitude: number;
  longitude: number;
}

interface Params {
  uf: string;
  city: string;
}

const Points = () => {

  const [items, setItems] = useState<Item[]>([]);
  const [selectedItens, setSelectedItens] = useState<Number[]>([]);

  const [points, setPoints] = useState<Point[]>([]);
  const [inicialPosition, setInicialPosition] = useState<[number, number]>([0, 0]);

  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;

  useEffect(() => {
    api.get('points', {
      params: {
        city: routeParams.city,
        uf: routeParams.uf,
        items: selectedItens
      }
    }).then(response => {
      setPoints(response.data)
    });
  }, [selectedItens]);

  useEffect(() => {
    api.get('itens').then(response => {
      setItems(response.data)
    });
  }, []);

  useEffect(() => {
    async function loadPosition() {

      const { status } = await Location.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Ooops...", "Precisamos de sua permissão para obter a localização");
        return;
      }

      const location = Location.getCurrentPositionAsync();
      const { latitude, longitude } = (await location).coords;
      setInicialPosition([latitude, longitude]);

    }

    loadPosition();

  }, []);

  function handleNavigateBack() {
    navigation.goBack();
  }

  function handleSelectedItem(id: number) {
    const alreadySelected = selectedItens.findIndex(item => item === id);

    if (alreadySelected >= 0) {
      const filteredItems = selectedItens.filter(item => item !== id);
      setSelectedItens(filteredItems);
    } else {
      setSelectedItens([...selectedItens, id]);
    }

  }

  function handleNavigateToDetail(id: Number) {
    navigation.navigate('Detail', { point_id: id })
  }

  return (
    <>
      <View style={styles.container}>

        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" color="#34cb79" size={20} />
        </TouchableOpacity>

        <Text style={styles.title}>Bem vindo.</Text>
        <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

        <View style={styles.mapContainer}>

          {inicialPosition[0] !== 0 && (

            <MapView
              style={styles.map}
              initialRegion={{
                latitude: inicialPosition[0],
                longitude: inicialPosition[1],
                latitudeDelta: 0.014,
                longitudeDelta: 0.014
              }}>

              {points?.map(point => (
                
                <Marker
                  key={String(point.id)}
                  style={styles.mapMarker}
                  onPress={() => handleNavigateToDetail(point.id)}
                  coordinate={{
                    latitude: point.latitude,
                    longitude: point.longitude
                  }}>
                    {console.log(point.latitude)}
                  <View style={styles.mapMarkerContainer}>
                    <Image style={styles.mapMarkerImage} source={{ uri: point.image_url }} />
                    <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                  </View>

                </Marker>

              ))}

            </MapView>

          )}

        </View>

      </View>

      <View style={styles.itemsContainer}>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}>

          {items?.map(item => (

            <TouchableOpacity
              key={String(item.id)}
              style={[
                styles.item,
                selectedItens.includes(item.id) ? styles.selectedItem : {}
              ]}
              onPress={() => { handleSelectedItem(item.id) }}
              activeOpacity={0.6}>
              <SvgUri width={42} height={42} uri={String(item.image_url)} />
              <Text style={styles.itemTitle}>{String(item.title)}</Text>
            </TouchableOpacity>

          ))}

        </ScrollView>

      </View>      
    </>
  );
}

export default Points;