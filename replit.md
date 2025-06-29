# Pixel Pets Game

## Project Overview
A cutting-edge pixel pet creation and adventure game that combines AI technologies with innovative gameplay mechanics. Built with React frontend, Express backend, and powered by OpenAI DALL-E 3 and Google Gemini AI.

## Key Technologies
- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: 
  - OpenAI DALL-E 3 for HD pet image generation
  - Google Gemini AI for intelligent exploration and pet personalities
- **Authentication**: Replit Auth integration
- **Real-time Features**: WebSocket support for interactive gameplay

## Core Features
- **Pet Creation**: AI-generated unique pets with procedural traits and DALL-E 3 images
- **Breeding System**: Genetic trait inheritance between parent pets with offspring generation
- **Exploration**: AI-powered dynamic encounters and environmental exploration
- **Crafting System**: Item creation and pet equipment mechanics
- **Battle System**: Pet combat with strategic elements
- **Trading**: Player-to-player pet and item exchanges
- **Pet Interactions**: AI-driven pet personality responses using Gemini
- **Progression**: Leveling, achievements, and game state persistence

## Recent Changes (December 2024)
- ✅ Fixed server startup port conflicts and process management
- ✅ Implemented DALL-E 3 integration with HD quality image generation
- ✅ Created comprehensive breeding system with genetic trait inheritance
- ✅ Added breeding sessions database table for proper persistence
- ✅ Enhanced pet generation with deterministic hash-based traits
- ✅ Updated storage interface with breeding operations
- ✅ Fixed image proxy authentication issues for expired DALL-E URLs
- ✅ Implemented breeding offspring generation with parent trait mixing

## Project Architecture

### Database Schema
- **Users**: Authentication and profile management
- **Pets**: Core pet data with attributes, stats, and relationships
- **Breeding Sessions**: Genetic breeding mechanics and offspring tracking
- **Inventory**: Item management system
- **Crafting**: Recipes, queue, and crafted items
- **Game State**: User progress and settings
- **Exploration/Battle Logs**: Activity tracking

### API Structure
- `/api/auth/*` - User authentication
- `/api/pets/*` - Pet management and generation
- `/api/breeding/*` - Breeding system endpoints
- `/api/exploration/*` - Adventure and encounter mechanics
- `/api/crafting/*` - Item creation and management
- `/api/inventory/*` - Item storage and management

### AI Integration
- **DALL-E 3**: High-quality pet image generation with enhanced prompts
- **Gemini AI**: Pet personality development and exploration narratives
- **Breeding Logic**: Genetic trait inheritance algorithms

## Development Setup
1. Install dependencies: `npm install`
2. Set up PostgreSQL database
3. Configure environment variables:
   - `OPENAI_API_KEY` - For DALL-E 3 image generation
   - `GOOGLE_AI_API_KEY` - For Gemini AI features
   - `DATABASE_URL` - PostgreSQL connection
4. Run database migrations: `npm run db:push`
5. Start development server: `npm run dev`

## User Preferences
- Focus on comprehensive solutions over quick fixes
- Prioritize AI-powered features and user experience
- Maintain clean, type-safe code architecture
- Emphasize real-time interactive gameplay elements

## Technical Decisions
- **December 2024**: Migrated from game state storage to dedicated breeding sessions table for better data integrity
- **December 2024**: Enhanced DALL-E 3 integration with base64 conversion to resolve authentication issues
- **December 2024**: Implemented genetic breeding algorithms for trait inheritance between parent pets

## Deployment
- Built for Replit deployment with automatic scaling
- Production build: `npm run build`
- Environment configured for PostgreSQL and AI service integration