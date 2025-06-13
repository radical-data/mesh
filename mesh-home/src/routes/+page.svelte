<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import drawGraph from '$lib/graph';

	type Service = {
		host: string;
		ip: string;
		port: number;
		name: string;
	};

	type Node = {
		id: string;
		label?: string;
		address?: string;
	};

	type Link = {
		source: string;
		target: string;
		cost?: number;
		latency?: number;
		multihop?: boolean;
	};

	let services: Service[] = [];
	let nodes: Node[] = [];
	let links: Link[] = [];
	let graphReady = false;

	onMount(async () => {
		try {
			const servicesRes = await fetch('/services.json');
			if (servicesRes.ok) services = await servicesRes.json();

			const yggRes = await fetch('/ygg.json');
			if (!yggRes.ok) throw new Error('Failed to fetch ygg.json');
			const ygg = await yggRes.json();

			const selfKey = ygg.self.key;
			const selfAddr = ygg.self.address;
			const seen = new Set([selfKey]);

			nodes = [{ id: selfKey, label: 'This node', address: selfAddr }];
			links = [];

			for (const peer of ygg.peers) {
				if (!seen.has(peer.key)) {
					nodes.push({
						id: peer.key,
						address: peer.address,
						label: peer.address
					});
					seen.add(peer.key);
				}
				links.push({
					source: selfKey,
					target: peer.key,
					cost: peer.cost,
					latency: peer.latency
				});
			}

			if (ygg.paths) {
				for (const path of ygg.paths) {
					const remoteId = path.address;
					const nextHopId = path.nextHop;

					if (!seen.has(remoteId)) {
						nodes.push({ id: remoteId, address: remoteId });
						seen.add(remoteId);
					}

					links.push({
						source: nextHopId,
						target: remoteId,
						latency: path.latency,
						cost: path.hops,
						multihop: true
					});
				}
			}

			graphReady = true; // triggers afterUpdate
		} catch (e) {
			console.error('Error loading mesh data:', e);
		}
	});

	afterUpdate(() => {
		if (graphReady && nodes.length > 0 && links.length > 0) {
			drawGraph(nodes, links);
			graphReady = false; // reset to avoid redundant redraws
		}
	});
</script>

<h1>Mesh Overview</h1>

<h2>Discovered Services</h2>
{#if services.length === 0}
	<p>No services found.</p>
{:else}
	<ul>
		{#each services as svc}
			<li>
				<strong>{svc.name}</strong><br />
				<span>{svc.ip}:{svc.port}</span><br />
				<a href={'http://' + svc.ip + ':' + svc.port} target="_blank">Open</a>
			</li>
		{/each}
	</ul>
{/if}

<h2>Mesh Topology</h2>
{#if nodes.length === 0}
	<p>No mesh data found.</p>
{:else}
	<svg id="mesh-graph" width="600" height="400"></svg>

	<h3>Nodes</h3>
	<ul>
		{#each nodes as node}
			<li>{node.label ?? node.id}</li>
		{/each}
	</ul>

	<h3>Links</h3>
	<ul>
		{#each links as link}
			<li>
				{link.source} → {link.target} (cost: {link.cost ?? '?'}, latency: {(link.latency ?? 0) / 1e6} ms)
			</li>
		{/each}
	</ul>
{/if}
