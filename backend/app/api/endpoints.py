
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os

from ..database import get_db
from .. import models, schemas, auth
from ..services.gemini import analyze_code_snippet

router = APIRouter()

# Helper: Parse DB items to Schema Out
def map_explanation_to_out(item: models.Explanation) -> schemas.ExplanationOut:
    return schemas.ExplanationOut(
        id=item.id,
        user_id=item.user_id,
        code_snippet=item.code_snippet,
        language=item.language,
        model=item.model,
        created_at=item.created_at,
        is_favorite=item.is_favorite,
        summary=item.summary,
        who_should_understand=item.who_should_understand,
        purpose_of_code=item.purpose_of_code,
        plain_explanation=item.plain_explanation,
        time_complexity=item.time_complexity,
        space_complexity=item.space_complexity,
        complexity_rationale=item.complexity_rationale,
        line_by_line=json.loads(item.line_by_line_json),
        dry_run=json.loads(item.dry_run_json),
        variables=json.loads(item.variables_json),
        functions=json.loads(item.functions_json),
        suggestions=json.loads(item.suggestions_json),
        security_issues=json.loads(item.security_json),
        quiz=json.loads(item.quiz_json),
        interview_questions=json.loads(item.interview_questions_json),
        similar_problems=json.loads(item.similar_problems_json),
        related_concepts=json.loads(item.related_concepts_json)
    )

# --- Authentication Endpoints ---

@router.post("/auth/signup", response_model=schemas.UserOut)
def signup(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    normalized_email = user_data.email.strip().lower()
    db_user = db.query(models.User).filter(models.User.email == normalized_email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    
    hashed_pwd = auth.get_password_hash(user_data.password)
    new_user = models.User(email=normalized_email, hashed_password=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/auth/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    normalized_email = credentials.email.strip().lower()
    db_user = db.query(models.User).filter(models.User.email == normalized_email).first()
    if not db_user or not auth.verify_password(credentials.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    
    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/auth/profile", response_model=schemas.UserOut)
def get_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.put("/auth/profile/key", response_model=schemas.UserOut)
def update_api_key(payload: schemas.UserUpdateKey, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    current_user.gemini_api_key = payload.gemini_api_key
    db.commit()
    db.refresh(current_user)
    return current_user


# --- AI Explanation & Workspace Endpoints ---

@router.post("/explain", response_model=schemas.ExplanationOut)
def create_explanation(
    payload: schemas.ExplainRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Load Gemini API Key from environment config
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API Key is not configured on the server."
        )

    try:
        # Run AI code parsing
        analysis = analyze_code_snippet(
            code=payload.code_snippet,
            language=payload.language,
            api_key=api_key,
            model_name=payload.model
        )
        
        # Build DB Record
        db_explanation = models.Explanation(
            user_id=current_user.id,
            code_snippet=payload.code_snippet,
            language=payload.language,
            model=payload.model,
            summary=analysis.quick_summary,
            who_should_understand=analysis.who_should_understand,
            purpose_of_code=analysis.purpose_of_code,
            plain_explanation=analysis.plain_english_explanation,
            time_complexity=f"{analysis.time_complexity_worst} (Avg: {analysis.time_complexity_average}, Best: {analysis.time_complexity_best})",
            space_complexity=analysis.space_complexity,
            complexity_rationale=f"Time Rationale: {analysis.time_complexity_rationale}\nSpace Rationale: {analysis.space_complexity_rationale}",
            
            # Serialize nested models into JSON strings
            line_by_line_json=json.dumps([x.model_dump() for x in analysis.line_by_line]),
            dry_run_json=json.dumps([x.model_dump() for x in analysis.dry_run]),
            variables_json=json.dumps([x.model_dump() for x in analysis.variables]),
            functions_json=json.dumps([x.model_dump() for x in analysis.functions]),
            suggestions_json=json.dumps([x.model_dump() for x in analysis.suggestions]),
            security_json=json.dumps([x.model_dump() for x in analysis.security_issues]),
            quiz_json=json.dumps(analysis.quiz.model_dump()),
            interview_questions_json=json.dumps([x.model_dump() for x in analysis.interview_questions]),
            similar_problems_json=json.dumps([x.model_dump() for x in analysis.similar_problems]),
            related_concepts_json=json.dumps(analysis.related_concepts)
        )
        
        db.add(db_explanation)
        db.commit()
        db.refresh(db_explanation)
        
        return map_explanation_to_out(db_explanation)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate explanation: {str(e)}"
        )

@router.get("/history", response_model=List[schemas.ExplanationOut])
def get_history(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    items = db.query(models.Explanation).filter(models.Explanation.user_id == current_user.id).order_by(models.Explanation.created_at.desc()).all()
    return [map_explanation_to_out(x) for x in items]

@router.delete("/history/{explanation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_explanation(explanation_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    item = db.query(models.Explanation).filter(
        models.Explanation.id == explanation_id,
        models.Explanation.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Explanation history record not found.")
        
    db.delete(item)
    db.commit()
    return

@router.get("/favorites", response_model=List[schemas.ExplanationOut])
def get_favorites(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    items = db.query(models.Explanation).filter(
        models.Explanation.user_id == current_user.id,
        models.Explanation.is_favorite == True
    ).order_by(models.Explanation.created_at.desc()).all()
    return [map_explanation_to_out(x) for x in items]

@router.post("/favorite/{explanation_id}", response_model=schemas.ExplanationOut)
def toggle_favorite(explanation_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    item = db.query(models.Explanation).filter(
        models.Explanation.id == explanation_id,
        models.Explanation.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Explanation history record not found.")
        
    item.is_favorite = not item.is_favorite
    db.commit()
    db.refresh(item)
    return map_explanation_to_out(item)
