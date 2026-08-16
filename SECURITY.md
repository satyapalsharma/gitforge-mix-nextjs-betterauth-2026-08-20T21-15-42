# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| 0.x     | :x:                |

## Reporting a Vulnerability

We take the security of TaskFlow seriously. If you discover a security vulnerability, please follow these steps:

1. **Do NOT** open a public GitHub issue for security vulnerabilities.

2. **Email us directly** at security@example.com with:
   - A description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact of the vulnerability
   - Any suggested fixes (if available)

3. **Wait for a response**. We will acknowledge receipt of your report within 48 hours and provide a detailed response within 7 days indicating the next steps.

4. **Keep it confidential**. Please do not disclose the vulnerability publicly until we have had a chance to address it.

## Security Best Practices

When contributing, please ensure:

- No secrets or credentials are committed to the repository
- Dependencies are kept up to date
- Input validation is performed on all user inputs
- Authentication and authorization checks are properly implemented
- SQL injection is prevented through parameterized queries
- XSS vulnerabilities are mitigated by proper output encoding
