---
title: Contributing to Archodex
description: How to contribute to Archodex
layout: ~/layouts/MarkdownLayout.astro
---

# Contributing to Archodex

We're building Archodex to help engineering and security teams work safer and with less stress. We hope it can solve
problems you face today, and, as a [small team](/team) building in the open, we welcome contributions that help Archodex
work better for you and the community!

Whether you want to improve the Archodex codebase, contribute new detection rules, or help shape our roadmap, we’d love
to have you join us on our journey.

---

## Why Contribute?

Archodex is transparent and extensible. Every part of our stack - the agent, backend, and our registry of detection
rules - is published so you can inspect it, improve it, and contribute back.

By contributing, you can:

- Improve Archodex for your own use
- Help other teams avoid painful outages and security incidents
- Add support for new platforms, languages, or resource types that you care about
- Influence the direction of Archodex

---

## Ways You Can Help

### Star the GitHub Repo

If you like Archodex, the easiest and quickest way to help is to
[star our GitHub repository](https://github.com/Archodex/archodex) ⭐. It's a small thing, but every little bit helps!

### Contribute Detection Rulesets

The Archodex agent relies on a growing [registry of Rulesets](/docs/rulesets)
([source repo](https://github.com/archodex/archodex-rules)) to detect secret usage across workloads. You can help by:

- Contributing new built-in rulesets for specific platforms, runtimes, or frameworks.
- Improving existing rulesets to expand coverage.
- Sharing examples of private rulesets (e.g. as GitHub Gists) that may give inspiration for others.

### Improve the Software

Archodex software comes in many forms. The [agent](https://github.com/Archodex/archodex-agent) is written in Rust and
[eBPF](https://ebpf.io/) C code, the Kubernetes instrumentation is a
[Helm chart](https://github.com/Archodex/archodex-helm-charts), the
[backend server](https://github.com/Archodex/archodex-backend) is a Rust app, and the
[web UI](https://github.com/Archodex/archodex-frontend) is a React app. There are lots of opportunities to contribute
source code changes according to your interests and skills:

- Fix bugs, propose and implement new functionality, or enhance the user experience.
- Add support for additional deployment models or integrations.
- Help us refine developer tooling and automation.

### Improve the Documentation and Guides

- Write or improve tutorials and examples.
- Contribute FAQs, troubleshooting tips, or best practices.
- Help make Archodex approachable for new users and contributors.

### Community Engagement

- Participate in [GitHub Discussions](https://github.com/orgs/Archodex/discussions) where community members ask for help
  and guidance, propose new features, and share their experiences.
- Join our [Matrix chat room](https://matrix.to/#/#archodex:matrix.org).

---

## Legalities

Archodex is [Fair Source](https://fair.io/)[^BPFException] licensed so we can transparently and sustainably continue
improving Archodex over the long-term. We specifically use the [Fair Core License – MIT (FCL‑1.0‑MIT)](https://fcl.dev/)
and provide a free-tier usage plan so individuals and small teams can benefit from Archodex while allowing us to sustain
development through paid plans by larger organizations. For more details on why we chose the FCL for Archodex software
and what that means for you, see our [Licensing, Transparency, and Sustainability page](/licensing).

[^BPFException]:
    Exception: The eBPF code under the `/src/bpf` directory of the
    [archodex-agent](https://github.com/Archodex/archodex-agent) is licensed under the GPL-2.0 license.

We also require contributions to our codebases to be made under the
[Archodex Contributor License Agreement (CLA)](/cla). The use of a CLA is common among Open Source / Fair Source
software projects. The Archodex CLA ensures that we can continue to make future Archodex releases by protecting against
changes in copyright ownership for past contributions, among other concerns. The first time you open a GitHub Pull
Request against an Archodex repository we will ask you to accept our CLA.

---

## Our Commitment to Contributors

We value our contributors and are committed to making Archodex a welcoming and rewarding place to contribute. Here's our
commitment to you as a contributor:

- **Respect**: We treat all contributors with respect and value your time and effort.
- **Collaboration**: We actively review contributions, provide constructive feedback, and work with you to get your
  improvements merged.
- **Transparency**: We may not be able to accept certain contributions. When that occurs, we will explain our decisions.
- **Recognition**: We highlight contributors in release notes, on our website, and in community spotlights.

Archodex is more than a product — it’s a community of engineers working together to make DevSecOps safer and easier.
We’re excited to have you join us.
