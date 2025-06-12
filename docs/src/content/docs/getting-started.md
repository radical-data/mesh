---
title: Getting Started
description: Set up a Raspberry Pi node and join the mesh.
---

Welcome! This guide will help you set up a Raspberry Pi node and join a **local, autonomous mesh network**. You don’t need to be an expert; just comfortable with basic steps like copying files and using a terminal.

> 🧩 This mesh network allows devices to discover each other, share services (like Etherpad or Nextcloud), and connect even without internet.

## What you’ll accomplish

By the end of this guide, you will:

- Turn a Raspberry Pi into a mesh node
- Join a local, Wi-Fi–based network
- Run local-first services like Etherpad or Netdata
- Broadcast a Wi-Fi signal for others to join
- Contribute to a collective communication system — no internet required

## 🌱 Why Join the Mesh?

- **Offline collaboration**: Share pads or files locally with no central server
- **Resilience**: Nodes find each other automatically over Wi-Fi
- **Autonomy**: You run the software, not the cloud

Bring your own Raspberry Pi and you'll leave with a working node.

## 🧰 What You'll Need

- A Raspberry Pi (preferably 3 or 4, 64-bit)
- A microSD card (16 GB minimum)
- A computer with an SD card reader
- A way to connect the Pi to your network:
  - **Ethernet cable** (recommended for first-time setup)
  - Or Wi-Fi (if you configure it in advance)
- Some familiarity with the terminal
- An SSH key (see below)

## 💾 Flash and Prepare the SD Card

We use [Raspberry Pi OS Lite (64-bit)](https://www.raspberrypi.com/software/operating-systems/#raspberry-pi-os-64-bit) for low resource usage.

### Flashing the SD card

Use [Raspberry Pi Imager](https://www.raspberrypi.com/software/) and enable:

- ✅ **SSH**
- ✅ **Set a hostname** (e.g. `node0`)
- ✅ **Set a username and password** (or **load your SSH key** under "Advanced Options" → "Set authorised_keys")

If you don't know what an SSH key is, see: [GitHub's guide to SSH keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

## 🌐 Boot and Connect to the Pi

Put the SD card in your Pi and power it on. Connect it to your local network:

- **Preferred**: via **Ethernet**
- Or: use **Wi-Fi**, if it was set up during flashing

Check that the Pi is reachable. Try this from your computer:

```bash
ssh pi@node0.local
```

| 💡 .local addresses require mDNS support (Avahi or Bonjour). If it doesn’t work, check your network or try using the IP address directly.

If the .local address doesn't resolve, use the Pi's IP instead (you can find it via your router or a network scanner):

```bash
ssh pi@192.168.1.42
```

## 🛠️ Prepare the Mesh Software

Run these commands on your laptop or workstation, not on the Pi.

```bash
git clone https://github.com/radical-data/mesh.git
cd mesh
```

Edit inventory/hosts to list your Pi:

```ini
[mesh_nodes]
node0.local

[access_point_nodes]
node0.local

[service_nodes]
node0.local

[all:vars]
ansible_user=pi
```

You can repeat these steps to add more Pis later.

## ⚙️ Customise Your Node

Use the `host_vars/` folder to enable services on your node.

Example: `host_vars/node0.local.yml`

```yml
services_enabled:
  - etherpad
  - netdata
```

You can also configure Wi-Fi access points, static IPs, and more in `group_vars/`.

## 🚀 Deploy with Ansible

Finally, run the setup:

```bash
ansible-playbook -i inventory/hosts site.yml
```

Ansible will:

- Set up the mesh Wi-Fi network
- Enable service discovery (Avahi)
- Start your selected services in Docker containers

## 🎉 That's It!

Once complete:

- Your Pi is part of the mesh
- Services like Etherpad or Netdata will be advertised locally
- If configured, it may also broadcast Wi-Fi so others can join

Try visiting:

- Etherpad: http://node0.local:9001
- Netdata: http://node0.local:9100

## 🌍 Now What?

Congratulations — you’re running a fully independent, local-first node.

This is more than a tech demo. It’s a step toward:

- Sharing files and pads in your neighbourhood
- Building emergency networks for when the internet fails
- Imagining new ways of being online — together

📡 **This is just the beginning.**

- [Read the full story](/concepts/why/)
- [Build a new service](/guides/enable-a-service/)
