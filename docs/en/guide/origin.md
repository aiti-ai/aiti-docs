---
title: Project Origins
icon: 🌱
description: How aiti came to be — two decade-old projects, fragmented time, and the battle to save tokens, all the way to shipping our own releases
---

# Project Origins

## In the Beginning: Two Decade-Old Projects

We were holding onto two old workhorses we'd been building for over a decade:

- **[TestAgent](/en/extensions/aiti-testagent.md)**: a runtime debugging tool for Java backends — hot updates, arbitrary in-JVM modification, Mock/SQL interception and simulation — now evolved into "Arthas++ for AI".
- **[JustDB](https://justdb.ai)**: a WYSIWYG database development suite — write only the desired schema and dictionary data, and the tool automatically manages database creation and upgrades; 100+ databases including MySQL / PostgreSQL / Oracle / SQLite / H2, with incremental migration, smart UPSERT, JDBC 4.2, and full Spring Boot / Solon Starter support.

Old as the projects were, progress never picked up speed — the excuse was "limited stamina", but the real problem was that the scope was spread too wide: both projects aimed far beyond what one person could cover, and after-work evenings and weekends couldn't sustain a decade-plus marathon.

The AI era arrived, and "AI archaeology" began: digging these two old-timers out, having AI help read the code, add tests, fix old bugs, and keep improving.

## Needs Forced Out by Real Circumstances

None of aiti's features were designed out of thin air — every one was forced out by real circumstances.

**Fragmented time and carry-along devices.** The main projects need development and debugging, and no one can sit at a computer all the time: commutes, outings, and gaps between breaks are all usable dev time; phones and tablets are all usable devices. How do you get the work done in fragmented time, on carry-along devices?

**Freeloading tokens and saving tokens.** Good models are expensive; free models are rate-limited. Use whichever model is cheaper; use whichever key is still alive.

## Switching Tools: From Other AI Agents to pi-web

At first, various other AI agents were used for coding. Each had its own conveniences and annoyances, but something always felt one step short: the toolchain we wanted, the UI we wanted, the way of working we wanted — all hidden behind a layer.

Later we found [pi](https://pi.dev) and [pi-web](https://github.com/agegr/pi-web). To be honest, only two things won us over: pi is simple — a minimal system prompt; pi-web is simple and easy to modify. They are genuinely well-made, which is why we adopted them. So daily development moved over, and whenever something was missing we added a bit to fit our own needs, improving as we used it.

## More and More Additions, No Way Back

As we used it, the additions kept piling up.

For working anywhere, anytime: service port mapping and tunnels, exposing local services securely so they're reachable on the road; full-featured small-screen adaptation + voice input, making real development on a phone possible (it drains the battery though — remember to pack a power bank); terminal / VNC / RDP, so remote machines are always within reach; IM channel integration, so even on the road, one message in the group chat and the AI keeps working and delivering.

For saving tokens: the model-add wizard (directory search / reverse matching / auto-probing), multi-key sticky rotation, model aggregation (combining models to use together), availability probing (429 rate-limit detection and recovery prediction).

Add the session panel, tag management, in-page debug injection, the MCP bridge… each addition moved us a bit further from upstream. Until one day we realized: the changes had become unrecognizable, the code couldn't be merged back, and PRs were no longer an option. Rather than holding on to the "fork" identity, better to release our own way and build our own product.

**That's how aiti began** — based on the open-source code of [pi-web](https://github.com/agegr/pi-web), plus the extensions we had accumulated ourselves, maintained as an independent brand and an independent distribution.

## Improving While Using, Serving Ourselves First

The development approach has always been "improve while using": enduring the bugs in our own dev process while continuously evolving both the main projects and this AI project — the tool is its own first user, and every feature you see was first validated on ourselves.

This distribution is built **for our own use first**: an AI development tool we like and find comfortable. Because we use it every day, it breaks fast and gets fixed fast; because the needs are real, no ornamental gimmicks get made.

If it feels comfortable to you too, welcome to use it along with us.

## Contributions Welcome

- **Submit code**: bug fixes, doc additions, improvement proposals — all welcome.
- **Create extensions**: aiti's extension framework is open; all business features are implemented as extensions, and you can build your own things on top of it. See [aiti-agent extension points](/en/devtools/extension-points.md).
- **Need a new extension point**: when the existing slots aren't enough, open a PR against **aiti-agent** to add an extension point (extend the slots and contracts in `lib/ext/types.ts` + the mount locations in `components/ExtSlots.tsx`); the extension itself still lives in your own repository.
