<!--
  Copyright (c) 2020-2021 aetheryx & Cynthia K. Rey
  This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
  https://creativecommons.org/licenses/by-nd/4.0
-->

# Security Alerts
Powercord has a lot of built-in security and self-defense features to ensure users safety. In some cases, you may be
facing a security alert prompt, but don't freak out: if you see it, it means Powercord caught the incident and
triggered internal protocols to ensure your safety.

>warn
> In all cases, if you are suspecting your account to be at risk, change your password **immediately even if you
> have two factor authentication enabled**. Also consider regenerating your 2FA backup codes, for additional safety.

## How to know a modal is authentic?
Figuring out what's fishing and what's not can be hard. People dedicated enough can make modals that look so realistic
they'll make the user believe it's genuine: that's a classic Social Engineering attack and the only shield against that
is you.

### Modal look
To not make it too easy for plugins to mimic modals, we are not using Discord's modals but plain native alert modals.
They are the classic native modal you're probably used to on the platform you're using. For reference, here's a preview
of how it looks on Windows:

![Windows Screenshot](https://cdn.discordapp.com/attachments/754896729580503051/768128957077258310/unknown.png)

### Modal contents
Our security alert modals are informational only. The only confirmation we may ask is if you're sure you want to load
a plugin which has a known low risk vulnerability.

The modal will contain a precise description of the kind of security issue going on, links to relevant resources
(such as our Security Advisory Database at https://powercord.dev/advisories), action taken by Powercord (if any),
and what precautions we recommend taking regarding the incident.

**We will never**:
 - Ask for your password, or any piece of sensitive information (even email addresses).
 - Ask to edit Powercord internals or to run any piece of code in any way.
 - Urge you to visit a website, for any reason.

### In case of doubts
If you have any doubts, there's still a few things you can do:
 - Check https://powercord.dev/advisories to see if we published any recent security vulnerability.
 - Join our [support server](https://discord.gg/gs4ZMbBfCh) and ask us directly. We'll answer you as best as we can.

We take security and your safety very seriously, and we're doing our best to prevent any piece of malware to get
through and cause harm.
