from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Header, Form
from fastapi.security import APIKeyHeader
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
import os
import shutil
from datetime import datetime
import uvicorn
import av
import torch
import numpy as np
from transformers import LlavaNextVideoProcessor, LlavaNextVideoForConditionalGeneration, LlavaNextProcessor, LlavaNextForConditionalGeneration
from PIL import Image
import io
import json
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
        """Initialize the models and processors"""
        logger.info("Initializing LLaVA-NeXT models...")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Video model
        self.video_model_id = "llava-hf/LLaVA-NeXT-Video-7B-hf"
        self.video_processor = LlavaNextVideoProcessor.from_pretrained(self.video_model_id)
        self.video_model = LlavaNextVideoForConditionalGeneration.from_pretrained(
            self.video_model_id,
            torch_dtype=torch.float16,
            low_cpu_mem_usage=True
        ).to(self.device)
        
        # Image model
        self.image_model_id = "llava-hf/llava-v1.6-34b"
        self.image_processor = LlavaNextProcessor.from_pretrained(self.image_model_id)
        self.image_model = LlavaNextForConditionalGeneration.from_pretrained(
            self.image_model_id,
            torch_dtype=torch.float16,
            low_cpu_mem_usage=True
        ).to(self.device)
        
        logger.info(f"Models initialized on {self.device}")
    
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
            prompt = self.video_processor.apply_chat_template(conversation, add_generation_prompt=True)
            inputs = self.video_processor(
                text=prompt,
                videos=frames,
                padding=True,
                return_tensors="pt"
            ).to(self.device)
            
            # Generate summary
            with torch.no_grad():
                outputs = self.video_model.generate(
                    **inputs,
                    max_new_tokens=512,
                    do_sample=False
                )
                summary = self.video_processor.decode(outputs[0], skip_special_tokens=True)
            
            return summary
            
        except Exception as e:
            logger.error(f"Error generating video summary: {str(e)}")
            raise
    
    def get_image_summary(self, image: Image.Image, question: str = "Describe this image:") -> str:
        """Generate summary for an image"""
        try:
            # Prepare conversation
            conversation = [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": question},
                        {"type": "image_url", "image_url": {"url": "placeholder"}}
                    ]
                }
            ]
            
            # Process image
            prompt = self.image_processor.apply_chat_template(conversation, add_generation_prompt=True)
            inputs = self.image_processor(
                text=prompt,
                images=image,
                padding=True,
                return_tensors="pt"
            ).to(self.device)
            
            # Generate summary
            with torch.no_grad():
                outputs = self.image_model.generate(
                    **inputs,
                    max_new_tokens=512,
                    do_sample=False
                )
                summary = self.image_processor.decode(outputs[0], skip_special_tokens=True)
            
            return summary
            
        except Exception as e:
            logger.error(f"Error generating image summary: {str(e)}")
            raise
    
    def chat_with_context(self, messages: List[Dict[str, Any]], context: str = "") -> str:
        """Chat with context about deliverables"""
        try:
            # Prepare system message with context
            system_message = f"""You are a helpful AI assistant. You have access to the following context about deliverables:

{context}

Please provide helpful, accurate, and detailed responses based on this context."""
            
            # Format conversation
            conversation = [{"role": "system", "content": system_message}]
            conversation.extend(messages)
            
            # Use image model for text-only chat (it's more capable for general conversation)
            prompt = self.image_processor.apply_chat_template(conversation, add_generation_prompt=True)
            inputs = self.image_processor(
                text=prompt,
                padding=True,
                return_tensors="pt"
            ).to(self.device)
            
            # Generate response
            with torch.no_grad():
                outputs = self.image_model.generate(
                    **inputs,
                    max_new_tokens=1024,
                    do_sample=True,
                    temperature=0.7,
                    top_p=0.9
                )
                response = self.image_processor.decode(outputs[0], skip_special_tokens=True)
            
            return response
            
        except Exception as e:
            logger.error(f"Error in chat: {str(e)}")
            raise

# Initialize FastAPI app
app = FastAPI(
    title="AI Content Analysis API",
    description="API for generating video summaries, image analysis, and AI-powered chat using LLaVA-NeXT models",
    version="2.0.0"
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

# Temporary directories for uploaded files
UPLOAD_DIR = "temp_uploads"
IMAGE_DIR = "temp_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(IMAGE_DIR, exist_ok=True)

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

@app.post("/summarize/video")
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
            "question": question,
            "type": "video"
        })
        
    except Exception as e:
        # Clean up temporary file if it exists
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)
            
        raise HTTPException(
            status_code=500,
            detail=f"Error processing video: {str(e)}"
        )

@app.post("/summarize/image")
async def summarize_image(
    image: UploadFile = File(...),
    question: Optional[str] = "Describe this image:",
    api_key: str = Depends(verify_api_key)
):
    """
    Generate a summary for the uploaded image
    
    Args:
        image: Image file to analyze
        question: Optional question to ask about the image
        api_key: API key for authentication
    
    Returns:
        JSON response containing the image analysis
    """
    try:
        # Read and process image
        image_data = await image.read()
        pil_image = Image.open(io.BytesIO(image_data)).convert('RGB')
        
        # Generate summary using the initialized model
        summary = model_manager.get_image_summary(pil_image, question)
        
        return JSONResponse({
            "status": "success",
            "summary": summary,
            "question": question,
            "type": "image"
        })
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )

@app.post("/chat")
async def chat_endpoint(
    messages: str = Form(...),
    context: Optional[str] = Form(""),
    api_key: str = Depends(verify_api_key)
):
    """
    Chat with AI about deliverables and context
    
    Args:
        messages: JSON string containing conversation messages
        context: Optional context about deliverables
        api_key: API key for authentication
    
    Returns:
        JSON response containing the AI response
    """
    try:
        # Parse messages
        try:
            messages_list = json.loads(messages)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=400,
                detail="Invalid JSON format for messages"
            )
        
        # Validate messages format
        if not isinstance(messages_list, list):
            raise HTTPException(
                status_code=400,
                detail="Messages must be a list"
            )
        
        # Generate response
        response = model_manager.chat_with_context(messages_list, context)
        
        return JSONResponse({
            "status": "success",
            "response": response,
            "context": context,
            "type": "chat"
        })
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error in chat: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": True,
        "device": model_manager.device,
        "endpoints": [
            "/summarize/video",
            "/summarize/image", 
            "/chat",
            "/health"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=2284) 