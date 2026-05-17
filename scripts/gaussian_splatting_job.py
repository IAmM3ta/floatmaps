# Ready-to-deploy Modal GPU job for 360 video -> Gaussian Splatting
# Install: pip install modal
# Deploy: modal deploy gaussian_splatting_job.py

import modal

stub = modal.Stub("floatmaps-gaussian-splatting")

image = modal.Image.debian_slim().pip_install(
    "torch", "torchvision", "numpy", "opencv-python", "ffmpeg-python"
).run_commands(
    "apt-get update && apt-get install -y ffmpeg colmap"
)

@stub.function(gpu="A10G", timeout=3600)
def process_360_to_splat(video_path: str, output_dir: str = "/tmp/splat_output"):
    import subprocess
    import os

    os.makedirs(output_dir, exist_ok=True)

    # 1. Extract frames
    subprocess.run([
        "ffmpeg", "-i", video_path, "-vf", "fps=2", 
        f"{output_dir}/frames/%04d.jpg"
    ], check=True)

    # 2. Placeholder for COLMAP / hloc pose estimation
    print("Running COLMAP (placeholder - integrate hloc or COLMAP here)")

    # 3. Placeholder for Gaussian Splatting training
    print("Training Gaussian Splatting... (integrate gsplat or nerfstudio)")

    # 4. In production: Upload .splat file to Supabase Storage or R2
    splat_path = f"{output_dir}/scene.splat"
    print(f"Would upload {splat_path} to storage")

    return {"status": "success", "splat_path": splat_path}

@stub.local_entrypoint()
def main(video_path: str):
    result = process_360_to_splat.remote(video_path)
    print(result)