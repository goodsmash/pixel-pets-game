# Contributing to Pixel Pets

Thank you for your interest in contributing to Pixel Pets! This document provides guidelines for contributing to the project.

## Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
```bash
git clone https://github.com/yourusername/pixel-pets.git
cd pixel-pets
```

3. Install dependencies:
```bash
npm install
```

4. Set up environment variables (see DEPLOYMENT.md)

5. Start the development server:
```bash
npm run dev
```

## Code Style

- Use TypeScript for all new code
- Follow existing code formatting patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure type safety

## Database Changes

When making database schema changes:

1. Update `shared/schema.ts`
2. Generate migration: `npm run db:generate`
3. Test migration locally: `npm run db:migrate`
4. Include migration files in your PR

## AI Integration Guidelines

When working with AI features:

- Test with valid API keys
- Handle API failures gracefully
- Implement proper rate limiting
- Cache responses when appropriate
- Document prompt engineering decisions

## Testing

- Test all new features thoroughly
- Verify database operations work correctly
- Test with different pet combinations
- Ensure breeding and battle mechanics function properly

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and test thoroughly
3. Commit with clear messages: `git commit -m "Add feature: description"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Create a Pull Request on GitHub

## Bug Reports

When reporting bugs, include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/environment details
- Console errors if any

## Feature Requests

For new features:

- Describe the feature clearly
- Explain the use case
- Consider implementation complexity
- Discuss how it fits with existing features

## Code Review

All contributions require code review:

- Address reviewer feedback promptly
- Keep discussions professional
- Be open to suggestions
- Test requested changes

## License

By contributing, you agree that your contributions will be licensed under the MIT License.