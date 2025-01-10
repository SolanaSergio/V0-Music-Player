# Prompt Guide

## Effective Prompt Structure

### Basic Format
```markdown
Task: [Brief description of what needs to be done]
Context: [Any relevant background information]
Location: [File paths or areas of the code involved]
Expected Outcome: [What success looks like]
```

### Additional Context Helpers
- **File Changes**: Mention if you've modified any files recently
- **Error Messages**: Include full error text if applicable
- **Current State**: Describe what you're currently working on
- **Dependencies**: List any related features or components

## Quick Reference Tags
Use these tags in your prompts for faster context:

- `#bug` - Bug fixes needed
- `#feature` - New feature request
- `#refactor` - Code improvement request
- `#style` - UI/styling changes
- `#deps` - Dependency issues
- `#doc` - Documentation needs

## Examples

### Good Prompt:
```markdown
Task: Fix login button not responding
Context: After recent React update
Location: components/auth/LoginButton.tsx
Expected Outcome: Button clicks should trigger login
#bug
```

### Better With Details:
```markdown
Task: Fix login button not responding
Context: 
- After React 18 update
- Console shows TypeError
- Only happens on Chrome
Location: components/auth/LoginButton.tsx
Expected Outcome:
- Button responds to clicks
- No console errors
- Works across browsers
#bug
``` 