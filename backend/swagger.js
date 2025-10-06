const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RNP-DPAMIS API",
      version: "1.0.0",
      description: "API documentation for dpamis project",
    },
    servers: [
      { url: "http://localhost:4000" },
    ],
  },
  apis: ["./routes/*.js"], // important: path to route files with Swagger comments
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
