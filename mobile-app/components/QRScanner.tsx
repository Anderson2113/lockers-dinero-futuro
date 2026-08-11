import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Camera, CameraView } from 'expo-camera';

interface Props {
  onScan: (data: string) => void;
  onCancel: () => void;
}

export default function QRScanner({ onScan, onCancel }: Props) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text style={{color: '#FFF'}}>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={({ data }) => onScan(data)}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.overlay}>
           <View style={styles.scanBox} />
        </View>
      </CameraView>
      
      <TouchableOpacity style={styles.closeBtn} onPress={onCancel}>
        <Text style={styles.closeText}>Cerrar Escáner</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#0A84FF',
    backgroundColor: 'transparent',
    borderRadius: 16,
  },
  closeBtn: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#3A3A3C',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 20,
  },
  closeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
