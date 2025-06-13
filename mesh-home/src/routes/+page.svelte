<script lang="ts">
	import { onMount } from 'svelte';

	type Service = {
		host: string;
		ip: string;
		port: number;
		name: string;
	};

	type RawEntry = {
		hard_ifindex: number;
		hard_ifname: string;
		orig_address: string;
		neigh_address: string;
		best: boolean;
		last_seen_msecs: number;
		tq: number;
	};

	type Node = {
		id: string;
	};

	type Link = {
		source: string;
		target: string;
	};

	let services: Service[] = [];
	let meshRaw: RawEntry[] = [];
	let nodes: Node[] = [];
	let links: Link[] = [];

	onMount(async () => {
		try {
			const servicesRes = await fetch('/services.json');
			if (!servicesRes.ok) throw new Error('Failed to fetch services');
			services = await servicesRes.json();

			const meshRes = await fetch('/neighbours.json');
			if (!meshRes.ok) throw new Error('Failed to fetch mesh');
			meshRaw = await meshRes.json();

			// Extract unique nodes and links
			const seen = new Set<string>();
			nodes = [];
			links = [];

			for (const entry of meshRaw) {
				if (!seen.has(entry.orig_address)) {
					nodes.push({ id: entry.orig_address });
					seen.add(entry.orig_address);
				}
				if (!seen.has(entry.neigh_address)) {
					nodes.push({ id: entry.neigh_address });
					seen.add(entry.neigh_address);
				}
				links.push({
					source: entry.orig_address,
					target: entry.neigh_address
				});
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
			<li>{node.id}</li>
		{/each}
	</ul>

	<h3>Links</h3>
	<ul>
		{#each links as link}
			<li>{link.source} → {link.target}</li>
		{/each}
	</ul>
{/if}
