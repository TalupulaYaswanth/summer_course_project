from google import genai
from google.genai import types
from ..schemas import CodeAnalysis
import json

def analyze_code_snippet(code: str, language: str, api_key: str, model_name: str = "gemini-2.5-flash") -> CodeAnalysis:
    """
    Connects to the Google Gemini API using google-genai SDK,
    submitting the code snippet and returning a structured CodeAnalysis schema.
    """
    client = genai.Client(api_key=api_key)
    
    system_instruction = (
        "You are an expert developer and technical educator. "
        "Analyze the provided code snippet in detail and return a structured JSON response matching the schema. "
        "Make sure to follow these instructions for the fields:\n"
        "1. quick_summary: High level summary of what the code does.\n"
        "2. who_should_understand: Ideal audience level (e.g. beginner, intermediate).\n"
        "3. purpose_of_code: The main objective of this script.\n"
        "4. plain_english_explanation: Beginner friendly, jargon-free explanation.\n"
        "5. line_by_line: Map critical lines to detailed explanation.\n"
        "6. time_complexity (worst, average, best, rationale): standard Big O notation and why.\n"
        "7. space_complexity: auxiliary space assessment.\n"
        "8. dry_run: step by step variable trace table.\n"
        "9. variables: list of variables, types, and their roles.\n"
        "10. functions: functions declared in code, parameter inputs, outputs, and internal logic.\n"
        "11. suggestions: optimization, readability, performance naming recommendations.\n"
        "12. security_issues: vulnerability evaluation (e.g. SQLi, overflows, unsafe inputs, race conditions).\n"
        "13. quiz: 10 MCQ questions with 4 options, 5 True/False, 5 Fill-in-the-blank (with ____), and 3 Coding tasks.\n"
        "14. interview_questions: Interview prep questions categorized by EASY, MEDIUM, and HARD.\n"
        "15. similar_problems: practice questions and conceptual targets.\n"
        "16. related_concepts: topics to learn next."
    )
    
    response = client.models.generate_content(
        model=model_name,
        contents=f"Programming Language: {language}\n\nCode Snippet:\n{code}",
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            response_schema=CodeAnalysis,
            temperature=0.15,
        )
    )
    
    # Load and validate into Pydantic
    parsed_json = json.loads(response.text)
    return CodeAnalysis(**parsed_json)
