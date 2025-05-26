<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250522125950 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE match_player ADD player_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE match_player ADD match_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE match_player ADD joined_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN match_player.joined_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE match_player ADD CONSTRAINT FK_3976836499E6F5DF FOREIGN KEY (player_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE match_player ADD CONSTRAINT FK_397683642ABEACD6 FOREIGN KEY (match_id) REFERENCES football_match (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_3976836499E6F5DF ON match_player (player_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_397683642ABEACD6 ON match_player (match_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE SCHEMA public
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE match_player DROP CONSTRAINT FK_3976836499E6F5DF
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE match_player DROP CONSTRAINT FK_397683642ABEACD6
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_3976836499E6F5DF
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_397683642ABEACD6
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE match_player DROP player_id
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE match_player DROP match_id
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE match_player DROP joined_at
        SQL);
    }
}
