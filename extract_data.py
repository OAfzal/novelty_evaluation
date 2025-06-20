#!/usr/bin/env python3
"""
Extract data from the Flask app format and create JSON files for static version
"""

import os
import json
from pathlib import Path

# Configuration
DATA_DIR = Path("../data_iclr_all_topics/iclr_compiled_v2")
OUTPUT_DIR = Path("data")

def extract_papers():
    """Extract all papers with their reviews and summaries"""
    papers = {}
    
    for paper_dir in DATA_DIR.iterdir():
        if not paper_dir.is_dir():
            continue

        paper_id = paper_dir.name
        
        # Load different review sources
        sources = {}
        
        # Human reviews
        human_reviews_dir = paper_dir / "human_reviews" / "normalized_reviews"
        if human_reviews_dir.exists():
            human_reviews = []
            for review_file in human_reviews_dir.glob("*.txt"):
                try:
                    with open(review_file, "r", encoding="utf-8") as f:
                        content = f.read().strip()
                        if content:  # Only include non-empty reviews
                            human_reviews.append({
                                "id": f"human_{review_file.stem}",
                                "type": "human",
                                "label": f"Human Review ({review_file.stem})",
                                "content": content
                            })
                except Exception as e:
                    print(f"Error reading {review_file}: {e}")
            
            if human_reviews:
                sources["human"] = human_reviews

        # Our system
        ours_summary = paper_dir / "ours" / "summary.txt"
        if ours_summary.exists():
            try:
                with open(ours_summary, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                    if content:
                        sources["ours"] = [{
                            "id": "ours_summary",
                            "type": "ours", 
                            "label": "Our System",
                            "content": content
                        }]
            except Exception as e:
                print(f"Error reading {ours_summary}: {e}")

        # OpenReviewer
        openreviewer_file = paper_dir / "openreviewer" / "normalized_review.txt"
        if openreviewer_file.exists():
            try:
                with open(openreviewer_file, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                    if content:
                        sources["openreviewer"] = [{
                            "id": "openreviewer",
                            "type": "openreviewer",
                            "label": "OpenReviewer",
                            "content": content
                        }]
            except Exception as e:
                print(f"Error reading {openreviewer_file}: {e}")

        # DeepReviewer
        deepreviewer_file = paper_dir / "deepreviewer" / "normalized_review.txt"
        if deepreviewer_file.exists():
            try:
                with open(deepreviewer_file, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                    if content:
                        sources["deepreviewer"] = [{
                            "id": "deepreviewer",
                            "type": "deepreviewer", 
                            "label": "DeepReviewer",
                            "content": content
                        }]
            except Exception as e:
                print(f"Error reading {deepreviewer_file}: {e}")

        # Only include papers that have at least human reviews (for reference)
        if "human" in sources and len(sources["human"]) > 0:
            # Also need at least 2 other candidates for comparison
            total_candidates = sum(len(candidates) for candidates in sources.values())
            if total_candidates >= 3:  # 1 human reference + 2 other candidates minimum
                papers[paper_id] = sources

    print(f"Extracted {len(papers)} papers for static evaluation")
    return papers

def create_data_files():
    """Create data files for static version"""
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    # Extract papers
    papers = extract_papers()
    
    # Save papers data
    papers_file = OUTPUT_DIR / "papers.json"
    with open(papers_file, "w", encoding="utf-8") as f:
        json.dump(papers, f, indent=2, ensure_ascii=False)
    
    print(f"Created {papers_file} with {len(papers)} papers")
    
    # Create stats file
    stats = {
        "total_papers": len(papers),
        "papers_with_human_reviews": len([p for p in papers.values() if "human" in p]),
        "papers_with_our_system": len([p for p in papers.values() if "ours" in p]),
        "papers_with_openreviewer": len([p for p in papers.values() if "openreviewer" in p]),
        "papers_with_deepreviewer": len([p for p in papers.values() if "deepreviewer" in p]),
        "created_at": "2025-06-20"
    }
    
    stats_file = OUTPUT_DIR / "stats.json"
    with open(stats_file, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)
    
    print(f"Created {stats_file}")
    print(f"Statistics: {stats}")

if __name__ == "__main__":
    create_data_files()