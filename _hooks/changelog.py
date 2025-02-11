import os
import shutil

def on_pre_build(config):
    """Automatically copy the root CHANGELOG.md into docs/ before building and add a YAML header"""

    # Get all the necessary paths
    project_root = os.getcwd()  # Most likely the project root
    docs_dir = os.path.join(project_root, "docs")  # /docs/

    # Define source and destination paths
    changelog_src = os.path.join(project_root, "CHANGELOG.md")  # Root changelog path
    changelog_dst = os.path.join(docs_dir, "changelog.md")  # Destination inside /docs/

    yaml_header = """---
title: Change Log
hide:
  - navigation
---
"""

    # Ensure the source changelog exists before copying
    if os.path.exists(changelog_src):
        # Read the original changelog content
        with open(changelog_src, "r", encoding="utf-8") as src_file:
            changelog_content = src_file.read()

        # Write the new file with the header
        with open(changelog_dst, "w", encoding="utf-8") as dst_file:
            dst_file.write(yaml_header + "\n" + changelog_content)

        print(f"✅ Copied {changelog_src} to {changelog_dst} with YAML header")
    else:
        print(f"⚠️ WARNING: {changelog_src} not found. Skipping copy.")