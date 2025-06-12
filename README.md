# Mesh

**A local-first mesh network for public communication: no internet required.**

This project builds a self-configuring mesh using Raspberry Pis, Ansible, and open tools. It runs peer-to-peer services over Wi-Fi without relying on central servers, cloud platforms, or internet connectivity.

Use it to:

- Share documents and pads via Etherpad
- Monitor local nodes with Netdata
- Connect devices directly over resilient, decentralised infrastructure
- Broadcast access via Wi-Fi, even offline

Inspired by protest networks, community mesh movements, and the need for autonomous digital infrastructure.

## 🛠️ Quick Start

1. Flash Raspberry Pi OS Lite (64-bit) with SSH and hostname enabled
2. Ensure your Pi is reachable over SSH
3. Clone this repo and customise `inventory/` and `host_vars/`
4. Run:

```bash
ansible-playbook -i inventory/hosts site.yml
```

Your node will automatically configure itself as part of the mesh, run selected services, and (optionally) broadcast a Wi-Fi access point.

For full setup details:
[Getting Started Guide](https://mesh.radicaldata.org/getting-started/).

## 📖 Learn More

- [Why Mesh?](https://mesh.radicaldata.org/understand/why/)
