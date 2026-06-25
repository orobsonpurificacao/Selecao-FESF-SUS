from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

import models
import database
from seed import seed

models.Base.metadata.create_all(bind=database.engine)
seed()

app = FastAPI(
    title="Residência FESF-SUS — Gestão de Tarefas",
    description="API para acompanhamento de atividades dos residentes do Programa Integrado de Residências FESF-SUS.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ──────────────────────────────────────────────

class TarefaBase(BaseModel):
    tipo: str
    descricao: Optional[str] = None
    data_prevista: Optional[str] = None
    residente_id: int

class TarefaCreate(TarefaBase):
    pass

class TarefaUpdate(BaseModel):
    tipo: Optional[str] = None
    descricao: Optional[str] = None
    data_prevista: Optional[str] = None
    concluida: Optional[bool] = None

class TarefaOut(TarefaBase):
    id: int
    concluida: bool
    criada_em: Optional[datetime]
    class Config:
        from_attributes = True

class ResidenteBase(BaseModel):
    nome: str
    crm: str
    especialidade: str
    unidade: str

class ResidenteCreate(ResidenteBase):
    pass

class ResidenteOut(ResidenteBase):
    id: int
    criado_em: Optional[datetime]
    tarefas: List[TarefaOut] = []
    class Config:
        from_attributes = True


# ── Endpoints: Residentes ─────────────────────────────────

@app.get("/", tags=["Root"])
def root():
    return {"message": "API Residência FESF-SUS", "docs": "/docs"}


@app.get("/residentes", response_model=List[ResidenteOut], tags=["Residentes"])
def listar_residentes(db: Session = Depends(database.get_db)):
    """Lista todos os residentes com suas tarefas."""
    return db.query(models.Residente).all()


@app.post("/residentes", response_model=ResidenteOut, status_code=201, tags=["Residentes"])
def criar_residente(dados: ResidenteCreate, db: Session = Depends(database.get_db)):
    """Cadastra um novo residente."""
    if db.query(models.Residente).filter(models.Residente.crm == dados.crm).first():
        raise HTTPException(status_code=400, detail="CRM já cadastrado.")
    residente = models.Residente(**dados.model_dump())
    db.add(residente)
    db.commit()
    db.refresh(residente)
    return residente


@app.get("/residentes/{residente_id}", response_model=ResidenteOut, tags=["Residentes"])
def buscar_residente(residente_id: int, db: Session = Depends(database.get_db)):
    """Retorna um residente pelo ID."""
    r = db.query(models.Residente).filter(models.Residente.id == residente_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Residente não encontrado.")
    return r


@app.delete("/residentes/{residente_id}", status_code=204, tags=["Residentes"])
def deletar_residente(residente_id: int, db: Session = Depends(database.get_db)):
    """Remove um residente e suas tarefas."""
    r = db.query(models.Residente).filter(models.Residente.id == residente_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Residente não encontrado.")
    db.delete(r)
    db.commit()
    return None


# ── Endpoints: Tarefas ────────────────────────────────────

@app.get("/tarefas", response_model=List[TarefaOut], tags=["Tarefas"])
def listar_tarefas(
    residente_id: Optional[int] = None,
    concluida: Optional[bool] = None,
    db: Session = Depends(database.get_db)
):
    """Lista tarefas. Filtra por residente e/ou status."""
    q = db.query(models.Tarefa)
    if residente_id:
        q = q.filter(models.Tarefa.residente_id == residente_id)
    if concluida is not None:
        q = q.filter(models.Tarefa.concluida == concluida)
    return q.all()


@app.post("/tarefas", response_model=TarefaOut, status_code=201, tags=["Tarefas"])
def criar_tarefa(dados: TarefaCreate, db: Session = Depends(database.get_db)):
    """Cria uma nova tarefa para um residente."""
    if not db.query(models.Residente).filter(models.Residente.id == dados.residente_id).first():
        raise HTTPException(status_code=404, detail="Residente não encontrado.")
    tarefa = models.Tarefa(**dados.model_dump())
    db.add(tarefa)
    db.commit()
    db.refresh(tarefa)
    return tarefa


@app.get("/tarefas/{tarefa_id}", response_model=TarefaOut, tags=["Tarefas"])
def buscar_tarefa(tarefa_id: int, db: Session = Depends(database.get_db)):
    """Retorna uma tarefa pelo ID."""
    t = db.query(models.Tarefa).filter(models.Tarefa.id == tarefa_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
    return t


@app.patch("/tarefas/{tarefa_id}", response_model=TarefaOut, tags=["Tarefas"])
def atualizar_tarefa(tarefa_id: int, dados: TarefaUpdate, db: Session = Depends(database.get_db)):
    """Atualiza parcialmente uma tarefa (incluindo marcar como concluída)."""
    t = db.query(models.Tarefa).filter(models.Tarefa.id == tarefa_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(t, campo, valor)
    db.commit()
    db.refresh(t)
    return t


@app.delete("/tarefas/{tarefa_id}", status_code=204, tags=["Tarefas"])
def deletar_tarefa(tarefa_id: int, db: Session = Depends(database.get_db)):
    """Remove uma tarefa."""
    t = db.query(models.Tarefa).filter(models.Tarefa.id == tarefa_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
    db.delete(t)
    db.commit()
    return None
