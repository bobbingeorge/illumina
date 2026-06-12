import json
import re
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE

app = FastAPI(title="IlluminaReviewer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_BASE_URL = "http://localhost:11434"
MODEL = "qwen2.5-coder:7b-instruct"


class ReviewRequest(BaseModel):
    code: str
    language: str = "python"


class ReviewComment(BaseModel):
    line: int
    severity: str
    category: str
    comment: str
    suggestion: str = ""


class ReviewResponse(BaseModel):
    comments: List[ReviewComment]
    summary: str


def parse_llm_response(content: str) -> list:
    """Extract JSON array from LLM response, handling markdown fences."""
    # Try to find JSON array in the response
    json_match = re.search(r'\[.*\]', content, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass
    # Try the whole content
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return []


@app.post("/api/review", response_model=ReviewResponse)
async def review_code(request: ReviewRequest):
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")

    if len(request.code) > 50000:
        raise HTTPException(status_code=400, detail="Code too long (max 50000 chars)")

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/v1/chat/completions",
                json={
                    "model": MODEL,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": USER_PROMPT_TEMPLATE.format(code=request.code, language=request.language)},
                    ],
                    "temperature": 0.3,
                    "max_tokens": 4096,
                },
            )

        if response.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Ollama returned status {response.status_code}")

        data = response.json()
        content = data["choices"][0]["message"]["content"]
        comments = parse_llm_response(content)

        # Validate and sanitize comments
        validated_comments = []
        for c in comments:
            if isinstance(c, dict) and "line" in c and "comment" in c:
                validated_comments.append(ReviewComment(
                    line=c.get("line", 1),
                    severity=c.get("severity", "info"),
                    category=c.get("category", "general"),
                    comment=c.get("comment", ""),
                    suggestion=c.get("suggestion", ""),
                ))

        # Generate summary
        error_count = sum(1 for c in validated_comments if c.severity == "error")
        warning_count = sum(1 for c in validated_comments if c.severity == "warning")
        info_count = sum(1 for c in validated_comments if c.severity == "info")

        summary = f"Found {len(validated_comments)} issues: {error_count} errors, {warning_count} warnings, {info_count} suggestions"

        return ReviewResponse(comments=validated_comments, summary=summary)

    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Cannot connect to Ollama. Make sure Ollama is running: 'ollama serve'"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Review failed: {str(e)}")


@app.get("/api/health")
async def health():
    return {"status": "ok", "model": MODEL}


@app.get("/api/samples")
async def get_samples():
    """Return sample Python code snippets for demo."""
    return {
        "samples": [
            {
                "name": "Python - Security",
                "language": "python",
                "code": """import pickle
import subprocess
import hashlib

def load_user_data(user_input):
    data = pickle.loads(user_input)
    return data

def run_command(cmd):
    result = subprocess.call(cmd, shell=True)
    return result

def hash_password(password):
    return hashlib.md5(password.encode()).hexdigest()

def query_db(username):
    query = "SELECT * FROM users WHERE name = '" + username + "'"
    return query
""",
            },
            {
                "name": "JavaScript - Bad Patterns",
                "language": "javascript",
                "code": """const express = require('express');
const app = express();

app.get('/user', (req, res) => {
    const id = req.query.id;
    const query = `SELECT * FROM users WHERE id = ${id}`;
    db.query(query, (err, result) => {
        res.send(result);
    });
});

function parseJSON(input) {
    return eval('(' + input + ')');
}

var password = "admin123";

app.listen(3000);
""",
            },
            {
                "name": "Java - Issues",
                "language": "java",
                "code": """import java.util.*;
import java.io.*;

public class UserService {
    public String getUser(String id) {
        try {
            Connection conn = DriverManager.getConnection(url);
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE id = '" + id + "'");
            return rs.getString("name");
        } catch (Exception e) {
            return null;
        }
    }

    public void processItems(ArrayList items) {
        for (int i = 0; i < items.size(); i++) {
            if (items.get(i).equals(null)) {
                items.remove(i);
            }
        }
    }

    public boolean compareStrings(String a, String b) {
        return a == b;
    }
}
""",
            },
            {
                "name": "C++ - Memory Issues",
                "language": "cpp",
                "code": """#include <iostream>
#include <cstring>
using namespace std;

char* getName() {
    char name[100];
    cin >> name;
    return name;
}

void processArray(int* arr, int size) {
    int* copy = new int[size];
    memcpy(copy, arr, size);
    // forgot to delete[] copy
}

class Resource {
public:
    int* data;
    Resource(int n) { data = new int[n]; }
    // missing destructor, copy constructor, assignment operator
};

int main() {
    int* ptr = NULL;
    cout << *ptr << endl;
    return 0;
}
""",
            },
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
