from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    gemini_api_key = Column(String, nullable=True) # Users can store their custom API keys

    # Relationships
    explanations = relationship("Explanation", back_populates="user", cascade="all, delete-orphan")

class Explanation(Base):
    __tablename__ = "explanations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    code_snippet = Column(Text, nullable=False)
    language = Column(String, nullable=False)
    model = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_favorite = Column(Boolean, default=False)
    
    # AI Output Sections stored as Text/JSON
    summary = Column(Text, nullable=False)
    who_should_understand = Column(String, nullable=True)
    purpose_of_code = Column(Text, nullable=True)
    plain_explanation = Column(Text, nullable=False)
    time_complexity = Column(String, nullable=False)
    space_complexity = Column(String, nullable=False)
    complexity_rationale = Column(Text, nullable=False)
    
    # Store lists and complex objects as JSON strings in SQLite
    line_by_line_json = Column(Text, nullable=False)
    dry_run_json = Column(Text, nullable=False)
    variables_json = Column(Text, nullable=False)
    functions_json = Column(Text, nullable=False)
    suggestions_json = Column(Text, nullable=False)
    security_json = Column(Text, nullable=False)
    quiz_json = Column(Text, nullable=False)
    interview_questions_json = Column(Text, nullable=False)
    similar_problems_json = Column(Text, nullable=False)
    related_concepts_json = Column(Text, nullable=False)

    # Relationships
    user = relationship("User", back_populates="explanations")
