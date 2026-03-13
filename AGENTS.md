# Netsuke Website Agent Guidance

## Scope

This repository contains a prototype front-end design for a the Axinite
application, which is a Rust-based autonomous AI agent.

## Source of Truth

- `axinite/` is the source of truth for the website content, structure,
  classes, imagery, and CSS.

## Current Priorities

Until the prototype is folded into the full site, focus on getting these parts
correct:

- CSS
- copy
- imagery
- semantic HTML
- semantic class names

## What Not to Optimise Yet

Do not invest effort in build automation, build pipeline work, or large-scale
refactoring for this prototype. That work will be handled later by the CMS
pipeline used by the full site.

## Deployment Context

Deployment to GitHub Pages is temporary. It exists only so the prototype can be
shared before it is incorporated into the larger website.

## Preview Workflow

- The user will start a `caddy file-server` instance on port `2020` when a live
  preview is needed.
- Do not attempt to start Caddy yourself.
- When using Playwright for previewing, point it at the existing server on port
  `2020`.

## CSS Debugging

The `css-view` command is available for debugging. It produces a JSON dump of
the computed and de-duped CSS cascade for the site. See the `$css-view` skill.

## Imagery

Use the `$nanobanana` skill for generation of non-SVG imagery.
