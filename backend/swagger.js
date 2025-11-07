const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "RNP-DPAMIS API",
      version: "1.2.0",
      description: "API documentation for DPAMIS project. Routes are filtered by user roles: Supplier, District Admin, Region HQ, Procurement HQ.",
    },
    servers: [
      { url: "http://localhost:4000", description: "Local server" },
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
            id: { type: "string", example: "64f6e5f8abc12345def67890" },
            fullName: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            role: { type: "string", enum: ['supplier','district','region','hq','station'], example: "supplier" },
            status: { type: "string", enum: ['pending','approved','rejected'], example: "pending" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Error description" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js"], // reads all routes for Swagger comments
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};

module.exports = { swaggerUi, specs, setupSwagger };
