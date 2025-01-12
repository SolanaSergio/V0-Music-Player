# Documentation Maintenance Guide

## Core Principles

1. **Accuracy First**
   - Always verify against actual codebase
   - Never document hypothetical features
   - Update documentation when code changes
   - Remove outdated information immediately

2. **Consistency Check Order**
   1. Check actual implementation in code
   2. Verify types and interfaces
   3. Test functionality if possible
   4. Update related documentation files

3. **Documentation Structure**
   - Each doc file should have a clear purpose
   - Use consistent headers and sections
   - Include examples from actual code
   - Link related documentation

## File-Specific Rules

### 1. Component Documentation
```markdown
# Component Name

## Interface
[Actual TypeScript interface]

## Features
- Feature 1: Brief description
- Feature 2: Brief description

## Usage Example
[Real code example from codebase]

## Implementation Notes
[Key technical details]
```

### 2. API Documentation
```markdown
# API Endpoint

## Request
- Method
- Path
- Parameters
- Headers

## Response
- Status codes
- Response body
- Error formats

## Example
[Real request/response example]
```

### 3. Type Definitions
```markdown
# Type Name

## Definition
[Actual TypeScript definition]

## Usage Context
[Where and how it's used]

## Related Types
[List related types]
```

## Update Procedures

### 1. Code Changes
1. Identify affected documentation files
2. Check actual implementation
3. Update interfaces and types
4. Update examples
5. Update related docs
6. Verify consistency

### 2. New Features
1. Create documentation template
2. Fill with actual implementation
3. Add to relevant indexes
4. Link from related docs
5. Add examples from real code

### 3. Dependency Updates
1. Update dependencies.md
2. Check for breaking changes
3. Update affected documentation
4. Update troubleshooting guides

## Content Rules

### 1. Code Examples
- Must be from actual codebase
- Must be complete and working
- Must include imports
- Must show context

### 2. Type Definitions
- Must match actual types
- Must include all properties
- Must document optionals
- Must link related types

### 3. API Documentation
- Must match actual endpoints
- Must include all parameters
- Must document errors
- Must include security notes

### 4. Component Documentation
- Must match actual props
- Must document events
- Must include accessibility
- Must note performance considerations

## Maintenance Checklist

### Daily
- [ ] Check for code changes
- [ ] Update affected docs
- [ ] Verify examples work

### Weekly
- [ ] Full consistency check
- [ ] Update dependencies
- [ ] Check for outdated info

### Monthly
- [ ] Complete documentation review
- [ ] Update best practices
- [ ] Refresh examples

## Quality Standards

### 1. Clarity
- Use consistent terminology
- Explain complex concepts
- Include diagrams when helpful
- Use proper formatting

### 2. Completeness
- Cover all features
- Document edge cases
- Include error handling
- Note limitations

### 3. Accuracy
- Match actual code
- Test examples
- Verify interfaces
- Check links

### 4. Organization
- Clear hierarchy
- Logical grouping
- Easy navigation
- Consistent structure

## Response Format

### 1. When Updating Docs
```markdown
I will update [file] because:
1. [Reason 1]
2. [Reason 2]

Changes to make:
1. [Change 1]
2. [Change 2]

Related files to check:
- [File 1]
- [File 2]
```

### 2. When Creating Docs
```markdown
I will create [file] to document:
1. [Purpose 1]
2. [Purpose 2]

Structure will be:
1. [Section 1]
2. [Section 2]

Will reference:
- [Reference 1]
- [Reference 2]
```

### 3. When Reviewing Docs
```markdown
Reviewing [file]:
✓ [Check passed]
⚠ [Needs update]
✗ [Incorrect/outdated]

Actions needed:
1. [Action 1]
2. [Action 2]
```

## Error Prevention

### 1. Before Updates
- Check current implementation
- Verify dependencies
- Test code examples
- Check related docs

### 2. During Updates
- Follow templates
- Use consistent formatting
- Include all required sections
- Cross-reference changes

### 3. After Updates
- Verify changes
- Test examples
- Check links
- Update indexes

## Version Control

### 1. Commit Messages
```
docs(scope): action description

- Detail 1
- Detail 2

Related: #issue
```

### 2. Change Tracking
- Note major changes
- Track breaking changes
- Update change logs
- Mark deprecated features 

## Human-Centric Approaches

### 1. Incremental Development
- Break large tasks into smaller, manageable chunks
- Focus on one component/feature at a time
- Test each piece before moving to the next
- Document progress and roadblocks as you go

### 2. Research and Learning
- Start with what you know
- Document what you don't know
- Research one topic at a time
- Keep notes of useful resources and solutions
- Document learnings for future reference

