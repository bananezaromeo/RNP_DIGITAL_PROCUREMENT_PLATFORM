const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RNP-DPAMIS API",
      version: "1.1.0",
      description: "API documentation for DPAMIS project. Routes are filtered by user roles: Supplier, District Admin, Region HQ, Procurement HQ.",
    },
    servers: [
      { url: "http://localhost:4000" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            fullName: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ['supplier','district','region','hq','station'] },
            status: { type: "string", enum: ['pending','approved','rejected'] },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js"], // all routes will have Swagger comments
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};

module.exports = { swaggerUi, specs, setupSwagger };
