import av
import torch
import numpy as np
from transformers import LlavaNextVideoProcessor, LlavaNextVideoForConditionalGeneration
import logging

def get_video_summary(video_path: str, question: str = "Describe this video:") -> str:
    """
    Generate a summary for a video using LLaVA-NeXT-Video
    
    Args:
        video_path: Path to video file
        question: Question to ask about the video
        
    Returns:
        Summary of the video
    """
    # Initialize logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    try:
        # Load model and processor
        logger.info("Loading LLaVA-NeXT-Video model...")
        model_id = "llava-hf/LLaVA-NeXT-Video-7B-hf"
        processor = LlavaNextVideoProcessor.from_pretrained(model_id)
        model = LlavaNextVideoForConditionalGeneration.from_pretrained(
            model_id,
            torch_dtype=torch.float16,
            low_cpu_mem_usage=True
        ).to("cuda" if torch.cuda.is_available() else "cpu")
        
        # Extract frames using PyAV
        logger.info("Extracting frames...")
        container = avx.open(video_path)
        total_frames = container.streams.video[0].frames
        
        # Sample 8 frames uniformly
        indices = np.linspace(0, total_frames - 1, 8, dtype=int)
        frames = []
        container.seek(0)
        for i, frame in enumerate(container.decode(video=0)):
            if i > indices[-1]:
                break
            if i >= indices[0] and i in indices:
                frames.append(frame)
        frames = np.stack([x.to_ndarray(format="rgb24") for x in frames])
        container.close()
        
        # Prepare conversation
        conversation = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": question},
                    {"type": "video"}
                ]
            }
        ]
        
        # Process video
        logger.info("Generating summary...")
        prompt = processor.apply_chat_template(conversation, add_generation_prompt=True)
        inputs = processor(
            text=prompt,
            videos=frames,
            padding=True,
            return_tensors="pt"
        ).to(model.device)
        
        # Generate summary
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=512,
                do_sample=False
            )
            summary = processor.decode(outputs[0], skip_special_tokens=True)
        
        return summary
        
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}")
        raise
    finally:
        # Cleanup
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

def main():
    video_path = "demo.mp4"
    try:
        summary = get_video_summary(
            video_path=video_path,
            question="Describe the content and mood of this video:"
        )
        print("\nVideo Summary:")
        print(summary)
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()
