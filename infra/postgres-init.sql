-- Exécuté une seule fois, à la création du volume PostgreSQL (MM-03).
-- Crée une seconde base réservée aux tests automatiques : ils pourront la
-- vider à volonté sans toucher aux données de démonstration.
CREATE DATABASE menumaker_test OWNER menumaker;
