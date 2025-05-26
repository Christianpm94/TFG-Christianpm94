<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250520192446 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE SEQUENCE football_match_id_seq INCREMENT BY 1 MINVALUE 1 START 1
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE football_match (id INT NOT NULL, created_by_id INT NOT NULL, type VARCHAR(20) NOT NULL, location VARCHAR(255) NOT NULL, date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, is_private BOOLEAN NOT NULL, join_code VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_8CE33ACEB03A8386 ON football_match (created_by_id)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN football_match.date IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE football_match ADD CONSTRAINT FK_8CE33ACEB03A8386 FOREIGN KEY (created_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE SCHEMA public
        SQL);
        $this->addSql(<<<'SQL'
            DROP SEQUENCE football_match_id_seq CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE football_match DROP CONSTRAINT FK_8CE33ACEB03A8386
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE football_match
        SQL);
    }
}
