const SUBJECT_COLORS = {
  Computing: "#7c6df2",
  English: "#eb6f92",
  History: "#d09b46",
  "Learning to Learn": "#4b9ca8",
  "Life Skills": "#71a064",
  Mathematics: "#4e83e6",
  "Personal & Social Development": "#bd68bf",
  Science: "#28a982",
};

function hash(value) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0) / 4294967295;
}

export function layoutTopics(topics, subjects, minAge, maxAge) {
  const subjectIndex = new Map(subjects.map((subject, index) => [subject, index]));
  const width = 2400;
  const laneHeight = 290;
  const height = Math.max(1000, subjects.length * laneHeight);
  const ageSpan = Math.max(1, maxAge - minAge);
  const nodes = topics.map((topic) => {
    const midpoint = (topic.ageRangeStart + topic.ageRangeEnd) / 2;
    const x = 120 + ((midpoint - minAge) / ageSpan) * (width - 240) + (hash(topic.id) - 0.5) * 80;
    const lane = subjectIndex.get(topic.subject) ?? 0;
    const y = lane * laneHeight + laneHeight / 2 + (hash(`${topic.domain}:${topic.id}`) - 0.5) * (laneHeight - 52);
    return { ...topic, x, y, radius: 3.2 + Math.min(4.8, Math.sqrt(topic.centrality || 0) * 7) };
  });
  return { nodes, byId: new Map(nodes.map((node) => [node.id, node])), width, height };
}

export class GraphView {
  #canvas;
  #context;
  #layout;
  #dependencies;
  #visibleIds = new Set();
  #progress = {};
  #masteryMode = "dim";
  #selectedId = null;
  #onSelect;
  #transform = { x: 0, y: 0, scale: 1 };
  #drag = null;
  #resizeObserver;

  constructor(canvas, taxonomy, onSelect) {
    this.#canvas = canvas;
    this.#context = canvas.getContext("2d");
    this.#layout = layoutTopics(taxonomy.topics, taxonomy.subjects, taxonomy.minAge, taxonomy.maxAge);
    this.#dependencies = taxonomy.dependencies;
    this.#visibleIds = new Set(taxonomy.topics.map(({ id }) => id));
    this.#onSelect = onSelect;
    this.#bindEvents();
    this.#resizeObserver = new ResizeObserver(() => this.resize());
    this.#resizeObserver.observe(canvas.parentElement);
  }

