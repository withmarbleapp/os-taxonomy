#!/usr/bin/env python3
"""
embeddings/generate.py

Reproducible pipeline:
- Load Marble Skill Taxonomy topics + dependencies
- Construct rich embedding text (name + description + mastery evidence)
- Compute sentence embeddings (default: all-MiniLM-L6-v2)
- Persist to Chroma vector DB with rich metadata
- Compute deterministic UMAP 2D + 3D layouts (semantic diversity)
- Write clean artifacts for visualization + downstream use
- Full provenance manifest

Designed to run inside Docker with volume mounts or directly with Python.
"""

import argparse
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

import numpy as np
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import umap
import chromadb
from chromadb.config import Settings

console = Console()

DEFAULT_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
RANDOM_STATE = 42


def load_data(data_dir: Path) -> tuple[List[Dict], List[Dict]]:
    """Load and validate core taxonomy files."""
    topics_path = data_dir / "topics.json"
    deps_path = data_dir / "dependencies.json"

    if not topics_path.exists():
        raise FileNotFoundError(f"topics.json not found at {topics_path}")
    if not deps_path.exists():
        raise FileNotFoundError(f"dependencies.json not found at {deps_path}")

    with open(topics_path) as f:
        topics_doc = json.load(f)
    with open(deps_path) as f:
        deps_doc = json.load(f)

    topics = topics_doc["topics"]
    dependencies = deps_doc["dependencies"]

    console.log(f"[green]Loaded[/green] {len(topics)} topics and {len(dependencies)} dependencies from {data_dir}")
    return topics, dependencies


def build_embedding_text(topic: Dict[str, Any]) -> str:
    """
    First-principles text construction for a learning micro-topic.

    Goal: Capture both the conceptual essence and the "what mastery looks like"
    signal so that embeddings reflect pedagogical ideas, not just surface words.
    """
    subject = topic.get("subject", "")
    domain = topic.get("domain") or ""
    name = topic.get("name") or ""
    description = topic.get("description", "").strip()
    evidence = topic.get("evidence", [])

    parts = []
    if subject:
        parts.append(subject)
    if domain:
        parts.append(domain)
    if name:
        parts.append(name)

    header = " — ".join(parts) if parts else "Concept"

    text = f"{header}. {description}"
    if evidence:
        evidence_str = " | ".join(e.strip() for e in evidence if e and e.strip())
        text += f" Evidence of mastery: {evidence_str}."

    return text.strip()


def compute_embeddings(
    topics: List[Dict[str, Any]],
    model_name: str,
    batch_size: int = 64,
) -> np.ndarray:
    """Compute dense embeddings with progress and determinism."""
    console.log(f"[bold]Loading embedding model:[/bold] {model_name}")
    # device="cpu" explicit for reproducibility in container
    model = SentenceTransformer(model_name, device="cpu")

    texts = [build_embedding_text(t) for t in topics]

    embeddings_list: List[np.ndarray] = []
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("{task.completed}/{task.total}"),
        TimeElapsedColumn(),
        console=console,
    ) as progress:
        task = progress.add_task("Embedding topics", total=len(texts))
        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            emb = model.encode(
                batch,
                show_progress_bar=False,
                convert_to_numpy=True,
                normalize_embeddings=True,
            )
            embeddings_list.append(emb)
            progress.update(task, advance=len(batch))

    embeddings = np.vstack(embeddings_list).astype(np.float32)
    dim = model.get_sentence_embedding_dimension()
    console.log(f"[green]Computed[/green] embeddings shape: {embeddings.shape} (dim={dim})")
    return embeddings, dim


