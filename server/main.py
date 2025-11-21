from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
import re
from typing import List, Optional, Any

app = FastAPI(
    title="Insightforge Transcript API",
    description="API to fetch and format YouTube transcripts. Handles both Manual and Auto-Generated captions.",
    version="2.0.0"
)

# --- CORS Configuration (Crucial for React) ---
origins = [
    "http://localhost:5173",
    "https://your-vercel-app.vercel.app", 
    "*" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Models ---
class TranscriptRequest(BaseModel):
    url: str

class TranscriptResponse(BaseModel):
    video_id: str
    transcript_text: str
    transcript_markdown: str
    word_count: int

# --- Helpers ---
def extract_video_id(url: str) -> Optional[str]:
    """Extracts video ID from any YouTube URL format."""
    patterns = [
        r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
        r'(?:youtu\.be\/)([0-9A-Za-z_-]{11})',
        r'(?:embed\/)([0-9A-Za-z_-]{11})'
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def get_text_and_time(item: Any):
    """
    Universal Adapter: Handles both Dictionary and Object return types.
    This prevents the code from crashing regardless of the library version.
    """
    # Case 1: Item is a Dictionary (Standard Library)
    if isinstance(item, dict):
        return item.get('text', ''), item.get('start', 0)
    
    # Case 2: Item is an Object (Your Environment)
    if hasattr(item, 'text') and hasattr(item, 'start'):
        return item.text, item.start
        
    return "", 0

def format_transcripts(data: List[Any]):
    """Formats the raw data into Plain Text and Markdown."""
    plain_text_parts = []
    markdown_parts = ["## Transcript\n"]
    
    # Handle if data is wrapped in a parent object (FetchedTranscript)
    if hasattr(data, 'snippets'):
        data = data.snippets

    for item in data:
        text, start = get_text_and_time(item)
        
        # Clean the text
        text = text.strip().replace('\n', ' ')
        
        # Formatting
        minutes = int(start) // 60
        seconds = int(start) % 60
        timestamp = f"[{minutes:02}:{seconds:02}]"
        
        plain_text_parts.append(text)
        markdown_parts.append(f"**{timestamp}** {text}\n")
        
    return " ".join(plain_text_parts), "\n".join(markdown_parts)

# --- Endpoints ---
@app.get("/")
async def root():
    return {"message": "Insightforge API is Ready (v2.0)"}

@app.post("/api/v1/fetch", response_model=TranscriptResponse)
async def fetch_transcript(request: TranscriptRequest):
    video_id = extract_video_id(request.url)
    print(f"DEBUG: Processing Video ID: {video_id}")
    
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL.")

    try:
        # 1. Get All Available Transcripts (Metadata)
        yt_api = YouTubeTranscriptApi()
        transcript_list = yt_api.list(video_id)
        
        target_transcript = None

        # 2. Find the Best Transcript (Logic from your test.py)
        # Your video has (GENERATED) 'en'. We must catch that.
        try:
            # Try Manual English first
            target_transcript = transcript_list.find_manually_created_transcript(['en', 'en-US', 'en-GB'])
        except:
            try:
                # Fallback to Generated English (This is what your video has!)
                target_transcript = transcript_list.find_generated_transcript(['en', 'en-US', 'en-GB'])
            except:
                # Fallback to Translation (God Mode)
                try:
                    first = next(iter(transcript_list))
                    target_transcript = first.translate('en')
                except:
                    raise HTTPException(status_code=404, detail="No transcript found.")

        # 3. Fetch the Data
        # This returns the list (or object) that we need to format
        final_data = target_transcript.fetch()
        
        # 4. Format using the Universal Adapter
        plain_text, markdown_text = format_transcripts(final_data)
        
        return TranscriptResponse(
            video_id=video_id,
            transcript_text=plain_text,
            transcript_markdown=markdown_text,
            word_count=len(plain_text.split())
        )

    except Exception as e:
        print(f"ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)