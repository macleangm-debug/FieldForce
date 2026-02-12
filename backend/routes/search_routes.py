"""FieldForce - Global Search Routes"""
from fastapi import APIRouter, HTTPException, Request, Depends, Query
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
import re

from auth import get_current_user

router = APIRouter(prefix="/search", tags=["Search"])


class SearchResult(BaseModel):
    id: str
    type: str  # 'form', 'project', 'submission', 'team_member'
    title: str
    subtitle: Optional[str] = None
    path: str  # Navigation path
    icon: Optional[str] = None
    metadata: Optional[dict] = None


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total: int


@router.get("/global", response_model=SearchResponse)
async def global_search(
    request: Request,
    q: str = Query(..., min_length=1, max_length=100),
    types: Optional[str] = Query(None, description="Comma-separated types: form,project,submission,team"),
    limit: int = Query(20, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    """
    Global search across forms, projects, submissions, and team members.
    Supports fuzzy matching and filters by type.
    """
    db = request.app.state.db
    results = []
    
    # Parse types filter
    type_filter = types.split(",") if types else ["form", "project", "submission", "team"]
    
    # Create regex for fuzzy search
    search_regex = re.compile(re.escape(q), re.IGNORECASE)
    
    # Get user's organizations for access control
    memberships = await db.org_members.find(
        {"user_id": current_user["user_id"]},
        {"_id": 0, "org_id": 1}
    ).to_list(100)
    org_ids = [m["org_id"] for m in memberships]
    
    # Search Forms
    if "form" in type_filter:
        forms = await db.forms.find(
            {
                "$or": [
                    {"name": {"$regex": search_regex}},
                    {"description": {"$regex": search_regex}}
                ]
            },
            {"_id": 0, "id": 1, "name": 1, "description": 1, "status": 1, "project_id": 1}
        ).limit(limit).to_list(limit)
        
        for form in forms:
            results.append(SearchResult(
                id=form["id"],
                type="form",
                title=form["name"],
                subtitle=form.get("description", "")[:100] if form.get("description") else f"Status: {form.get('status', 'draft')}",
                path=f"/forms/{form['id']}/edit",
                icon="FileText",
                metadata={"status": form.get("status")}
            ))
    
    # Search Projects
    if "project" in type_filter:
        projects = await db.projects.find(
            {
                "org_id": {"$in": org_ids},
                "$or": [
                    {"name": {"$regex": search_regex}},
                    {"description": {"$regex": search_regex}}
                ]
            },
            {"_id": 0, "id": 1, "name": 1, "description": 1}
        ).limit(limit).to_list(limit)
        
        for project in projects:
            results.append(SearchResult(
                id=project["id"],
                type="project",
                title=project["name"],
                subtitle=project.get("description", "")[:100] if project.get("description") else None,
                path=f"/projects/{project['id']}",
                icon="Folder"
            ))
    
    # Search Submissions
    if "submission" in type_filter:
        submissions = await db.submissions.find(
            {
                "$or": [
                    {"id": {"$regex": search_regex}},
                    {"enumerator_name": {"$regex": search_regex}}
                ]
            },
            {"_id": 0, "id": 1, "form_id": 1, "enumerator_name": 1, "created_at": 1}
        ).limit(limit).to_list(limit)
        
        for sub in submissions:
            results.append(SearchResult(
                id=sub["id"],
                type="submission",
                title=f"Submission {sub['id'][:12]}...",
                subtitle=f"By {sub.get('enumerator_name', 'Unknown')}",
                path=f"/submissions/{sub['id']}",
                icon="ClipboardList",
                metadata={"created_at": sub.get("created_at")}
            ))
    
    # Search Team Members
    if "team" in type_filter:
        # Get all members from user's organizations
        members = await db.org_members.find(
            {"org_id": {"$in": org_ids}},
            {"_id": 0, "user_id": 1, "role": 1}
        ).to_list(200)
        
        user_ids = list(set([m["user_id"] for m in members]))
        
        users = await db.users.find(
            {
                "id": {"$in": user_ids},
                "$or": [
                    {"name": {"$regex": search_regex}},
                    {"email": {"$regex": search_regex}}
                ]
            },
            {"_id": 0, "id": 1, "name": 1, "email": 1}
        ).limit(limit).to_list(limit)
        
        for user in users:
            results.append(SearchResult(
                id=user["id"],
                type="team",
                title=user.get("name", "Unknown"),
                subtitle=user.get("email"),
                path=f"/team?user={user['id']}",
                icon="User"
            ))
    
    # Sort by relevance (exact matches first)
    def relevance_score(result):
        title_lower = result.title.lower()
        q_lower = q.lower()
        if title_lower == q_lower:
            return 0
        if title_lower.startswith(q_lower):
            return 1
        if q_lower in title_lower:
            return 2
        return 3
    
    results.sort(key=relevance_score)
    
    return SearchResponse(
        query=q,
        results=results[:limit],
        total=len(results)
    )


@router.get("/recent")
async def get_recent_searches(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get user's recent search queries"""
    db = request.app.state.db
    
    recent = await db.search_history.find(
        {"user_id": current_user["user_id"]},
        {"_id": 0, "query": 1, "timestamp": 1}
    ).sort("timestamp", -1).limit(10).to_list(10)
    
    return {"recent": recent}


@router.post("/history")
async def save_search_history(
    request: Request,
    data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Save a search query to history"""
    db = request.app.state.db
    
    await db.search_history.update_one(
        {"user_id": current_user["user_id"], "query": data.get("query")},
        {
            "$set": {
                "user_id": current_user["user_id"],
                "query": data.get("query"),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )
    
    return {"success": True}
