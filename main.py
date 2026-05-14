from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class WorkItem(BaseModel):
    n: str # Название
    p: float # Цена
    u: str # Unit (floor/wall)

class RoomReq(BaseModel):
    w: float; l: float; h: float; o: float
    works: List[WorkItem]

@app.post("/calculate")
async def calculate(rooms: List[RoomReq]):
    total = 0
    for r in rooms:
        f_area = r.w * r.l
        w_area = (2 * (r.w + r.l) * r.h) - r.o
        for wk in r.works:
            total += wk.p * (f_area if wk.u == "f" else w_area)
    return {"total_cost": f"{round(total):,}".replace(",", " ")}
