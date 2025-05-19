from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Header
from fastapi.security import APIKeyHeader
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os
import shutil
from datetime import datetime
import uvicorn
import av
import torch
import numpy as np
from transformers import LlavaNextVideoProcessor, LlavaNextVideoForConditionalGeneration
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelManager:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize the model and processor"""
        logger.info("Initializing LLaVA-NeXT-Video model...")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_id = "llava-hf/LLaVA-NeXT-Video-7B-hf"
        
        self.processor = LlavaNextVideoProcessor.from_pretrained(self.model_id)
        self.model = LlavaNextVideoForConditionalGeneration.from_pretrained(
            self.model_id,
            torch_dtype=torch.float16,
            low_cpu_mem_usage=True
        ).to(self.device)
        logger.info(f"Model initialized on {self.device}")
    
    def get_video_summary(self, video_path: str, question: str = "Describe this video:") -> str:
        """Generate summary for a video"""
        try:
            # Extract frames using PyAV
            container = av.open(video_path)
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
            prompt = self.processor.apply_chat_template(conversation, add_generation_prompt=True)
            inputs = self.processor(
                text=prompt,
                videos=frames,
                padding=True,
                return_tensors="pt"
            ).to(self.device)
            
            # Generate summary
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=512,
                    do_sample=False
                )
                summary = self.processor.decode(outputs[0], skip_special_tokens=True)
            
            return summary
            
        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            raise

# Initialize FastAPI app
app = FastAPI(
    title="Video Summarization API",
    description="API for generating video summaries using LLaVA-NeXT-Video",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# API Key configuration
API_KEY = os.getenv("API_KEY", "your-secret-api-key-here")  # Change this in production
api_key_header = APIKeyHeader(name="X-API-Key")

# Temporary directory for uploaded videos
UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize model manager
model_manager = ModelManager()

async def verify_api_key(api_key: str = Depends(api_key_header)):
    """Verify the API key from the request header"""
    if api_key != API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid API key"
        )
    return api_key

@app.post("/summarize")
async def summarize_video(
    video: UploadFile = File(...),
    question: Optional[str] = "Describe this video:",
    api_key: str = Depends(verify_api_key)
):
    """
    Generate a summary for the uploaded video
    
    Args:
        video: Video file to summarize
        question: Optional question to ask about the video
        api_key: API key for authentication
    
    Returns:
        JSON response containing the video summary
    """
    try:
        # Save uploaded video to temporary file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        temp_video_path = os.path.join(UPLOAD_DIR, f"video_{timestamp}.mp4")
        
        with open(temp_video_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
        
        # Generate summary using the initialized model
        summary = model_manager.get_video_summary(temp_video_path, question)
        
        # Clean up temporary file
        os.remove(temp_video_path)
        
        return JSONResponse({
            "status": "success",
            "summary": summary,
            "question": question
        })
        
    except Exception as e:
        # Clean up temporary file if it exists
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)
            
        raise HTTPException(
            status_code=500,
            detail=f"Error processing video: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": True,
        "device": model_manager.device
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=2284) 