### 3. Revision Over Duplication
- Always search for existing documentation first
- Update existing files instead of creating new ones
- Keep a change history within the documentation
- Mark outdated sections for review
- Remove duplicate information

### 4. Note-Taking Practices
```markdown
### Working Notes Template
Current Task: [Task Name]
Status: [In Progress/Blocked/Done]

Questions to Answer:
- [ ] Question 1
- [ ] Question 2

Research Needed:
- [ ] Topic 1
- [ ] Topic 2

Dependencies:
- Dependency 1 (status)
- Dependency 2 (status)

Progress:
- [x] Step 1 completed
- [ ] Step 2 in progress
- [ ] Step 3 blocked by [reason]
```

### 5. Progressive Documentation
- Start with rough notes
- Refine as understanding improves
- Update based on implementation experience
- Include practical examples from actual use
- Document gotchas and lessons learned

### 6. Context Preservation
- Keep track of why decisions were made
- Document alternative approaches considered
- Note environmental factors affecting choices
- Record assumptions and prerequisites
- Update when assumptions change

### 7. Error Recovery
- Document mistakes and their solutions
- Keep track of failed approaches
- Note debugging steps that worked
- Create troubleshooting guides from experience
- Update documentation with prevention steps

### 8. Knowledge Building
```markdown
### Learning Log Template
Topic: [Topic Name]
Date: [YYYY-MM-DD]

What I Knew:
- Previous knowledge point 1
- Previous knowledge point 2

What I Learned:
- New learning 1
- New learning 2

Resources Used:
- Resource 1: [Link/Reference]
- Resource 2: [Link/Reference]

Applied In:
- Component/Feature where this was used
- How it was implemented

Future Reference:
- When to use this
- When not to use this
```

### 9. Task Management
```markdown
### Task Breakdown Template
Main Goal: [Goal Description]

Subtasks:
1. [ ] Subtask 1
   - [ ] Step 1.1
   - [ ] Step 1.2
2. [ ] Subtask 2
   - Dependencies: [List]
   - Blockers: [List]

Research Required:
- [ ] Research topic 1
- [ ] Research topic 2

Documentation Updates:
- [ ] Update file 1
- [ ] Update file 2
```

### 10. Review and Reflection
- Regular review of documentation
- Mark areas needing clarification
- Note patterns and common issues
- Document lessons learned
- Update best practices based on experience 

## Decision Making Process

### 1. Before Making Changes
```markdown
### Change Assessment
Impact Level: [High/Medium/Low]
Risk Level: [High/Medium/Low]

Current State:
- What exists now
- What's working
- What's problematic

Proposed Change:
- What needs to change
- Why it needs to change
- Expected benefits

Alternatives Considered:
1. Option 1
   - Pros:
   - Cons:
2. Option 2
   - Pros:
   - Cons:
```

### 2. Prioritization Framework
- Is this blocking other work?
- Does it affect multiple components?
- Is it a security concern?
- Is it a performance issue?
- Is it a user-facing issue?

## Communication Patterns

### 1. Status Updates
```markdown
### Quick Status
🟢 On Track
🟡 Minor Issues
🔴 Blocked

Current Focus:
- What I'm working on now
- What's coming next
- What's blocking me

Need Help With:
- Specific questions
- Required reviews
- Technical blockers
```

### 2. Handoff Notes
```markdown
### Work Handoff
Last Action Taken:
- What was done
- Where to find it
- Current status

Next Steps:
- What needs to be done
- Important considerations
- Potential issues

Context Links:
- Related PRs
- Documentation
- Discussions
```

## Practical Workflows

### 1. Daily Routine
1. Check existing documentation for updates
2. Review ongoing tasks and their status
3. Update progress in relevant docs
4. Document any new learnings
5. Flag items needing attention

### 2. Problem-Solving Flow
1. Check debugging-log.md for similar issues
2. Search existing documentation
3. Document new problem if not found
4. Research and test solutions
5. Update documentation with findings

### 3. Code Review Checklist
- [ ] Documentation matches implementation
- [ ] All changes are documented
- [ ] Examples are updated
- [ ] Breaking changes are noted
- [ ] Dependencies are documented

## Time Management

### 1. Task Prioritization
```markdown
### Priority Matrix
Urgent & Important:
- Critical bugs
- Blocking issues

Important, Not Urgent:
- Documentation updates
- Performance improvements

Urgent, Not Important:
- Minor fixes
- Small updates

Neither Urgent Nor Important:
- Nice-to-have features
- Non-critical updates
```

### 2. Time Allocation
- 15% Research and planning
- 40% Implementation
- 20% Testing and validation
- 25% Documentation and review 