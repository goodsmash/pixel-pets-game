# Deployment Guide

## GitHub Repository Setup

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `pixel-pets-game` or your preferred name
3. Don't initialize with README (we already have one)
4. Copy the repository URL

### 2. Push to GitHub

Since this is a Replit project, follow these steps to push to GitHub:

1. Open the Shell in Replit
2. Add your GitHub repository as the remote origin:
```bash
git remote add origin https://github.com/yourusername/pixel-pets-game.git
```

3. Add all files to git:
```bash
git add .
```

4. Commit your changes:
```bash
git commit -m "Initial commit: Pixel Pets AI-powered game"
```

5. Push to GitHub:
```bash
git push -u origin main
```

## Environment Variables

When deploying to other platforms, ensure these environment variables are set:

### Required Variables
```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# AI APIs
OPENAI_API_KEY=sk-your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key

# Authentication (for Replit)
REPLIT_DOMAINS=your-domain.replit.app
SESSION_SECRET=your-secure-session-secret
REPL_ID=your-repl-id
ISSUER_URL=https://replit.com/oidc

# Database Connection Details
PGHOST=your-postgres-host
PGPORT=5432
PGUSER=your-postgres-user
PGPASSWORD=your-postgres-password
PGDATABASE=your-database-name
```

## Platform-Specific Deployment

### Vercel
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables in Vercel dashboard

### Netlify
1. Connect GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in Netlify settings

### Railway
1. Connect GitHub repository to Railway
2. Railway will auto-detect the build configuration
3. Add environment variables in Railway dashboard
4. Provision PostgreSQL database

### Heroku
1. Create new Heroku app
2. Connect to GitHub repository
3. Add Heroku Postgres addon
4. Set environment variables in Heroku settings
5. Deploy from GitHub

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/pixelpets
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: pixelpets
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Database Setup

### PostgreSQL Schema
The application uses Drizzle ORM with the following tables:
- users (authentication)
- sessions (session storage)
- pets (pet data)
- inventory_items (user inventory)
- exploration_logs (exploration history)
- battle_logs (battle history)
- game_states (user game state)
- crafting_recipes (crafting system)
- crafted_items (user crafted items)
- crafting_queue (crafting progress)

### Migration Commands
```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# View database in Drizzle Studio
npm run db:studio
```

## Security Considerations

1. **Never commit environment variables** - Use .env files locally and platform environment variable settings
2. **Session Security** - Use a strong SESSION_SECRET in production
3. **Database Security** - Use SSL connections for production databases
4. **API Rate Limiting** - Consider implementing rate limiting for API endpoints
5. **CORS Configuration** - Configure CORS properly for your domain

## Performance Optimization

1. **Database Indexing** - Ensure proper indexes on frequently queried columns
2. **Image Optimization** - Implement image caching for DALL-E generated images
3. **CDN Usage** - Use a CDN for static assets
4. **Database Connection Pooling** - Configure proper connection limits
5. **Caching** - Implement Redis or memory caching for frequently accessed data

## Monitoring

Consider adding:
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Uptime monitoring (Pingdom)
- Database monitoring
- API usage tracking

## Backup Strategy

1. **Database Backups** - Set up automated database backups
2. **Code Repository** - Ensure GitHub repository is your source of truth
3. **Environment Variables** - Keep secure backup of environment configurations
4. **AI Generated Content** - Consider backing up generated pet images

## Support

For deployment issues:
1. Check the logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure database connectivity
4. Test API key validity
5. Check platform-specific documentation