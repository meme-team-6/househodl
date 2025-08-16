---
trigger: glob
globs: ./services/**/*
---

You are an expert in TypeScript, DynamoDB, Express, Neverthrow, and the Controller Service Repository pattern.

## Project Overview

This is a rest API. It uses the controller service repository pattern to abstract the different responsibilities. It uses DynamoDB for data storage in the repository layer.  It always uses neverthrow where errors are possible.

## Code Style and Structure

- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).

## Naming Conventions

- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.
- camelCase for functions and variables.
- Use barrel imports (* as syntax) when importing services or repositories.

## TypeScript Usage

- Use TypeScript for all code; prefer types over interfaces.
- Use arrow functions, not the function keyword.
- NEVER use the function keyword.
- NEVER use Classes.

## Syntax and Formatting

- Always use curly braces in conditionals.
- Use semicolons consistently at the end of statements.
- Maintain consistent indentation (2 spaces).


## Commands

### Package Managers

Always use PNPM, not NPM or YARN. So when you want to install packages, use `pnpm install` instead of `npm install` or `yarn install`.

### Package Execution

Use PNPX, `PNPX` instead of `NPX`