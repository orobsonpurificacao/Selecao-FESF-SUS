from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Residente(Base):
    __tablename__ = "residentes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    crm = Column(String(20), unique=True, nullable=False)
    especialidade = Column(String(100), nullable=False)
    unidade = Column(String(100), nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

    tarefas = relationship("Tarefa", back_populates="residente", cascade="all, delete")


class Tarefa(Base):
    __tablename__ = "tarefas"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(100), nullable=False)
    descricao = Column(String(500), nullable=True)
    concluida = Column(Boolean, default=False)
    data_prevista = Column(String(20), nullable=True)
    residente_id = Column(Integer, ForeignKey("residentes.id"), nullable=False)
    criada_em = Column(DateTime(timezone=True), server_default=func.now())

    residente = relationship("Residente", back_populates="tarefas")
