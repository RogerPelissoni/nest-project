# Reset Everything

- Stop Docker Compose
  - docker compose down
- Remove MySQL volumes
  - sudo rm -rf ../newstack-database
- Delete old migrations
  - sudo rm -rf ../nest-project/prisma/migrations
- Start Docker Compose
  - docker compose up -d --build
- Create a new migration
  - docker compose exec backend npx prisma migrate dev --name init
- Seed the database
  - docker compose exec backend pnpm prisma:seed
