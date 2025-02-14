// soap.js
import soap from 'soap';
import { createServer } from 'http';
import { readFileSync } from "fs";
import axios from 'axios';

/**
 * 1. WSDL (XML) décrivant le service SOAP
 */
const wsdl = `
<definitions name="TripService"
             targetNamespace="http://example.com/tripService"
             xmlns="http://schemas.xmlsoap.org/wsdl/"
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
             xmlns:tns="http://example.com/tripService"
             xmlns:xsd="http://www.w3.org/2001/XMLSchema">
             
  <types>
    <xsd:schema targetNamespace="http://example.com/tripService">
      <xsd:element name="calculateTripTimeRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="distance" type="xsd:double"/>
            <xsd:element name="autonomy" type="xsd:double"/>
            <xsd:element name="chargingTime" type="xsd:double"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>

      <xsd:element name="calculateTripTimeResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="tripTime" type="xsd:double"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
    </xsd:schema>
  </types>

  <message name="calculateTripTimeRequest">
    <part name="parameters" element="tns:calculateTripTimeRequest"/>
  </message>
  <message name="calculateTripTimeResponse">
    <part name="parameters" element="tns:calculateTripTimeResponse"/>
  </message>

  <portType name="TripServicePortType">
    <operation name="calculateTripTime">
      <input message="tns:calculateTripTimeRequest"/>
      <output message="tns:calculateTripTimeResponse"/>
    </operation>
  </portType>

  <binding name="TripServiceBinding" type="tns:TripServicePortType">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="calculateTripTime">
      <soap:operation soapAction="http://example.com/tripService#calculateTripTime"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
  </binding>

  <service name="TripService">
    <documentation>Service SOAP pour calculer un temps de trajet</documentation>
    <port name="TripServicePort" binding="tns:TripServiceBinding">
      <soap:address location="http://localhost:3000/wsdl"/>
    </port>
  </service>
</definitions>
`;

/**
 * 2. Implémentation du service SOAP
 */
const tripService = {
  TripService: {
    TripServicePort: {
      /**
       * distance (km), autonomy (km), chargingTime (minutes)
       * On suppose une vitesse de 100 km/h et on calcule le nb de recharges
       */
      calculateTripTime: ({ distance, autonomy, chargingTime }) => {
        const speed = 100; // km/h

        // Durée de conduite (en heures)
        const drivingTime = distance / speed;

        // Nombre de recharges (ex: 300km / 200km => 1 recharge)
        const nbRecharges = Math.floor(distance / autonomy);

        // chargingTime est en minutes, on convertit en heures
        const chargingTimeHours = chargingTime / 60;

        // Temps total
        const totalTime = drivingTime + nbRecharges * chargingTimeHours;

        return {
          tripTime: totalTime,
        };
      },
    },
  },
};

/**
 * 3. Fonction pour initialiser le serveur SOAP
 *    - On crée un serveur HTTP basé sur l'app Express existante
 *    - On "écoute" sur /wsdl
 *    - On peut retourner le server pour le lancer manuellement, OU
 *      on lance directement .listen() si tu préfères.
 */
export function initializeSoapService(server,app,port) {
  soap.listen(server, "/wsdl", tripService, wsdl, () => {
    console.log(`SOAP service running at http://localhost:3000}/wsdl?wsdl`);
  });

  // 2) Attacher le service SOAP à /wsdl
  soap.listen(server, '/wsdl', tripService, wsdl, () => {
    console.log(`SOAP service running at http://localhost:3000/wsdl?wsdl`);
  });

  /**
 * @swagger
 * tags:
 *   name: Trip
 *   description: Calcul du temps de trajet via le service SOAP
 */

/**
 * @swagger
 * /api/trip-time:
 *   get:
 *     summary: Calcule le temps de trajet
 *     description: Calcule le temps de trajet en fonction de la distance, de l'autonomie et du temps de charge via un service SOAP.
 *     tags: [Trip]
 *     parameters:
 *       - in: query
 *         name: distance
 *         schema:
 *           type: number
 *         required: true
 *         description: Distance totale en km
 *       - in: query
 *         name: autonomy
 *         schema:
 *           type: number
 *         required: true
 *         description: Autonomie en km
 *       - in: query
 *         name: chargingTime
 *         schema:
 *           type: number
 *         required: true
 *         description: Temps pour une recharge complète (minutes)
 *     responses:
 *       200:
 *         description: Retourne le temps de trajet
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tripTime:
 *                   type: number
 *                   description: Durée du trajet en heures (décimales)
 *       400:
 *         description: Paramètres invalides ou manquants
 *       500:
 *         description: Erreur interne lors de l'appel SOAP
 */
  app.get('/api/trip-time', async (req, res) => {
    try {
      const distance = parseFloat(req.query.distance);
      const autonomy = parseFloat(req.query.autonomy);
      const chargingTime = parseFloat(req.query.chargingTime);

      if (isNaN(distance) || isNaN(autonomy) || isNaN(chargingTime)) {
        return res
          .status(400)
          .json({ error: 'distance, autonomy et chargingTime doivent être des nombres' });
      }

      // Créer un client SOAP pour appeler calculateTripTime
      const client = await soap.createClientAsync(`http://localhost:3000/wsdl?wsdl`);
      const [result] = await client.calculateTripTimeAsync({ distance, autonomy, chargingTime });
      // result = { tripTime: X }

      res.json({ tripTime: result.tripTime });
    } catch (error) {
      console.error('Erreur /api/trip-time:', error);
      res.status(500).json({ error: 'Erreur lors du calcul du temps de trajet' });
    }
  });
}
