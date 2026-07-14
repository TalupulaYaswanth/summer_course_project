from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# --- User & Authentication Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    gemini_api_key: Optional[str] = None

    class Config:
        from_attributes = True

class UserUpdateKey(BaseModel):
    gemini_api_key: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None


# --- Code Analysis Output Nested Schemas ---
class LineCommentary(BaseModel):
    line_or_range: str = Field(description="Line number(s), e.g., 'Line 1' or 'Lines 4-7'")
    code_snippet: str = Field(description="Original code snippet of the referenced line")
    explanation: str = Field(description="Helpful explanation of the code snippet logic")

class DryRunStep(BaseModel):
    step_number: int = Field(description="The step number starting at 1")
    code_line: str = Field(description="The line of code being executed")
    state_description: str = Field(description="Visual description of the variable states or outputs at this step, e.g. 'i = 0, sum = 0'")

class VariableDetail(BaseModel):
    name: str = Field(description="Variable name")
    data_type: str = Field(description="Variable type, e.g. 'int', 'list', 'string'")
    role: str = Field(description="Purpose or role in the algorithm")

class FunctionDetail(BaseModel):
    name: str = Field(description="Function name")
    inputs: str = Field(description="Inputs parameters and types")
    outputs: str = Field(description="Return parameters and types")
    logic: str = Field(description="Core algorithm logic summary inside this function")

class ImprovementSuggestion(BaseModel):
    category: str = Field(description="Optimization category, e.g., 'Performance', 'Readability', 'Best Practice'")
    description: str = Field(description="Rationale for this refactoring")
    before_code: str = Field(description="Original code section")
    after_code: str = Field(description="Optimized code suggestion")

class SecurityIssue(BaseModel):
    category: str = Field(description="Security risk, e.g. 'SQL Injection', 'Race Condition', 'Unsafe Inputs' or 'None'")
    severity: str = Field(description="Risk Level, e.g. 'High', 'Medium', 'Low' or 'None'")
    description: str = Field(description="Why this is unsafe, or code smell comments")
    remediation: str = Field(description="Remediation actions required")

class QuizMCQ(BaseModel):
    question: str = Field(description="Question body")
    options: List[str] = Field(description="Array of exactly 4 choices")
    correct_answer: str = Field(description="The exact text of the correct choice")
    explanation: str = Field(description="Brief explanation of why the answer is correct")

class QuizTrueFalse(BaseModel):
    question: str = Field(description="Question body")
    correct_answer: bool = Field(description="Boolean value representing the answer")
    explanation: str = Field(description="Brief explanation of the answer")

class QuizFillBlank(BaseModel):
    question: str = Field(description="Question body containing an empty blank marker like '____'")
    correct_answer: str = Field(description="The word or value that fits the blank")
    explanation: str = Field(description="Brief explanation")

class QuizCodingQuestion(BaseModel):
    question: str = Field(description="Coding task statement")
    starting_code: str = Field(description="Starting template syntax")
    sample_solution: str = Field(description="Correct sample solution snippet")
    explanation: str = Field(description="Algorithmic rationale")

class QuizPayload(BaseModel):
    mcqs: List[QuizMCQ] = Field(description="Exactly 10 multiple-choice questions based on the code logic")
    true_false: List[QuizTrueFalse] = Field(description="Exactly 5 True/False questions based on the code logic")
    fill_blanks: List[QuizFillBlank] = Field(description="Exactly 5 Fill-in-the-blank questions based on the code logic")
    coding_questions: List[QuizCodingQuestion] = Field(description="Exactly 3 coding exercise tasks related to this logic")

class InterviewQuestion(BaseModel):
    difficulty: str = Field(description="EASY, MEDIUM, or HARD")
    question: str = Field(description="Interview question statement")
    model_answer: str = Field(description="Sample high-quality response answer")

class PracticeProblem(BaseModel):
    title: str = Field(description="Name of related problem")
    difficulty: str = Field(description="Easy, Medium, or Hard")
    description: str = Field(description="Short description of the challenge")
    reference_url: Optional[str] = Field(description="Leetcode, HackerRank or general reference URL example or search term")

# --- Root Pydantic JSON Schema for AI Output ---
class CodeAnalysis(BaseModel):
    quick_summary: str = Field(description="Simple explanation of what the code does")
    who_should_understand: str = Field(description="Target audience or skill level required")
    purpose_of_code: str = Field(description="High-level purpose and goal of the code")
    plain_english_explanation: str = Field(description="Detailed plain-English walkthrough of the code avoiding jargon, written for beginners")
    
    line_by_line: List[LineCommentary] = Field(description="List explaining critical, logic-heavy code line-by-line")
    
    time_complexity_worst: str = Field(description="Worst case Big O notation, e.g., 'O(N^2)'")
    time_complexity_average: str = Field(description="Average case Big O notation, e.g., 'O(N log N)'")
    time_complexity_best: str = Field(description="Best case Big O notation, e.g., 'O(1)'")
    time_complexity_rationale: str = Field(description="Concise time complexity explanation")
    
    space_complexity: str = Field(description="Space complexity Big O notation")
    space_complexity_rationale: str = Field(description="Explanation of auxiliary and variable space used")
    
    dry_run: List[DryRunStep] = Field(description="Dry run table simulation steps")
    variables: List[VariableDetail] = Field(description="All variables, their types, and roles")
    functions: List[FunctionDetail] = Field(description="All declared functions, parameters, returns, and logic")
    suggestions: List[ImprovementSuggestion] = Field(description="Refactoring recommendations")
    security_issues: List[SecurityIssue] = Field(description="Security threats and code smells checklist")
    quiz: QuizPayload = Field(description="A full test containing MCQs, True/False, Blank fits, and programming exercises")
    interview_questions: List[InterviewQuestion] = Field(description="Interview questions categorized by difficulty level")
    similar_problems: List[PracticeProblem] = Field(description="Similar problems to practice")
    related_concepts: List[str] = Field(description="Recommended programming concepts to learn next")


# --- Requests & Database Output Schemas ---
class ExplainRequest(BaseModel):
    code_snippet: str
    language: str
    model: str = "gemini-2.5-flash"
    custom_api_key: Optional[str] = None  # Optional user override key

class ExplanationOut(BaseModel):
    id: int
    user_id: int
    code_snippet: str
    language: str
    model: str
    created_at: datetime
    is_favorite: bool
    
    # Analysis sections parsed/returned as objects directly
    summary: str
    who_should_understand: Optional[str] = None
    purpose_of_code: Optional[str] = None
    plain_explanation: str
    time_complexity: str
    space_complexity: str
    complexity_rationale: str
    
    # Complex fields parsed back into lists/dicts in python schema
    line_by_line: List[LineCommentary]
    dry_run: List[DryRunStep]
    variables: List[VariableDetail]
    functions: List[FunctionDetail]
    suggestions: List[ImprovementSuggestion]
    security_issues: List[SecurityIssue]
    quiz: QuizPayload
    interview_questions: List[InterviewQuestion]
    similar_problems: List[PracticeProblem]
    related_concepts: List[str]

    class Config:
        from_attributes = True