  #bindEvents() {
    this.#canvas.addEventListener("pointerdown", (event) => {
      this.#canvas.setPointerCapture(event.pointerId);
      this.#drag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: this.#transform.x, y: this.#transform.y };
      this.#canvas.classList.add("dragging");
    });
    this.#canvas.addEventListener("pointermove", (event) => {
      if (!this.#drag || event.pointerId !== this.#drag.pointerId) return;
      this.#transform.x = this.#drag.x + event.clientX - this.#drag.startX;
      this.#transform.y = this.#drag.y + event.clientY - this.#drag.startY;
      this.draw();
    });
    this.#canvas.addEventListener("pointerup", (event) => {
      if (!this.#drag) return;
      const distance = Math.hypot(event.clientX - this.#drag.startX, event.clientY - this.#drag.startY);
      if (distance < 5) this.#pick(event.offsetX, event.offsetY);
      this.#drag = null;
      this.#canvas.classList.remove("dragging");
    });
    this.#canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      this.zoom(event.deltaY < 0 ? 1.13 : 0.885, event.offsetX, event.offsetY);
    }, { passive: false });
  }

  resize() {
    const rect = this.#canvas.parentElement.getBoundingClientRect();
    const ratio = Math.min(2, globalThis.devicePixelRatio || 1);
    this.#canvas.width = Math.round(rect.width * ratio);
    this.#canvas.height = Math.round(rect.height * ratio);
    this.#canvas.style.width = `${rect.width}px`;
    this.#canvas.style.height = `${rect.height}px`;
    this.#context.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (this.#transform.scale === 1 && this.#transform.x === 0) this.fit();
    else this.draw();
  }

  fit() {
    const width = this.#canvas.clientWidth;
    const height = this.#canvas.clientHeight;
    const scale = Math.min(width / this.#layout.width, height / this.#layout.height) * 0.92;
    this.#transform = {
      scale,
      x: (width - this.#layout.width * scale) / 2,
      y: (height - this.#layout.height * scale) / 2,
    };
    this.draw();
  }

  zoom(factor, centerX = this.#canvas.clientWidth / 2, centerY = this.#canvas.clientHeight / 2) {
    const previous = this.#transform.scale;
    const scale = Math.max(0.18, Math.min(4, previous * factor));
    const worldX = (centerX - this.#transform.x) / previous;
    const worldY = (centerY - this.#transform.y) / previous;
    this.#transform = { scale, x: centerX - worldX * scale, y: centerY - worldY * scale };
    this.draw();
  }

  update({ visibleIds, progress, masteryMode, selectedId }) {
    this.#visibleIds = visibleIds;
    this.#progress = progress;
    this.#masteryMode = masteryMode;
    this.#selectedId = selectedId;
    this.draw();
  }

  select(topicId) {
    this.#selectedId = topicId;
    const node = this.#layout.byId.get(topicId);
    if (node) {
      const screenX = node.x * this.#transform.scale + this.#transform.x;
      const screenY = node.y * this.#transform.scale + this.#transform.y;
      if (screenX < 80 || screenX > this.#canvas.clientWidth - 80 || screenY < 80 || screenY > this.#canvas.clientHeight - 80) {
        this.#transform.x = this.#canvas.clientWidth / 2 - node.x * this.#transform.scale;
        this.#transform.y = this.#canvas.clientHeight / 2 - node.y * this.#transform.scale;
      }
    }
    this.draw();
  }

  #pick(screenX, screenY) {
    const x = (screenX - this.#transform.x) / this.#transform.scale;
    const y = (screenY - this.#transform.y) / this.#transform.scale;
    const maxDistance = 14 / this.#transform.scale;
    let nearest = null;
    let nearestDistance = maxDistance;
    for (const node of this.#layout.nodes) {
      if (!this.#visibleIds.has(node.id)) continue;
      const distance = Math.hypot(node.x - x, node.y - y);
      if (distance < nearestDistance) {
        nearest = node;
        nearestDistance = distance;
      }
    }
    if (nearest) this.#onSelect(nearest.id);
  }

  draw() {
    const context = this.#context;
    const width = this.#canvas.clientWidth;
    const height = this.#canvas.clientHeight;
    context.clearRect(0, 0, width, height);
    context.save();
    context.translate(this.#transform.x, this.#transform.y);
    context.scale(this.#transform.scale, this.#transform.scale);

    const selectedNeighbors = new Set();
    if (this.#selectedId) {
      for (const edge of this.#dependencies) {
        if (edge.topicId === this.#selectedId) selectedNeighbors.add(edge.prerequisiteId);
        if (edge.prerequisiteId === this.#selectedId) selectedNeighbors.add(edge.topicId);
      }
    }

    context.lineWidth = 0.7 / Math.max(0.4, this.#transform.scale);
    for (const edge of this.#dependencies) {
      if (!this.#visibleIds.has(edge.topicId) || !this.#visibleIds.has(edge.prerequisiteId)) continue;
      const from = this.#layout.byId.get(edge.prerequisiteId);
      const to = this.#layout.byId.get(edge.topicId);
      const highlighted = edge.topicId === this.#selectedId || edge.prerequisiteId === this.#selectedId;
      context.strokeStyle = highlighted ? "rgba(255,255,255,.72)" : "rgba(132,152,184,.10)";
      context.lineWidth = (highlighted ? 2.1 : 0.7) / Math.max(0.45, this.#transform.scale);
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
    }

    for (const node of this.#layout.nodes) {
      if (!this.#visibleIds.has(node.id)) continue;
      const entry = this.#progress[node.id];
      const selected = node.id === this.#selectedId;
      const related = selectedNeighbors.has(node.id);
      const dimmed = this.#masteryMode === "dim" && entry?.status === "mastered" && !selected;
      context.globalAlpha = dimmed ? 0.18 : selected || related ? 1 : 0.82;
      context.fillStyle = SUBJECT_COLORS[node.subject] || "#92a3bb";
      context.beginPath();
      context.arc(node.x, node.y, selected ? node.radius + 4 : related ? node.radius + 2 : node.radius, 0, Math.PI * 2);
      context.fill();

      if (entry?.status === "learning" || entry?.status === "mastered") {
        context.globalAlpha = dimmed ? 0.24 : 1;
        context.strokeStyle = entry.assessment?.verified ? "#fff3a6" : entry.status === "mastered" ? "#7df0bd" : "#ffb454";
        context.lineWidth = (entry.assessment?.verified ? 3 : 2) / Math.max(0.55, this.#transform.scale);
        context.beginPath();
        context.arc(node.x, node.y, node.radius + 3.5, 0, Math.PI * 2);
        context.stroke();
      }
    }
    context.restore();
    context.globalAlpha = 1;
  }
}

export { SUBJECT_COLORS };
