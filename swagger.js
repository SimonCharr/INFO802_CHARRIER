import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';


const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'External API',
    version: '1.0.0',
    description: 'API externe qui appelle directement GraphQL, cartography, IRVE, SOAP, etc.',
  },
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js',
    './server.js',
    './soap.js'
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
