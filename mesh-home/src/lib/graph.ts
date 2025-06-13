import * as d3 from 'd3';

type Node = {
	id: string;
	label?: string;
	address?: string;
	x?: number;
	y?: number;
};

type Link = {
	source: string;
	target: string;
	cost?: number;
	latency?: number;
};

export default function drawGraph(nodes: Node[], links: Link[]) {
	const container = document.getElementById('mesh-graph');
	if (!container) return;

	const width = container.clientWidth || 600;
	const height = container.clientHeight || 400;

	const rootStyles = getComputedStyle(document.documentElement);
	const fgColor = rootStyles.getPropertyValue('--fg').trim() || '#eee';
	const accentColor = rootStyles.getPropertyValue('--accent').trim() || '#66aaff';

	const svg = d3
		.select(container)
		.html('')
		.append('svg')
		.attr('viewBox', `0 0 ${width} ${height}`)
		.attr('preserveAspectRatio', 'xMidYMid meet')
		.classed('mesh-graph', true);

	const simulation = d3
		.forceSimulation<Node>(nodes)
		.force(
			'link',
			d3
				.forceLink<Node, Link>(links)
				.id((d) => d.id)
				.distance((d) => Math.min(300, 40 + (d.latency ?? 1e7) / 1e6))
				.strength(0.7)
		)
		.force('charge', d3.forceManyBody().strength(-250))
		.force('center', d3.forceCenter(width / 2, height / 2));

	const latencies = links.map((l) => l.latency ?? 1e7);
	const latencyExtent = d3.extent(latencies) as [number, number];

	// Handle the edge case where all latencies are the same
	const latencyScale: [number, number] =
		latencyExtent[0] === latencyExtent[1]
			? [latencyExtent[0]! * 0.9, latencyExtent[1]! * 1.1]
			: latencyExtent;

	function partialInterpolator(interpolator: (t: number) => string, start = 0.2, end = 0.8) {
		return (t: number) => interpolator(start + t * (end - start));
	}

	const colourScale = d3
		.scaleSequential()
		.domain(latencyScale)
		.interpolator(partialInterpolator(d3.interpolateTurbo, 0.8, 0.2))
		.clamp(true);
	const formatMs = d3.format('.1f');

	// Links
	const linkGroup = svg.append('g').attr('class', 'links');

	const link = linkGroup
		.selectAll('line')
		.data(links)
		.join('line')
		.attr('stroke', (d) => colourScale(d.latency ?? 1e7))
		.attr('stroke-width', (d) => Math.max(1, Math.min(4, (d.latency ?? 1e7) / 1e6)))
		.attr('opacity', 0.9);

	link
		.append('title')
		.text((d) => `Cost: ${d.cost ?? '?'}, Latency: ${formatMs((d.latency ?? 0) / 1e6)} ms`);

	// Nodes
	const nodeGroup = svg.append('g').attr('class', 'nodes');

	const node = nodeGroup
		.selectAll('circle')
		.data(nodes)
		.join('circle')
		.attr('r', 8)
		.attr('fill', (d) => (d.label === 'This node' ? accentColor : fgColor))
		.call(
			d3
				.drag<SVGCircleElement, Node>()
				.on('start', dragstarted)
				.on('drag', dragged)
				.on('end', dragended)
		);

	node.append('title').text((d) => `${d.label ?? d.id}${d.address ? `\n${d.address}` : ''}`);

	// Labels
	const labels = nodeGroup
		.selectAll('text')
		.data(nodes)
		.join('text')
		.text((d) => d.label ?? '')
		.attr('font-size', '10px')
		.attr('dy', -12)
		.attr('text-anchor', 'middle')
		.attr('fill', fgColor);

	// Tick handler
	simulation.on('tick', () => {
		link
			.attr('x1', (d) => (d.source as Node).x!)
			.attr('y1', (d) => (d.source as Node).y!)
			.attr('x2', (d) => (d.target as Node).x!)
			.attr('y2', (d) => (d.target as Node).y!);

		node.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);
		labels.attr('x', (d) => d.x!).attr('y', (d) => d.y!);
	});

	// Drag functions
	function dragstarted(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
		if (!event.active) simulation.alphaTarget(0.3).restart();
		event.subject.fx = event.subject.x;
		event.subject.fy = event.subject.y;
	}

	function dragged(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
		event.subject.fx = event.x;
		event.subject.fy = event.y;
	}

	function dragended(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
		if (!event.active) simulation.alphaTarget(0);
		event.subject.fx = null;
		event.subject.fy = null;
	}

	// Legend
	const legend = svg
		.append('g')
		.attr('class', 'legend')
		.attr('transform', `translate(${width - 120}, 20)`);

	legend.append('text').text('Latency (ms)').attr('font-size', '12px').attr('fill', fgColor);

	const defs = svg.append('defs');
	const gradient = defs
		.append('linearGradient')
		.attr('id', 'legendGradient')
		.attr('x1', '0%')
		.attr('x2', '100%')
		.attr('y1', '0%')
		.attr('y2', '0%');

	for (let i = 0; i <= 10; i++) {
		const t = i / 10;
		gradient
			.append('stop')
			.attr('offset', `${t * 100}%`)
			.attr('stop-color', colourScale(latencyScale[0] * (1 - t) + latencyScale[1] * t));
	}

	legend
		.append('rect')
		.attr('width', 100)
		.attr('height', 10)
		.style('fill', 'url(#legendGradient)')
		.attr('y', 10);

	legend
		.append('text')
		.text(`${formatMs(latencyScale[0] / 1e6)} ms`)
		.attr('x', 0)
		.attr('y', 30)
		.attr('font-size', '10px')
		.attr('fill', fgColor);

	legend
		.append('text')
		.text(`${formatMs(latencyScale[1] / 1e6)} ms`)
		.attr('x', 80)
		.attr('y', 30)
		.attr('font-size', '10px')
		.attr('fill', fgColor);
}
