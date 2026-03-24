const swaggerJsdoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Bibliotheque",
      version: "1.0.0",
      description: "Mini projet bibliotheque"
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 3000}` }]
  },
  apis: ["./src/server.js"]
});

module.exports = swaggerSpec;
