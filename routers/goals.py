from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import date
from utils.db import get_connection
from routers.auth import get_current_user

router = APIRouter()

class GoalCreateModel(BaseModel):
    target_value: int
    start_date: date
    end_date: date

@router.post("/api/goals/create")
def create_goal(
    goal: GoalCreateModel,
    current_user=Depends(get_current_user)
):
    user_id = current_user

    if goal.target_value <= 0:
        raise HTTPException(status_code=400, detail="Target must be greater than 0")

    if goal.end_date <= goal.start_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id FROM user_goals
        WHERE user_id = %s AND status = 'ACTIVE'
    """, (user_id,))

    if cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=400, detail="You already have an active goal")

    cur.execute("""
        INSERT INTO user_goals
        (user_id, target_value, current_value, start_date, end_date, status)
        VALUES (%s, %s, 0, %s, %s, 'ACTIVE')
        RETURNING id, user_id, target_value, current_value, start_date, end_date, status, created_at, updated_at;
    """, (
        user_id,
        goal.target_value,
        goal.start_date,
        goal.end_date
    ))

    new_goal = cur.fetchone()
    conn.commit()

    cur.close()
    conn.close()

    return {
        "id": new_goal[0],
        "user_id": new_goal[1],
        "target_value": new_goal[2],
        "current_value": new_goal[3],
        "start_date": new_goal[4],
        "end_date": new_goal[5],
        "status": new_goal[6],
        "created_at": new_goal[7],
        "updated_at": new_goal[8],
    }

@router.get("/api/goals/active")
def get_active_goal(current_user=Depends(get_current_user)):

    user_id = current_user

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, target_value, current_value, start_date, end_date, status
        FROM user_goals
        WHERE user_id = %s AND status = 'ACTIVE'
    """, (user_id,))

    goal = cur.fetchone()

    cur.close()
    conn.close()

    if not goal:
        return {"goal": None}

    return {
        "goal": {
            "id": goal[0],
            "target_value": goal[1],
            "current_value": goal[2],
            "start_date": goal[3],
            "end_date": goal[4],
            "status": goal[5],
        }
    }
