import { View, TouchableOpacity, Image, Text, Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RectButton } from 'react-native-gesture-handler';

import React, { useState, useEffect } from 'react';

import { Feather as Icon, FontAwesome } from '@expo/vector-icons'

import api from '../../services/api';
import styles from './style'

interface Params {
  point_id: number
}

interface Data {
  point: {
    image: string;
    image_url: string;
    name: string;
    email: string;
    whatsapp: string;
    city: string;
    uf: string;
  };
  items: {
    title: string;
  }[];
}

const Details = () => {

  const [data, setData] = useState<Data>({} as Data);

  const navigate = useNavigation();
  const route = useRoute();

  const routesParams = route.params as Params;

  useEffect(() => {
    api.get(`points/${routesParams.point_id}`).then(response => {
      setData(response.data);
    });
  }, []);

  function handleNavigateBack() {
    navigate.goBack();
  }

  function handleWhatsApp() {
    Linking.openURL(`whatsapp://send?phone=${data.point.whatsapp}&text=Tenho interesse na coleta de resíduos.`)
  }
  /*
  function handleComposeMail(){
    MailComposer.composeAsync(
      subject: "Interesse na coleta de resíduos",
      recipients: [data.point.email],
    )
  }
  */

  if (!data.point) {
    return null;
  }

  return (
    <>
      <View style={styles.container}>

        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" color="#34cb79" size={20} />
        </TouchableOpacity>
        {console.log(data.point)}
        <Image style={styles.pointImage} source={{ uri: data.point.image_url }} />
        <Text style={styles.pointName}>{data.point.name}</Text>
        <Text style={styles.pointItems}>
          {data.items.map(item => item.title).join(', ')}
        </Text>

        <View style={styles.address}>
          <Text style={styles.addressTitle}>Endereço</Text>
          <Text style={styles.addressContent}>{data.point.city}, {data.point.uf}</Text>
        </View>

      </View>

      <View style={styles.footer}>

        <RectButton style={styles.button} onPress={() => handleWhatsApp()}>
          <FontAwesome name={"whatsapp"} size={20} color={"#FFF"} />
          <Text style={styles.buttonText}>Whatsapp</Text>
        </RectButton>

        <RectButton style={styles.button} onPress={() => { }}>
          <FontAwesome name={"envelope"} size={20} color={"#FFF"} />
          <Text style={styles.buttonText}>Email</Text>
        </RectButton>

      </View>
    </>
  );
}


export default Details;