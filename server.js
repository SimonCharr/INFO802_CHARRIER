import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'; 
import chargerRoutes from './routes/chargers.js';
import { getVehicleList } from './routes/graphQLClient.js';
import { initializeSoapService } from './soap.js';
import { setupSwagger} from './swagger.js';
import swaggerUi from 'swagger-ui-express';

const app = express();
app.use(bodyParser.json());
app.use(cors()); 

setupSwagger(app);


/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: Récupération de la liste des véhicules (via l'API GraphQL)
 */

/**
 * @swagger
 * /vehicles:
 *   get:
 *     summary: Liste tous les véhicules
 *     description: Appelle l'API GraphQL pour récupérer les informations des véhicules (marque, modèle, batterie, etc.).
 *     tags: [Vehicles]
 *     responses:
 *       200:
 *         description: Tableau de véhicules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   naming:
 *                     type: object
 *                     properties:
 *                       make:
 *                         type: string
 *                       model:
 *                         type: string
 *                       chargetrip_version:
 *                         type: string
 *                   battery:
 *                     type: object
 *                     properties:
 *                       usable_kwh:
 *                         type: number
 *                       full_kwh:
 *                         type: number
 *       500:
 *         description: Erreur serveur (API GraphQL inaccessible, par exemple)
 */
app.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await getVehicleList({ page: 0, size: 10, search: '' });
    res.status(200).json(vehicles); // Renvoie la liste brute des véhicules
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving vehicles', error: error.message });
  }
});

/**
 * @swagger
 * tags:
 *   name: Chargers
 *   description: Récupération de la liste des bornes de recharge
 */

/**
 * @swagger
 * /chargers:
 *   get:
 *     summary: Liste toutes les bornes de recharge
 *     description: Récupère les stations de recharge à proximité d'une position (lat, lon) en interrogeant l'API IRVE.
 *     tags: [Chargers]
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         required: true
 *         description: Latitude de la position
 *       - in: query
 *         name: lon
 *         schema:
 *           type: number
 *         required: true
 *         description: Longitude de la position
 *     responses:
 *       200:
 *         description: Tableau de stations de charge
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   operator:
 *                     type: string
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *                   charging_type:
 *                     type: string
 *                   power_max:
 *                     type: string
 *                   distance:
 *                     type: string
 *       400:
 *         description: Paramètres lat/lon manquants
 *       500:
 *         description: Erreur lors de la récupération des bornes
 */
app.use('/chargers', chargerRoutes);

// Route par défaut
app.get('/', (req, res) => {
  res.send('Welcome');
});

// Démarre le serveur
const PORT = 3000;
// 1) Créer le serveur Express
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// 2) Initialiser le service SOAP
initializeSoapService(server,app,PORT);
