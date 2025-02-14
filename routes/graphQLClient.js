import { createClient, fetchExchange } from '@urql/core';

// Configuration des en-têtes pour l'authentification
const headers = {
  'x-client-id': '678a15ce6f014f34da8445a9',
  'x-app-id': '678a15ce6f014f34da8445ab',
};

// Création du client GraphQL avec l'exchange `fetchExchange`
const client = createClient({
  url: 'https://api.chargetrip.io/graphql',
  fetchOptions: {
    method: 'POST',
    headers,
  },
  exchanges: [fetchExchange],
});

// Requête GraphQL pour récupérer les véhicules
const vehicleListQuery = `
  query vehicleList($page: Int, $size: Int, $search: String) {
    vehicleList(page: $page, size: $size, search: $search) {
      id
      naming {
        make
        model
        chargetrip_version
      }
      media {
        image {
          thumbnail_url
        }
      }
      battery {
        usable_kwh
        full_kwh
      }
      connectors {
        standard
        power
      }
    }
  }
`;

// Fonction pour calculer l'autonomie
const calculateRange = (full_kwh) => {
  return Math.round(full_kwh);
};

// Fonction pour récupérer la liste des véhicules
export const getVehicleList = async ({ page = 0, size = 10, search = '' }) => {
  try {
    const response = await client
      .query(vehicleListQuery, { page, size, search })
      .toPromise();

    if (response.error) {
      throw new Error(response.error.message);
    }

    // Ajouter l'autonomie à chaque véhicule
    const vehiclesWithRange = response.data.vehicleList.map((vehicle) => {
      const usableKwh = vehicle.battery?.usable_kwh || 0;
      const range = calculateRange(usableKwh);
      return {
        ...vehicle,
        range, 
      };
    });

    return vehiclesWithRange || [];
  } catch (error) {
    console.error('GraphQL query error:', error.message);
    throw error;
  }
};