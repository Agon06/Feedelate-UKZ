-- Krijo databasën feedelate
CREATE DATABASE IF NOT EXISTS feedelate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Përdor databasën
USE feedelate;

-- Tabela e krijuar automatikisht nga TypeORM kur të nisësh serverin me synchronize: true
-- Por nëse dëshiron, mund t'i krijohet manualisht edhe

SELECT 'Database feedelate u krijua me sukses!' AS message;
