# 🐾 Pixel Pets Game

A cutting-edge pixel pet creation and adventure game that combines AI technologies with innovative gameplay mechanics.

![Pixel Pets](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)

## 🚀 Features

### 🎨 AI-Powered Pet Generation
- **DALL-E 3 Integration**: High-quality, unique pet images generated in real-time
- **Procedural Traits**: Deterministic pet attributes based on cryptographic hashing
- **Genetic Diversity**: Thousands of possible combinations of colors, types, elements, and abilities

### 🧬 Advanced Breeding System
- **Genetic Inheritance**: Offspring inherit traits from both parents
- **Trait Mixing**: Complex algorithms determine color, element, and ability combinations
- **Rarity Evolution**: Chance for offspring to have higher rarity than parents
- **Generation Tracking**: Family lineage and breeding history

### 🗺️ Dynamic Exploration
- **AI-Generated Encounters**: Google Gemini AI creates unique exploration scenarios
- **Environmental Variety**: Multiple biomes with distinct challenges and rewards
- **Intelligent Narratives**: Context-aware story generation based on pet attributes

### ⚔️ Strategic Combat
- **Turn-Based Battles**: Tactical combat system with elemental advantages
- **Pet Abilities**: Unique skills based on pet type and rarity
- **Equipment System**: Craftable items that enhance pet performance

### 🔧 Comprehensive Crafting
- **Recipe Discovery**: Unlock new crafting recipes through exploration
- **Material Gathering**: Collect resources from various environments
- **Equipment Creation**: Craft weapons, armor, and accessories for pets

### 🤝 Social Features
- **Pet Trading**: Exchange pets and items with other players
- **Friend System**: Connect with other pet trainers
- **Achievement Sharing**: Showcase rare pets and accomplishments

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Tailwind CSS** for modern, responsive styling
- **shadcn/ui** for consistent component library
- **TanStack Query** for efficient data fetching and caching
- **Wouter** for lightweight client-side routing

### Backend
- **Express.js** with TypeScript for robust API development
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** for reliable data persistence
- **WebSocket** support for real-time features

### AI Integration
- **OpenAI DALL-E 3** for HD pet image generation
- **Google Gemini AI** for intelligent game narratives
- **Custom algorithms** for genetic breeding and trait inheritance

### Development Tools
- **Vite** for fast development and building
- **ESBuild** for optimized production builds
- **TypeScript** for enhanced code reliability
- **Drizzle Kit** for database migrations

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 20 or higher
- PostgreSQL database
- OpenAI API key (for DALL-E 3)
- Google AI API key (for Gemini)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/goodsmash/pixel-pets-game.git
   cd pixel-pets-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/pixelpets
   OPENAI_API_KEY=sk-your-openai-api-key
   GOOGLE_AI_API_KEY=your-google-ai-api-key
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5000`

## 🎮 How to Play

### Getting Started
1. **Create Your First Pet**: Generate a unique pet with AI-powered traits
2. **Explore Environments**: Venture into different biomes to find resources and encounters
3. **Battle Wild Creatures**: Test your pet's abilities in strategic combat
4. **Collect Materials**: Gather resources for crafting equipment
5. **Breed New Generations**: Combine pets to create offspring with inherited traits

### Advanced Gameplay
- **Optimize Stats**: Use crafted equipment to enhance pet performance
- **Build Collections**: Discover rare pets with unique abilities
- **Master Breeding**: Create legendary pets through strategic genetic combinations
- **Trade with Players**: Exchange pets and items with the community

## 📊 Game Mechanics

### Pet Attributes
- **Primary Stats**: Attack, Defense, Speed, Intelligence, Luck
- **Visual Traits**: Color, Size, Pattern, Aura, Eye Type, Wing Type
- **Special Features**: Unique abilities and characteristics
- **Elemental Affinity**: Fire, Water, Earth, Air, and exotic elements

### Rarity System
- **Common**: Basic pets with standard abilities
- **Uncommon**: Enhanced stats and features
- **Rare**: Unique visual traits and improved abilities
- **Epic**: Powerful abilities and striking appearances
- **Legendary**: Exceptional pets with rare combinations
- **Mythical**: Ultra-rare pets with extraordinary features
- **Transcendent**: The rarest pets with cosmic powers

### Breeding Mechanics
- **Parent Selection**: Choose two compatible pets for breeding
- **Gestation Period**: 24-hour breeding cycles
- **Trait Inheritance**: Complex algorithms determine offspring characteristics
- **Genetic Surprises**: Chance for mutations and rarity upgrades

## 🔧 Development

### Project Structure
```
pixel-pets-game/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Express backend
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database operations
│   ├── geminiGenerator.ts # Pet generation logic
│   └── openaiGenerator.ts # Image generation
├── shared/                # Shared TypeScript types
│   └── schema.ts          # Database schema
└── package.json
```

### Key Components
- **Pet Generation**: Deterministic trait creation using cryptographic hashing
- **Image Generation**: DALL-E 3 integration with optimized prompts
- **Breeding Logic**: Genetic algorithms for trait inheritance
- **Database Layer**: Type-safe operations with Drizzle ORM

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Push database schema changes
npm run check        # TypeScript type checking
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Guidelines
1. Follow TypeScript best practices
2. Maintain test coverage for new features
3. Use conventional commit messages
4. Update documentation for API changes

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for DALL-E 3 image generation capabilities
- **Google** for Gemini AI narrative generation
- **Replit** for the development platform and deployment infrastructure
- **Community Contributors** for feedback and feature suggestions

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/goodsmash/pixel-pets-game/issues)
- **Discussions**: [GitHub Discussions](https://github.com/goodsmash/pixel-pets-game/discussions)
- **Documentation**: [Project Wiki](https://github.com/goodsmash/pixel-pets-game/wiki)

---

Made with ❤️ by the Pixel Pets development team