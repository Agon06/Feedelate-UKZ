-- Krijo tabelën dorzimiProjektit
CREATE TABLE IF NOT EXISTS `dorzimiProjektit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentId` int NOT NULL,
  `lendaId` int NOT NULL,
  `afatiDorezimit` datetime NOT NULL,
  `piket` int NOT NULL DEFAULT 0,
  `statusi` varchar(255) NOT NULL,
  `fileDorezimi` varchar(255) NOT NULL,
  `fileName` varchar(255) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_dorzimi_student` (`studentId`),
  KEY `FK_dorzimi_lenda` (`lendaId`),
  CONSTRAINT `FK_dorzimi_student` FOREIGN KEY (`studentId`) REFERENCES `studentet` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_dorzimi_lenda` FOREIGN KEY (`lendaId`) REFERENCES `lendet` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
