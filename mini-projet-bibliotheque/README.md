# Mini projet Node.js - Bibliotheque

## Stack
- Express.js
- dotenv
- better-sqlite3
- Prisma (client + migrations)
- Zod (validation des payloads)

## Installation
```bash
npm install
```

## Lancer le serveur
```bash
npm start
```

## Scripts Prisma
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

Le serveur demarre sur `http://localhost:3000`.

## Routes
- `GET /bibliotheque` : renvoie tous les livres (`findAll()`)
- `GET /bibliotheque/:id` : renvoie un livre par id (`findById()`)
- `POST /bibliotheque` : cree un livre (`create()`)

## Exemple de creation
```bash
curl -X POST http://localhost:3000/bibliotheque \
  -H "Content-Type: application/json" \
  -d '{"titre":"Node.js Design Patterns","auteur":"Mario Casciaro","annee":2020}'
```