def persist_to_chroma(
    topics: List[Dict[str, Any]],
    embeddings: np.ndarray,
    chroma_dir: Path,
    collection_name: str = "marble-taxonomy-topics",
) -> None:
    """Persist vectors + rich metadata into a local Chroma DB."""
    chroma_dir.mkdir(parents=True, exist_ok=True)

    client = chromadb.PersistentClient(
        path=str(chroma_dir),
        settings=Settings(anonymized_telemetry=False),
    )

    # Fresh collection for reproducibility in this run
    try:
        client.delete_collection(collection_name)
    except Exception:
        pass

    collection = client.create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine", "description": "Marble Skill Taxonomy micro-topics"},
    )

    ids = [t["id"] for t in topics]
    metadatas = []
    documents = []

    for t in topics:
        meta = {
            "id": t["id"],
            "name": t.get("name"),
            "subject": t.get("subject"),
            "domain": t.get("domain"),
            "type": t.get("type"),
            "ageRangeStart": t.get("ageRangeStart"),
            "ageRangeEnd": t.get("ageRangeEnd"),
            "centrality": t.get("centrality"),
        }
        metadatas.append(meta)
        documents.append(build_embedding_text(t))

    collection.add(
        ids=ids,
        embeddings=embeddings.tolist(),
        metadatas=metadatas,
        documents=documents,
    )

    console.log(f"[green]Persisted[/green] {len(ids)} vectors to Chroma at {chroma_dir} (collection: {collection_name})")


def compute_umap_layouts(
    embeddings: np.ndarray,
    n_neighbors: int = 20,
    min_dist: float = 0.08,
) -> Dict[str, np.ndarray]:
    """Deterministic UMAP for 3D (primary) and 2D."""
    console.log("[bold]Computing UMAP layouts[/bold] (cosine, fixed random_state=42)...")

    # 3D primary for spatial "distant concepts" experience
    reducer3d = umap.UMAP(
        n_components=3,
        n_neighbors=n_neighbors,
        min_dist=min_dist,
        metric="cosine",
        random_state=RANDOM_STATE,
        verbose=False,
    )
    coords3d = reducer3d.fit_transform(embeddings)

    reducer2d = umap.UMAP(
        n_components=2,
        n_neighbors=n_neighbors,
        min_dist=min_dist,
        metric="cosine",
        random_state=RANDOM_STATE,
        verbose=False,
    )
    coords2d = reducer2d.fit_transform(embeddings)

    console.log(f"  3D layout range: x=[{coords3d[:,0].min():.2f},{coords3d[:,0].max():.2f}] ...")
    return {"3d": coords3d, "2d": coords2d}


def build_artifacts(
    topics: List[Dict[str, Any]],
    dependencies: List[Dict[str, Any]],
    coords: Dict[str, np.ndarray],
    output_dir: Path,
    model_name: str,
    embedding_dim: int,
    umap_params: Dict[str, Any],
) -> None:
    """Write the clean, versioned artifacts consumed by the visualization."""
    output_dir.mkdir(parents=True, exist_ok=True)

    # Enriched nodes with layout positions (primary = 3D)
    nodes = []
    coords3d = coords["3d"]
    coords2d = coords["2d"]

    for i, t in enumerate(topics):
        node = {
            "id": t["id"],
            "name": t.get("name"),
            "subject": t.get("subject"),
            "domain": t.get("domain"),
            "type": t.get("type"),
            "ageRangeStart": t.get("ageRangeStart"),
            "ageRangeEnd": t.get("ageRangeEnd"),
            "centrality": t.get("centrality"),
            "x": float(coords3d[i, 0]),
            "y": float(coords3d[i, 1]),
            "z": float(coords3d[i, 2]),
            "x2": float(coords2d[i, 0]),
            "y2": float(coords2d[i, 1]),
        }
        nodes.append(node)

    # Slim links (preserve the pedagogical graph)
    links = []
    for d in dependencies:
        links.append({
            "source": d["topicId"],
            "target": d["prerequisiteId"],
            "strength": d["strength"],
            "reason": d.get("reason"),
        })

    # Write artifacts
    (output_dir / "topics_with_layout.json").write_text(
        json.dumps({"nodes": nodes, "count": len(nodes)}, indent=2)
    )
    (output_dir / "links.json").write_text(
        json.dumps({"links": links, "count": len(links)}, indent=2)
    )

    # Provenance manifest (critical for reproducibility)
    manifest = {
        "dataset": "Marble Skill Taxonomy",
        "taxonomyVersion": "v1",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "model": model_name,
        "embeddingDim": embedding_dim,
        "numTopics": len(nodes),
        "numLinks": len(links),
        "umap": {
            "n_neighbors": umap_params["n_neighbors"],
            "min_dist": umap_params["min_dist"],
            "metric": "cosine",
            "random_state": RANDOM_STATE,
        },
        "layout": "UMAP 3D (primary) + 2D",
        "textStrategy": "subject — domain — name. description. Evidence of mastery: ...",
        "notes": "Embeddings and layouts are derived and fully reproducible from the open taxonomy data.",
    }
    (output_dir / "generation_manifest.json").write_text(json.dumps(manifest, indent=2))

    # Also copy a small README for the generated dir
    (output_dir / "README.txt").write_text(
        "Generated artifacts for Marble Taxonomy semantic visualization.\n"
        "Open viz.html (after generation) or serve this directory.\n"
        "See ../EMBEDDINGS.md for full documentation.\n"
    )

    # Copy the source viz.html template into generated/ (the template lives in embeddings/ as source)
    viz_dst = output_dir / "viz.html"
    import shutil
    src = Path(__file__).parent / "viz.html"  # embeddings/viz.html (source controlled)
    if src.exists():
        shutil.copy(src, viz_dst)
        console.log(f"[green]Copied[/green] viz.html template from embeddings/ to generated/")
    else:
        console.log("[yellow]Warning: embeddings/viz.html not found; visualization will be missing[/yellow]")

    console.log(f"[green]Wrote artifacts[/green] to {output_dir}")


