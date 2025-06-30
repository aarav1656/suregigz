# AI Content Analysis API

A FastAPI-based service that uses LLaVA-NeXT models to generate intelligent summaries and descriptions of video content, analyze images, and provide AI-powered chat capabilities with context about deliverables.

## Features

- **Video Summarization**: Using state-of-the-art LLaVA-NeXT-Video model
- **Image Analysis**: Intelligent image description and analysis
- **AI Chat**: Context-aware chat about deliverables and general topics
- Custom question-based content analysis
- API key authentication
- CORS support
- Health check endpoint
- Efficient video frame sampling
- GPU acceleration support (when available)

## Prerequisites

- Python 3.8 or higher
- CUDA-capable GPU (recommended for better performance)
- Sufficient disk space for model weights (~15GB for both models)

## Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd <repository-name>
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the project root:
```env
API_KEY=your-secret-api-key-here
```

## Usage

1. Start the server:
```bash
python api.py
```

The server will start on `http://localhost:2284`

### API Endpoints

#### POST /summarize/video
Generate a summary for an uploaded video.

**Headers:**
- `X-API-Key`: Your API key

**Parameters:**
- `video`: Video file (multipart/form-data)
- `question`: Optional question about the video (default: "Describe this video:")

**Response:**
```json
{
    "status": "success",
    "summary": "Generated video summary...",
    "question": "Your question",
    "type": "video"
}
```

#### POST /summarize/image
Generate a summary for an uploaded image.

**Headers:**
- `X-API-Key`: Your API key

**Parameters:**
- `image`: Image file (multipart/form-data)
- `question`: Optional question about the image (default: "Describe this image:")

**Response:**
```json
{
    "status": "success",
    "summary": "Generated image analysis...",
    "question": "Your question",
    "type": "image"
}
```

#### POST /chat
Chat with AI about deliverables and context.

**Headers:**
- `X-API-Key`: Your API key

**Parameters:**
- `messages`: JSON string containing conversation messages
- `context`: Optional context about deliverables

**Example messages format:**
```json
[
    {"role": "user", "content": "What are the key deliverables for this project?"},
    {"role": "assistant", "content": "Based on the context..."},
    {"role": "user", "content": "Can you elaborate on the timeline?"}
]
```

**Response:**
```json
{
    "status": "success",
    "response": "AI response...",
    "context": "Your context",
    "type": "chat"
}
```

#### GET /health
Check the API health status.

**Response:**
```json
{
    "status": "healthy",
    "models_loaded": true,
    "device": "cuda/cpu",
    "endpoints": [
        "/summarize/video",
        "/summarize/image",
        "/chat",
        "/health"
    ]
}
```

## Model Information

This API uses multiple LLaVA-NeXT models:

### Video Model (LLaVA-NeXT-Video-7B)
- Capable of understanding video content
- Generates detailed descriptions
- Answers questions about video content
- Processes multiple frames efficiently

### Image Model (LLaVA-NeXT-34B)
- Advanced image understanding and analysis
- Detailed image descriptions
- Question-answering about image content
- Used for both image analysis and chat functionality

## Security

- API key authentication is required for all endpoints except `/health`
- Temporary files are automatically cleaned up after processing
- CORS is configured to allow cross-origin requests

## Error Handling

The API includes comprehensive error handling for:
- Invalid API keys
- File upload issues
- Model processing errors
- JSON parsing errors
- Server errors

## Dependencies

- FastAPI: Web framework
- Uvicorn: ASGI server
- PyAV: Video processing
- PyTorch: Deep learning framework
- Transformers: Hugging Face transformers library
- Pillow: Image processing
- Python-dotenv: Environment variable management
- Other dependencies listed in requirements.txt

## Example Usage

### Video Analysis
```bash
curl -X POST "http://localhost:2284/summarize/video" \
  -H "X-API-Key: your-api-key" \
  -F "video=@your_video.mp4" \
  -F "question=What is happening in this video?"
```

### Image Analysis
```bash
curl -X POST "http://localhost:2284/summarize/image" \
  -H "X-API-Key: your-api-key" \
  -F "image=@your_image.jpg" \
  -F "question=Describe the objects in this image"
```

### Chat
```bash
curl -X POST "http://localhost:2284/chat" \
  -H "X-API-Key: your-api-key" \
  -F "messages=[{\"role\":\"user\",\"content\":\"What are the project deliverables?\"}]" \
  -F "context=This is a software development project with timeline of 3 months"
```

## License

[Your License]

## Contributing

[Your contribution guidelines] 