<?php

class NoChangesException extends Exception {
    // Exception spécifique lorsqu'aucune modification n'a eu lieu
    protected $message = 'Aucune modification détectée. Aucune mise à jour effectuée.';
}


/**
 * @package SQLHelper
 * @author Thinolord
 * @version 1.1.3
 * @license MIT
 * @description SQLHelper est une classe PHP pour gérer les opérations CRUD sur une base de données SQLite. Elle inclut des méthodes pour créer, lire, mettre à jour et supprimer des enregistrements dans n'importe quelle table de la base de données. La classe BISApi étend SQLHelper pour gérer spécifiquement une base de données immobilière avec des tables prédéfinies pour les utilisateurs, propriétaires, biens, unitesLocativess et locataires.
 * Ce fichier contient la classe SQLHelper pour les opérations CRUD.
 * API de gestion de la base de données global pour toute application de backend
 * copyright 2023 Thinolord
 */

class SQLHelper {
    public $db;    

    public function __construct(PDO $pdo) {
        $this->db = $pdo;
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    
    // ===================== CRUD UNIVERSEL =====================
    
    public function create($table, $data) {
        $cols = array_keys($data);
        $placeholders = array_fill(0, count($cols), '?');
        $sql = "INSERT INTO $table (" . implode(',', $cols) . ") VALUES (" . implode(',', $placeholders) . ")";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(array_values($data));
        return $this->db->lastInsertId();
    }
    
    private function normalizeValue($v){

        if ($v === null) return null;

        // Numeric
        if (is_numeric($v)) {
            return (strpos($v, '.') !== false) ? floatval($v) : intval($v);
        }

        // Boolean
        if ($v === "true" || $v === "false" || is_bool($v)) {
            return filter_var($v, FILTER_VALIDATE_BOOLEAN);
        }
        
        // Trim string
        if (is_string($v)) {
            return trim($v);
        }
        
        return $v;
    }
    
    private function parseEncodedColumn($encoded, $value, $defaultLogic="AND") {
        
        $logic = $defaultLogic;
        $col   = $encoded;
        $type  = "normal";
        $op    = "=";
        
        // ---------- Logique (prefixe) ----------
        if (str_starts_with($col, "&&")) { $logic="AND"; $col=substr($col,2); }
        elseif (str_starts_with($col, "||")) { $logic="OR"; $col=substr($col,2); }
        
        // ---------- Opérateurs en fin ----------
        // Ordre important : tester les plus longs d'abord
        $suffixes = [
            '!><' => 'notbetween',
            '><'  => 'between',
            '![]' => 'notin',
            '[]'  => 'in',
            '!~'  => 'notlike',
            '~'   => 'like',
            '!?'  => 'notnull',
            '?'   => 'null',
            '>='  => '>=',
            '<='  => '<=',
            '!'   => '<>',
            '>'   => '>',
            '<'   => '<',
            '='   => '='
        ];

        foreach ($suffixes as $suf => $meaning) {
            if (str_ends_with($col, $suf)) {
                
                $col = substr($col, 0, -strlen($suf));

                // Types spéciaux
                if (in_array($meaning, ["between","notbetween","in","notin","like","notlike","null","notnull"])) {
                    $type = $meaning;
                    return compact("logic","col","type","value");
                }
                
                // Opérateurs simples
                $type = "normal";
                $op = $meaning;
                return compact("logic","col","type","op","value");
            }
        }

        // Si aucun opérateur trouvé → "=" par défaut
        return compact("logic","col","type","op","value");
    }
    
    
    private function logicBuilder($encodedCol, $value, $defaultLogic,$forSearch=false) {
    
        $p = $this->parseEncodedColumn($encodedCol, $value, $defaultLogic);
        
        $logic = $p["logic"];
        $col   = $p["col"];
        $type  = $p["type"];
        $val   = $p["value"];
        
        switch ($type) {
            
            case "null":
                return ["logic"=>$logic, "sql"=>"$col IS NULL", "val"=>''];
            
            case "notnull":
                return ["logic"=>$logic, "sql"=>"$col IS NOT NULL", "val"=>''];
            
            case "like":
                $sqlPart = '';
                // string → LIKE
                if (is_string($val)) {
                    $sqlPart = "$col LIKE ?";
                    $val = "%{$val}%";
                }
                // non-string → comparaison stricte
                else {
                    $sqlPart = "$col = ?";
                }
                return ["logic"=>$logic, "sql"=>$sqlPart, "val"=>$val];
            
            case "notlike":
                $sqlPart = '';
                // string → LIKE
                if (is_string($val)) {
                    $sqlPart = "$col LIKE ?";
                    $val = "%{$val}%";
                }
                // non-string → comparaison stricte
                else {
                    $sqlPart = "$col <> ?";
                }
                return ["logic"=>$logic, "sql"=>$sqlPart, "val"=>$val];
            
            case "in":
                $ph = implode(",", array_fill(0, count($val), "?"));
                return ["logic"=>$logic, "sql"=>"$col IN ($ph)", "val"=>$val];
            
            case "notin":
                $ph = implode(",", array_fill(0, count($val), "?"));
                return ["logic"=>$logic, "sql"=>"$col NOT IN ($ph)", "val"=>$val];
            
            case "between":
                return ["logic"=>$logic, "sql"=>"$col BETWEEN ? AND ?", "val"=>$val];
            
            case "notbetween":
                return ["logic"=>$logic, "sql"=>"$col NOT BETWEEN ? AND ?", "val"=>$val];
            
            default:
                return ["logic"=>$logic, "sql"=>"$col {$p['op']} ?", "val"=>$val];
        }
    }
    
    function wherePartsBuilder ($where,&$whereParts,&$args,$defaultCondition,$forSeach=false) {
        foreach ($where as $encodedCol => $value) {
            $l = $this->logicBuilder($encodedCol,$value,$defaultCondition,$forSeach);
            $hasCond = str_starts_with($encodedCol, "&&") || str_starts_with($encodedCol, "||");
            if (str_starts_with($hasCond ? substr($encodedCol,2):$encodedCol,"(")) {
                $groupParts = [];
                $logic = $l['logic'];  // AND / OR détecté
                $this->wherePartsBuilder($value,$groupParts,$args,$defaultCondition,$forSeach);
                $sqlpart = "( ";
                $vl = [];
                foreach ($groupParts as $i => $part) {
                    $sqlpart .= ($i > 0 ? " {$part['logic']} " : "") . $part["sql"];
                    $vl[] = $part["val"];
                }
                $sqlpart .= " )";
                // Construction WHERE
                $whereParts[] = [
                    "logic" => $logic,
                    "sql" => $sqlpart,
                    "val" => $vl,
                ];

                continue;
            }
            // ---- CAS NORMAL ----
            $l = $this->logicBuilder($encodedCol, $value, $defaultCondition,$forSeach);
            if (is_array($l['val'])) {
                foreach ($l['val'] as $v) $args[] = $v;
            } else {
                $args[] = $l['val'];
            }
            
            $whereParts[] = [
                "logic" => $l["logic"],
                "sql"   => $l["sql"],
                "val"   => $l["val"]
            ];
        }
    }

    private function enqueu_logic_sql (&$sql,$whereParts,$limit = null, $offset = null, $order = null) {
        if ($whereParts) {
            $sql .= str_ends_with($sql," ") ? "WHERE " :" WHERE ";
            foreach ($whereParts as $i => $w) {
                $sql .= ($i > 0 ? " {$w['logic']} " : "") . $w['sql'];
            }
        }
        
        if ($order)           $sql .= " ORDER BY $order";
        if ($limit !== null)  $sql .= " LIMIT " . (int)$limit;
        if ($offset !== null) $sql .= " OFFSET " . (int)$offset;
    }
    
    public function read($table, $where = [], $limit = null, $offset = null, $defaultCondition = 'AND', $order = null) {
        $sql = "SELECT * FROM $table";
        $args = [];
        
        // -------------------------
        // 1. Construction du WHERE
        // -------------------------
        $whereParts = [];
        $this->wherePartsBuilder($where,$whereParts,$args,$defaultCondition);

        // -----------------------------------
        // 2. Construction du SQL conditionné
        // -----------------------------------
        $this->enqueu_logic_sql($sql,$whereParts,$limit,$offset,$order);
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($args);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function count(string $table, array $where = [], string $defaultCondition = 'AND'): int {
        $sql = "SELECT COUNT(*) as total FROM $table";
        $args = [];

        $whereParts = [];
        $this->wherePartsBuilder($where, $whereParts, $args, $defaultCondition);
        $this->enqueu_logic_sql($sql, $whereParts);

        $stmt = $this->db->prepare($sql);
        $stmt->execute($args);

        return (int) $stmt->fetchColumn();
    }
    
    public function countByDate(
        string $table,
        string $dateColumn,
        array $where = [],
        string $defaultCondition = 'AND'
    ): array {

        $sql = "SELECT DATE($dateColumn) as day, COUNT(*) as total FROM $table";
        $args = [];

        $whereParts = [];
        $this->wherePartsBuilder($where, $whereParts, $args, $defaultCondition);
        $this->enqueu_logic_sql($sql, $whereParts);

        $sql .= " GROUP BY day ORDER BY day ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($args);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    

    public function readtest($table, $where = [], $limit = null, $offset = null, $defaultCondition = 'AND', $order = null) {
        $sql = "SELECT * FROM $table";
        $args = [];
        
        // -------------------------
        // 1. Construction du WHERE
        // -------------------------
        $whereParts = [];
        $this->wherePartsBuilder($where,$whereParts,$args,$defaultCondition);
        
        // -----------------------------------
        // 2. Construction du SQL conditionné
        // -----------------------------------
        $this->enqueu_logic_sql($sql,$whereParts,$limit,$offset,$order);
        throw new Exception("Recuperation sql: $sql".json_encode($args));
        $stmt = $this->db->prepare($sql);
        $stmt->execute($args);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

   
    public function search(
        $table, 
        $where = [], 
        $limit = null, 
        $offset = null, 
        $defaultCondition = 'OR', 
        $order = null
    ) {
        $sql = "SELECT * FROM $table";
        $args = [];
        $parts = [];
        
        // -------------------------
        // 1. Construction du WHERE
        // -------------------------
        $this->wherePartsBuilder($where,$parts,$args,$defaultCondition);

        // -----------------------------------
        // 2. Construction du SQL conditionné
        // -----------------------------------
        $this->enqueu_logic_sql($sql,$parts,$limit,$offset,$order);
        $stmt = $this->db->prepare($sql);
        $stmt->execute($args);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    
    public function update($table, $data, $where = [], $defaultCondition = "AND") {

        if (empty($data)) {
            throw new InvalidArgumentException("No data provided for update.");
        }
        
        // On récupère la ligne existante pour vérifier les changements
        $existingData = $this->getOne($table, $where);
        if (!$existingData) {
            throw new InvalidArgumentException("Row to update not found.");
        }
        
        // -------------------------
        // 1. Construction du SET
        // -------------------------
        $set = [];
        $args = [];
        $debbug = "";
        foreach ($data as $encodedCol => $newVal) {

            // parse SET colonne (sans logique ni opérateurs comparatifs)
            $p = $this->parseEncodedColumn($encodedCol, $newVal, $defaultCondition);

            $col = $p['col'];     // colonne nettoyée
            // Normalisation SET VALUE
            $normalizedNew = $this->normalizeValue($newVal);
            $normalizedOld = $this->normalizeValue($existingData[$col]);
            
            if ($normalizedOld !== $normalizedNew) {
                $debbug .= "{$normalizedOld} !== {$normalizedNew} | ";
                $set[] = "$col = ?";
                $args[] = $normalizedNew;
            }
        }
        if (empty($set)) {
            throw new Exception("Row already updated");
        }
        
        // Génération SQL finale
        $sql = "UPDATE $table SET " . implode(", ", $set);

        // -------------------------
        // 2. Construction du WHERE
        // -------------------------
        $parts = [];
        $this->wherePartsBuilder($where,$parts,$args,$defaultCondition);

        // -----------------------------------
        // 3. Construction du SQL conditionné
        // -----------------------------------
        $this->enqueu_logic_sql($sql,$parts);
        
        // -------------------------
        // EXECUTION
        // -------------------------
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($args);
    }
        
    
    public function delete($table, $where = [], $defaultCondition = 'AND') {
        $sql = "DELETE FROM $table";
        $args = [];
        
        // -------------------------
        // 1. Construction du WHERE
        // -------------------------
        $whereParts = [];
        $this->wherePartsBuilder($where,$whereParts,$args,$defaultCondition);

        // -----------------------------------
        // 2. Construction du SQL conditionné
        // -----------------------------------
        $this->enqueu_logic_sql($sql,$whereParts);
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($args);
    }
    
    public function getOne($table, $where, $defaultCondition = 'AND') {
        $sql = "SELECT * FROM $table";
        $args = [];
        
        // -------------------------
        // 1. Construction du WHERE
        // -------------------------
        $whereParts = [];
        $this->wherePartsBuilder($where,$whereParts,$args,$defaultCondition);

        // -----------------------------------
        // 2. Construction du SQL conditionné
        // -----------------------------------
        $this->enqueu_logic_sql($sql,$whereParts,1,null);
        

        $stmt = $this->db->prepare($sql);
        $stmt->execute($args);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    

    public function exists($table, $where, $defaultCondition = 'AND') {
        $sql = "SELECT 1 FROM $table";
        $args = [];
        
        // -------------------------
        // 1. Construction du WHERE
        // -------------------------
        $whereParts = [];
        $this->wherePartsBuilder($where,$whereParts,$args,$defaultCondition);

        // -----------------------------------
        // 2. Construction du SQL conditionné
        // -----------------------------------
        $this->enqueu_logic_sql($sql,$whereParts,1);
        
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($args);

        return $stmt->fetchColumn() !== false;
    }
    
    
    
    // Créer une table dynamiquement (universel)
    public function createTable($tablename, $columns) {
        $cols = [];
        foreach ($columns as $name => $definition) {
            $cols[] = "$name $definition";
        }
        $sql = "CREATE TABLE IF NOT EXISTS $tablename (" . implode(', ', $cols) . ")";
        return $this->db->exec($sql);
    }
    
    // Supprimer une table (universel)
    public function deleteTable($tablename) {
        $sql = "DROP TABLE IF EXISTS $tablename";
        return $this->db->exec($sql);
    }

    // Ajouter une colonne à une table si elle n'existe pas
    public function addColumn($tablename, $colname, $definition) {
        if ($this->columnExists($tablename, $colname)) {
            return false; // La colonne existe déjà
        }
        $sql = "ALTER TABLE $tablename ADD COLUMN $colname $definition";
        return $this->db->exec($sql);
    }

    // Check if a column exists in a table
    public function columnExists($tablename, $colname) {
        $stmt = $this->db->prepare("PRAGMA table_info($tablename)");
        $stmt->execute();
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($columns as $column) {
            if ($column['name'] === $colname) {
                return true;
            }
        }
        return false;
    }

    // Supprimer une colonne d'une table (nécessite de recréer la table)
    public function deleteColumns($tablename, $columns) {
        foreach ($columns as $colname) {
            if (!$this->columnExists($tablename, $colname)) {
                throw new Exception("La colonne $colname n'existe pas dans la table $tablename.");
            }
        }

        // Créer une nouvelle table sans les colonnes à supprimer
        $this->db->beginTransaction();
        try {
            // Récupérer la structure de la table actuelle
            $stmt = $this->db->prepare("PRAGMA table_info($tablename)");
            $stmt->execute();
            $columnsInfo = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Créer la nouvelle table sans les colonnes à supprimer
            $newColumns = [];
            foreach ($columnsInfo as $column) {
                if (!in_array($column['name'], $columns)) {
                    $newColumns[] = $column['name'] . ' ' . $column['type'];
                }
            }

            // Construire le nom temporaire pour la nouvelle table
            $newTableName = $tablename . '_new';
            $createTableSQL = "CREATE TABLE $newTableName (" . implode(", ", $newColumns) . ")";
            $this->db->exec($createTableSQL);
            
            // Copier les données de l'ancienne table vers la nouvelle
            $columnNames = implode(", ", array_map(function($col) { return $col['name']; }, $columnsInfo));
            $insertSQL = "INSERT INTO $newTableName ($columnNames) SELECT $columnNames FROM $tablename";
            $this->db->exec($insertSQL);
            
            // Supprimer l'ancienne table
            $this->db->exec("DROP TABLE $tablename");
            
            // Renommer la nouvelle table pour prendre le nom de l'ancienne
            $this->db->exec("ALTER TABLE $newTableName RENAME TO $tablename");
            
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    // Renommer une colonne dans une table (nécessite de recréer la table)
    public function renameColumns($tablename, $columns) {
        $this->db->beginTransaction();
        try {
            // Récupérer la structure de la table actuelle
            $stmt = $this->db->prepare("PRAGMA table_info($tablename)");
            $stmt->execute();
            $columnsInfo = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Créer la nouvelle table avec les colonnes renommées
            $newColumns = [];
            foreach ($columnsInfo as $column) {
                $newName = isset($columns[$column['name']]) ? $columns[$column['name']] : $column['name'];
                $newColumns[] = "$newName " . $column['type'];
            }

            // Créer la table temporaire avec les nouveaux noms de colonnes
            $newTableName = $tablename . '_new';
            $createTableSQL = "CREATE TABLE $newTableName (" . implode(", ", $newColumns) . ")";
            $this->db->exec($createTableSQL);
            
            // Copier les données de l'ancienne table vers la nouvelle
            $columnNames = implode(", ", array_map(function($col) { return $col['name']; }, $columnsInfo));
            $insertSQL = "INSERT INTO $newTableName ($columnNames) SELECT $columnNames FROM $tablename";
            $this->db->exec($insertSQL);
            
            // Supprimer l'ancienne table
            $this->db->exec("DROP TABLE $tablename");
            
            // Renommer la nouvelle table pour prendre le nom de l'ancienne
            $this->db->exec("ALTER TABLE $newTableName RENAME TO $tablename");
            
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    // Modifier la définition d'une ou plusieurs colonnes (nécessite de recréer la table)
    public function modifyColumns($tablename, $columns) {
        $this->db->beginTransaction();
        try {
            // Récupérer la structure de la table actuelle
            $stmt = $this->db->prepare("PRAGMA table_info($tablename)");
            $stmt->execute();
            $columnsInfo = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Créer la nouvelle table avec les définitions de colonnes modifiées
            $newColumns = [];
            foreach ($columnsInfo as $column) {
                if (isset($columns[$column['name']])) {
                    $newColumns[] = $column['name'] . ' ' . $columns[$column['name']];
                } else {
                    $newColumns[] = $column['name'] . ' ' . $column['type'];
                }
            }

            // Créer la table temporaire avec les nouvelles définitions de colonnes
            $newTableName = $tablename . '_new';
            $createTableSQL = "CREATE TABLE $newTableName (" . implode(", ", $newColumns) . ")";
            $this->db->exec($createTableSQL);
            
            // Copier les données de l'ancienne table vers la nouvelle
            $columnNames = implode(", ", array_map(function($col) { return $col['name']; }, $columnsInfo));
            $insertSQL = "INSERT INTO $newTableName ($columnNames) SELECT $columnNames FROM $tablename";
            $this->db->exec($insertSQL);
            
            // Supprimer l'ancienne table
            $this->db->exec("DROP TABLE $tablename");
            
            // Renommer la nouvelle table pour prendre le nom de l'ancienne
            $this->db->exec("ALTER TABLE $newTableName RENAME TO $tablename");
            
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
    

    // Check if a table exists (universal)
    public function tableExists($tablename) {
        $driver = $this->db->getAttribute(PDO::ATTR_DRIVER_NAME);
        if ($driver === 'mysql') {
            $stmt = $this->db->prepare("SHOW TABLES LIKE ?");
            $stmt->execute([$tablename]);
            return $stmt->fetchColumn() !== false;
        } elseif ($driver === 'pgsql') {
            $stmt = $this->db->prepare("SELECT to_regclass(?)");
            $stmt->execute([$tablename]);
            return $stmt->fetchColumn() !== null;
        } else { // sqlite
            $stmt = $this->db->prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?");
            $stmt->execute([$tablename]);
            return $stmt->fetchColumn() !== false;
        }
    }

    // (Optionnel) Créer une base de données (universel, mais nécessite droits admin)
    public function createDB($dbname) {
        $driver = $this->db->getAttribute(PDO::ATTR_DRIVER_NAME);
        if ($driver === 'mysql') {
            return $this->db->exec("CREATE DATABASE IF NOT EXISTS `$dbname`");
        } elseif ($driver === 'pgsql') {
            return $this->db->exec("CREATE DATABASE \"$dbname\"");
        } elseif ($driver === 'sqlite') {
            // Pour SQLite, il suffit d'ouvrir une nouvelle connexion sur un fichier
            return new PDO('sqlite:' . $dbname);
        }
        return false;
    }

    // (Optionnel) Supprimer une base de données (universel, mais nécessite droits admin)
    public function deleteDB($dbname) {
        $driver = $this->db->getAttribute(PDO::ATTR_DRIVER_NAME);
        if ($driver === 'mysql') {
            return $this->db->exec("DROP DATABASE IF EXISTS `$dbname`");
        } elseif ($driver === 'pgsql') {
            return $this->db->exec("DROP DATABASE \"$dbname\"");
        } elseif ($driver === 'sqlite') {
            if (file_exists($dbname)) {
                return unlink($dbname);
            }
        }
        return false;
    }
    
    public function migrateDatabase($sourceDbParams=[
            'type' => 'mysql', // Type de SGBD
            'host' => 'localhost', // Hôte de la base
            'username' => 'root', // Utilisateur
            'password' => '', // Mot de passe
            'dbname' => 'source_db' // Nom de la base de données
        ], $targetDbParams=[
            'type' => 'mysql',
            'host' => 'localhost',
            'username' => 'root',
            'password' => '',
            'dbname' => 'target_db'
        ]) {
        // Connexion à la base source et à la base cible
        $sourcePdo = $this->getPdoConnection($sourceDbParams);
        $targetPdo = $this->getPdoConnection($targetDbParams);
        
        // Récupérer les tables de la base source
        $tables = $this->getTables($sourcePdo, $sourceDbParams['type']);
        
        // Commencer une transaction sur la base cible
        $targetPdo->beginTransaction();
        
        try {
            // Pour chaque table, créer la table et copier les données
            foreach ($tables as $table) {
                $tableName = $table['name'];
                
                // Récupérer et recréer la table dans la base cible
                $createTableSQL = $this->getCreateTableSQL($sourcePdo, $tableName, $sourceDbParams['type']);
                $targetPdo->exec($createTableSQL);
                
                // Copier les données
                $data = $this->getTableData($sourcePdo, $tableName, $sourceDbParams['type']);
                $this->insertTableData($targetPdo, $tableName, $data);
            }

            // Commit des modifications dans la base cible
            $targetPdo->commit();
            return true;
        } catch (Exception $e) {
            // En cas d'erreur, rollback
            $targetPdo->rollBack();
            $this->logError("Erreur lors de la migration : " . $e->getMessage());
            throw $e;
        }
    }

    private function getPdoConnection($dbParams) {
        // Extraire les paramètres de connexion
        $dbType = $dbParams['type'];
        $host = isset($dbParams['host']) ? $dbParams['host'] : 'localhost';
        $username = isset($dbParams['username']) ? $dbParams['username'] : 'root';
        $password = isset($dbParams['password']) ? $dbParams['password'] : '';

        switch ($dbType) {
            case 'mysql':
                return new PDO("mysql:host=$host;dbname={$dbParams['dbname']}", $username, $password);
            case 'pgsql':
                return new PDO("pgsql:host=$host;dbname={$dbParams['dbname']}", $username, $password);
            case 'sqlite':
                return new PDO("sqlite:{$dbParams['dbname']}");
            default:
                throw new Exception("SGBD non supporté.");
        }
    }

    private function getTables($pdo, $dbType) {
        switch ($dbType) {
            case 'mysql':
                $stmt = $pdo->query("SHOW TABLES");
                break;
            case 'pgsql':
                $stmt = $pdo->query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
                break;
            case 'sqlite':
                $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table'");
                break;
            default:
                throw new Exception("SGBD non supporté.");
        }
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getCreateTableSQL($pdo, $tableName, $dbType) {
        switch ($dbType) {
            case 'mysql':
                $stmt = $pdo->query("SHOW CREATE TABLE $tableName");
                break;
            case 'pgsql':
                $stmt = $pdo->query("SELECT pg_catalog.pg_get_tabledef('$tableName')");
                break;
            case 'sqlite':
                $stmt = $pdo->query("SELECT sql FROM sqlite_master WHERE type='table' AND name='$tableName'");
                break;
            default:
                throw new Exception("SGBD non supporté.");
        }
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $row['Create Table'] : $row['sql'];
    }

    private function getTableData($pdo, $tableName, $dbType) {
        $stmt = $pdo->query("SELECT * FROM $tableName");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function insertTableData($pdo, $tableName, $data) {
        if ($data) {
            $columns = array_keys($data[0]);
            $columnsList = implode(", ", $columns);
            $placeholders = implode(", ", array_fill(0, count($columns), '?'));
            $insertStmt = $pdo->prepare("INSERT INTO $tableName ($columnsList) VALUES ($placeholders)");
            
            foreach ($data as $row) {
                $insertStmt->execute(array_values($row));
            }
        }
    }
    
    
    /**
     * Transaction helpers (utilisent le PDO exposé par SQLHelper -> $this->db->getPDO())
     */
    public function beginTransaction(): bool {
        if (isset($this->db)) {
            $pdo = $this->db;
            $pdo->beginTransaction();
            return true;
        }
        throw new Exception('DB PDO non disponible pour beginTransaction');
    }
    
    public function commit() {
        if (isset($this->db)) {
            $this->db->commit();
            return true;
        }
        throw new Exception('DB PDO non disponible pour commit');
    }
    
    public function rollback() {
        if (isset($this->db)) {
            $this->db->rollBack();
            return true;
        }
        throw new Exception('DB PDO non disponible pour rollback');
    }

    /**
     * Helper: exécute un callable dans une transaction et rollback en cas d'exception.
     * Retourne la valeur du callable ou lance l'exception.
     */
    public function transaction(callable $fn) {
        if (!isset($this->db)) {
            throw new Exception('DB PDO non disponible pour transaction');
        }
        $pdo = $this->db;
        $pdo->beginTransaction();
        try {
            $res = $fn();
            $pdo->commit();
            return $res;
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }
    

    // Exemple de méthode de log (simple)
    private function logChanges($message) {
        // Log à un fichier ou une base de données pour traçabilité
        file_put_contents('db_changes.log', date('Y-m-d H:i:s') . " - " . $message . "\n", FILE_APPEND);
    }

    private function logError($message) {
        // Log des erreurs dans un fichier dédié
        file_put_contents('db_errors.log', date('Y-m-d H:i:s') . " - " . $message . "\n", FILE_APPEND);
    }

    public function getPDO() {
        return $this->db;
    }
}