def sanity_check(embeddings: np.ndarray, topics: List[Dict[str, Any]]) -> None:
    """Lightweight sanity: nearest neighbors for a couple of known concepts."""
    console.log("[bold]Sanity check — nearest neighbors (cosine on embeddings)[/bold]")
    # Simple brute force for tiny N
    sims = cosine_similarity(embeddings)

    # Pick a few interesting indices
    interesting = ["mt_AzTrT5ySCx", "mt_glPPG-kTQY"]  # AI in Daily Life, Adding within 100
    id_to_idx = {t["id"]: i for i, t in enumerate(topics)}

    for tid in interesting:
        if tid not in id_to_idx:
            continue
        idx = id_to_idx[tid]
        sim_row = sims[idx]
        top = np.argsort(sim_row)[::-1][1:4]  # skip self
        name = topics[idx].get("name")
        console.log(f"  '{name}' ({tid}) nearest:")
        for j in top:
            console.log(f"    • {topics[j].get('name')} (sim={sim_row[j]:.3f})")


def main():
    parser = argparse.ArgumentParser(description="Generate embeddings + layout for Marble taxonomy")
    parser.add_argument("--data-dir", type=Path, default=Path("/data"), help="Directory containing topics.json + dependencies.json")
    parser.add_argument("--output-dir", type=Path, default=Path("/output"), help="Where to write generated/ artifacts and chroma/")
    parser.add_argument("--model", type=str, default=os.environ.get("EMBEDDING_MODEL", DEFAULT_MODEL))
    parser.add_argument("--n-neighbors", type=int, default=20)
    parser.add_argument("--min-dist", type=float, default=0.08)
    args = parser.parse_args()

    start = time.time()
    console.rule("[bold cyan]Marble Taxonomy — Embeddings + Spatial Layout Generator[/bold cyan]")

    data_dir = args.data_dir
    output_dir = args.output_dir
    chroma_dir = output_dir / "chroma"

    topics, dependencies = load_data(data_dir)

    embeddings, embedding_dim = compute_embeddings(topics, args.model)

    persist_to_chroma(topics, embeddings, chroma_dir)

    coords = compute_umap_layouts(
        embeddings,
        n_neighbors=args.n_neighbors,
        min_dist=args.min_dist,
    )

    build_artifacts(
        topics,
        dependencies,
        coords,
        output_dir,
        args.model,
        embedding_dim,
        {"n_neighbors": args.n_neighbors, "min_dist": args.min_dist},
    )

    sanity_check(embeddings, topics)

    elapsed = time.time() - start
    console.rule(f"[bold green]Complete[/bold green] in {elapsed:.1f}s")
    console.log(f"Artifacts: {output_dir}")
    console.log(f"Vector DB:  {chroma_dir}")
    console.log("Next: open generated/viz.html or serve the directory.")


if __name__ == "__main__":
    main()
