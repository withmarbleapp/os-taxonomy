# Native development on Ubuntu 24.04

Ubuntu restricts unprivileged user namespaces through AppArmor. Electron needs
these for its Chromium sandbox unless a privileged sandbox helper is installed.
A plain npm install does not install that helper with root ownership and mode
4755. The resulting SUID-helper error does not mean the lesson or web UI failed.

Use an executable-specific AppArmor profile, as described in the
[Ubuntu release notes](https://documentation.ubuntu.com/release-notes/24.04/#unprivileged-user-namespace-restrictions).
Keep Electron sandboxing and the system-wide user-namespace restriction enabled.
The profile permits user namespaces for the two listed executables; it is not a
complete application confinement policy. Those paths are developer-controlled,
so this is a local development setup, not an end-user installer.

From `player/`, build and generate the profile without changing system settings:

```sh
npm ci
npm run dist:linux
node scripts/linux-sandbox-profile.mjs > /tmp/marble-local.apparmor
apparmor_parser --skip-kernel-load --skip-cache /tmp/marble-local.apparmor
cat /tmp/marble-local.apparmor
```

An administrator can install the reviewed profile once:

```sh
sudo install -o root -g root -m 644 /tmp/marble-local.apparmor /etc/apparmor.d/marble-local
sudo apparmor_parser -r /etc/apparmor.d/marble-local
```

Then launch normally (never with sudo):

```sh
MARBLE_SMOKE_TEST=1 npm start   # load the native window, then exit
npm start                     # development app
./dist/linux-unpacked/marble-player   # packaged local app
```

The native app has its own per-user data directory. Select the existing speech
installation and tutor connection in its Settings; browser development settings
are not silently imported. No new model download is required when reusing them.

Regenerate and reload the profile if the executable paths change. To undo:

```sh
sudo apparmor_parser -R /etc/apparmor.d/marble-local
sudo rm /etc/apparmor.d/marble-local
```

The profile generator and parser validation were checked on the development host.
Installing the profile requires administrator authentication. Native window loading
and normal shutdown were verified after installation with sandboxing enabled. Production packaging needs a stable install
path and a distribution-specific installation policy, plus microphone and speech
validation in the actual desktop app. Do not disable sandboxing or globally relax
AppArmor as an installer workaround.
