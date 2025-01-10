# Dependencies Management

## Current Dependencies Overview
- Next.js 14.2.16
- React 18
- TypeScript 5
- Tailwind CSS
- Multiple Radix UI components

## Known Dependency Issues

### 2024-01-10: date-fns Version Conflict
**Status**: Pending Resolution
**Issue**: Dependency conflict between date-fns and react-day-picker
- Current: date-fns@4.1.0
- Required by react-day-picker: date-fns@^2.28.0 || ^3.0.0
- Impact: npm install failing

**Proposed Solutions**:
1. Downgrade date-fns to version 3.x.x (Recommended)
2. Use --legacy-peer-deps flag (Not recommended for long term)
3. Use --force flag (Not recommended)

## Critical Dependencies
```json
{
  "next": "14.2.16",
  "react": "^18",
  "react-dom": "^18",
  "typescript": "^5",
  "date-fns": "4.1.0",
  "react-day-picker": "8.10.1"
}
```

## UI Component Libraries
- Radix UI (Multiple components)
- Tailwind CSS
- Framer Motion

## Development Dependencies
- TypeScript
- PostCSS
- Tailwind CSS
- Node types 