import axios from 'axios';
const CHARGING_STATIONS_API = 'https://odre.opendatasoft.com/api/records/1.0/search/?dataset=bornes-irve';

export const getChargingStations = async (latitude, longitude) => {
  const radius = 50000; // Rayon en mètres
  const apiUrl = `${CHARGING_STATIONS_API}&geofilter.distance=${latitude},${longitude},${radius}`;

  try {
    const response = await axios.get(apiUrl);
    
    // Assurez-vous que la structure des données correspond à votre besoin
    const stations = response.data.records.map((record) => {
      const fields = record.fields;

      return {
        id: fields.id_station || 'Unknown ID', // ID de la station
        name: fields.n_station || 'Unknown Station', // Nom de la station
        operator: fields.n_operateur || 'Unknown Operator', // Nom de l'opérateur
        accessibility: fields.accessibilite || 'Unknown Accessibility', // Accessibilité
        address: fields.ad_station || 'Unknown Address', // Adresse
        city: fields.n_enseigne || 'Unknown City', // Ville ou enseigne
        region: fields.region || 'Unknown Region', // Région
        latitude: fields.ylatitude || null, // Latitude
        longitude: fields.xlongitude || null, // Longitude
        charging_type: fields.type_prise || 'Unknown', // Type de prise
        power_max: fields.puiss_max || 'Unknown', // Puissance maximale
        distance: fields.dist ? `${parseFloat(fields.dist).toFixed(2)} m` : 'Unknown Distance', // Distance calculée
      };
    });

    return stations;
  } catch (error) {
    console.error('Error fetching charging stations:', error.message);
    throw new Error('Failed to fetch charging stations.');
  }
};
