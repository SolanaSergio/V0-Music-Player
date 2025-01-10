# Development Workflow

## Project Context Management

### Before Starting Work
1. Check relevant documentation:
   - `debugging-log.md` for known issues
   - `dependencies.md` for package status
   - `project-structure.md` for file locations

2. Update the documentation if:
   - Starting new feature
   - Finding new bug
   - Making architectural decisions
   - Adding dependencies

## Common Workflows

### Adding New Features
1. Document in `development-notes.md`:
   - Feature description
   - Technical approach
   - Dependencies needed
2. Update `components.md` if adding new components
3. Update `project-structure.md` if adding new directories

### Fixing Bugs
1. Add to `debugging-log.md`:
   - Error description
   - Steps to reproduce
   - Impact assessment
2. Update once fixed:
   - Solution implemented
   - Files changed
   - Testing done

### Dependency Management
1. Check `dependencies.md` before adding packages
2. Document any conflicts or issues
3. Test compatibility with existing packages
4. Update documentation after changes

## Best Practices

### Code Organization
- Keep related files close together
- Use consistent naming conventions
- Document complex logic
- Add TypeScript types for all new code

### Documentation Updates
- Keep docs up to date with code changes
- Include examples for complex features
- Document breaking changes
- Update README for major changes

### Testing
- Add tests for new features
- Update tests for bug fixes
- Document test coverage
- Include edge cases 