# Video Summarization API

A FastAPI-based service that uses the LLaVA-NeXT-Video model to generate intelligent summaries and descriptions of video content.

## Features

- Video summarization using state-of-the-art LLaVA-NeXT-Video model
- Custom question-based video analysis
- API key authentication
- CORS support
- Health check endpoint
- Efficient video frame sampling
- GPU acceleration support (when available)

## Prerequisites

- Python 3.8 or higher
- CUDA-capable GPU (recommended for better performance)
- Sufficient disk space for model weights

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

#### POST /summarize
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
    "question": "Your question"
}
```

#### GET /health
Check the API health status.

**Response:**
```json
{
    "status": "healthy",
    "model_loaded": true,
    "device": "cuda/cpu"
}
```

## Model Information

This API uses the LLaVA-NeXT-Video-7B model, which is capable of:
- Understanding video content
- Generating detailed descriptions
- Answering questions about video content
- Processing multiple frames efficiently

## Security

- API key authentication is required for all endpoints except `/health`
- Temporary video files are automatically cleaned up after processing
- CORS is configured to allow cross-origin requests

## Error Handling

The API includes comprehensive error handling for:
- Invalid API keys
- File upload issues
- Model processing errors
- Server errors

## Dependencies

- FastAPI: Web framework
- Uvicorn: ASGI server
- PyAV: Video processing
- PyTorch: Deep learning framework
- Transformers: Hugging Face transformers library
- Python-dotenv: Environment variable management
- Other dependencies listed in requirements.txt

## License

[Your License]

## Contributing

[Your contribution guidelines] 