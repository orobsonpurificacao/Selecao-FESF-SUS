from database import SessionLocal, engine
import models

models.Base.metadata.create_all(bind=engine)

RESIDENTES = [
    {"nome": "Mônica Silva Santos",      "crm": "111222/BA", "especialidade": "Medicina de Família e Comunidade", "unidade": "USF Vila Esperança"},
    {"nome": "Magali Oliveira Costa",    "crm": "111333/BA", "especialidade": "Enfermagem em Saúde da Família",   "unidade": "USF Jardim das Flores"},
    {"nome": "Cebolinha Pereira Lima",   "crm": "111444/BA", "especialidade": "Odontologia em Saúde Coletiva",   "unidade": "USF Centro Comunitário"},
    {"nome": "Cascão Ferreira Souza",    "crm": "111555/BA", "especialidade": "Medicina de Família e Comunidade", "unidade": "USF Vila Esperança"},
    {"nome": "Denise Carvalho Mendes",   "crm": "111666/BA", "especialidade": "Fisioterapia em Atenção Básica",  "unidade": "USF Boa Esperança"},
    {"nome": "Franjinha Alves Rocha",    "crm": "111777/BA", "especialidade": "Psicologia em Saúde Coletiva",    "unidade": "USF Jardim das Flores"},
]

TAREFAS = [
    # Mônica (id=1)
    {"tipo": "Visita Domiciliar",       "descricao": "Acompanhamento de paciente hipertenso — família Souza", "data_prevista": "2026-07-02", "concluida": False, "residente_id": 1},
    {"tipo": "Consulta Ambulatorial",   "descricao": "Atendimento de pré-natal — 2º trimestre",               "data_prevista": "2026-07-03", "concluida": True,  "residente_id": 1},
    {"tipo": "Reunião de Equipe",       "descricao": "Discussão de casos da semana com equipe da USF",        "data_prevista": "2026-07-04", "concluida": False, "residente_id": 1},
    # Magali (id=2)
    {"tipo": "Visita Domiciliar",       "descricao": "Curativo e orientação — paciente acamado",              "data_prevista": "2026-07-02", "concluida": True,  "residente_id": 2},
    {"tipo": "Grupo Educativo",         "descricao": "Grupo de gestantes — orientações nutricionais",          "data_prevista": "2026-07-05", "concluida": False, "residente_id": 2},
    # Cebolinha (id=3)
    {"tipo": "Consulta Ambulatorial",   "descricao": "Primeira consulta odontológica — triagem escolar",      "data_prevista": "2026-07-03", "concluida": False, "residente_id": 3},
    {"tipo": "Ação Coletiva",           "descricao": "Escovação supervisionada na escola municipal",          "data_prevista": "2026-07-07", "concluida": False, "residente_id": 3},
    # Cascão (id=4)
    {"tipo": "Visita Domiciliar",       "descricao": "Busca ativa — paciente faltoso ao acompanhamento de TB","data_prevista": "2026-07-04", "concluida": False, "residente_id": 4},
    {"tipo": "Reunião de Equipe",       "descricao": "Planejamento de ações de julho com coordenadora",       "data_prevista": "2026-07-04", "concluida": True,  "residente_id": 4},
    # Denise (id=5)
    {"tipo": "Atendimento Fisioterapêutico", "descricao": "Reabilitação motora — pós-AVC, 3ª sessão",        "data_prevista": "2026-07-02", "concluida": True,  "residente_id": 5},
    {"tipo": "Grupo Educativo",         "descricao": "Grupo de idosos — exercícios de mobilidade",            "data_prevista": "2026-07-06", "concluida": False, "residente_id": 5},
    # Franjinha (id=6)
    {"tipo": "Acolhimento",             "descricao": "Escuta qualificada — demanda espontânea de saúde mental","data_prevista": "2026-07-03","concluida": False, "residente_id": 6},
    {"tipo": "Matriciamento",           "descricao": "Reunião com CAPS para discussão de caso compartilhado", "data_prevista": "2026-07-08", "concluida": False, "residente_id": 6},
]


def seed():
    db = SessionLocal()
    try:
        if db.query(models.Residente).count() > 0:
            print("Banco já populado. Pulando seed.")
            return
        for r in RESIDENTES:
            db.add(models.Residente(**r))
        db.commit()

        residentes = db.query(models.Residente).all()
        id_map = {r.nome.split()[0]: r.id for r in residentes}

        for t in TAREFAS:
            db.add(models.Tarefa(**t))
        db.commit()
        print(f"Seed concluído: {len(RESIDENTES)} residentes, {len(TAREFAS)} tarefas.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
