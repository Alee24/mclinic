/**
 * M-Clinic Data Migration Script
 * Transforms old users table data to new schema
 */

const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_FILE = path.join(__dirname, '..', 'old-users-data.sql');
const OUTPUT_FILE = path.join(__dirname, '..', 'transformed-users.sql');

/**
 * Parse SQL INSERT statement and extract values
 */
function parseInsertStatement(sqlContent) {
    console.log('📖 Parsing SQL INSERT statement...');

    // Extract the VALUES part
    const valuesMatch = sqlContent.match(/VALUES\s*\n([\s\S]*);/i);
    if (!valuesMatch) {
        throw new Error('Could not find VALUES clause in SQL');
    }

    const valuesString = valuesMatch[1];

    // Split by row (each row starts with opening parenthesis)
    const rows = [];
    let currentRow = '';
    let inString = false;
    let stringChar = null;
    let parenDepth = 0;

    for (let i = 0; i < valuesString.length; i++) {
        const char = valuesString[i];
        const prevChar = i > 0 ? valuesString[i - 1] : '';

        // Track string boundaries
        if ((char === "'" || char === '"') && prevChar !== '\\') {
            if (!inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar) {
                inString = false;
                stringChar = null;
            }
        }

        // Track parentheses depth
        if (!inString) {
            if (char === '(') parenDepth++;
            if (char === ')') parenDepth--;
        }

        currentRow += char;

        // End of row detected
        if (!inString && parenDepth === 0 && currentRow.trim().endsWith(')')) {
            const trimmed = currentRow.trim();
            if (trimmed.startsWith('(')) {
                rows.push(trimmed);
            }
            currentRow = '';
        }
    }

    console.log(`✅ Found ${rows.length} user records`);
    return rows;
}

/**
 * Parse a single row of values
 */
function parseRow(rowString) {
    // Remove outer parentheses
    const content = rowString.slice(1, -1);

    const values = [];
    let current = '';
    let inString = false;
    let stringChar = null;
    let parenDepth = 0;

    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const prevChar = i > 0 ? content[i - 1] : '';

        // Track string boundaries
        if ((char === "'" || char === '"') && prevChar !== '\\') {
            if (!inString) {
                inString = true;
                stringChar = char;
                current += char;
                continue;
            } else if (char === stringChar) {
                inString = false;
                current += char;
                stringChar = null;
                continue;
            }
        }

        // Track parentheses (for NULL values, etc)
        if (!inString) {
            if (char === '(') parenDepth++;
            if (char === ')') parenDepth--;
        }

        // Split on comma outside of strings
        if (char === ',' && !inString && parenDepth === 0) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    // Add last value
    if (current.trim()) {
        values.push(current.trim());
    }

    return values;
}

/**
 * Clean and format a value
 */
function cleanValue(value) {
    if (value === 'NULL' || value === 'null') {
        return null;
    }

    // Remove quotes
    if ((value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"'))) {
        return value.slice(1, -1);
    }

    return value;
}

/**
 * Split full name into first and last name
 */
function splitName(fullName) {
    if (!fullName) return { fname: '', lname: '' };

    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
        return { fname: parts[0], lname: '' };
    }

    return {
        fname: parts[0],
        lname: parts.slice(1).join(' ')
    };
}

/**
 * Transform old user record to new schema
 */
function transformUser(values) {
    // Old schema columns (based on your INSERT):
    // 0: id, 1: name, 2: email, 3: reg_code, 4: password, 5: mobile, 
    // 6: address, 7: location_id, 8: status, 9: profile_image, 
    // 10: created_at, 11: updated_at, 12: is_suspended, 13: suspended_by

    const id = cleanValue(values[0]);
    const name = cleanValue(values[1]);
    const email = cleanValue(values[2]);
    const password = cleanValue(values[4]);
    const mobile = cleanValue(values[5]);
    const address = cleanValue(values[6]);
    const status = cleanValue(values[8]);
    const profileImage = cleanValue(values[9]);
    const createdAt = cleanValue(values[10]);
    const updatedAt = cleanValue(values[11]);
    const isSuspended = cleanValue(values[12]);

    // Transform name
    const { fname, lname } = splitName(name);

    // Calculate final status (0 if suspended, otherwise original status)
    const finalStatus = isSuspended === '1' ? 0 : (status || 1);

    return {
        email,
        password,
        mobile,
        address,
        status: finalStatus,
        createdAt,
        updatedAt,
        fname,
        lname,
        profileImage
    };
}

/**
 * Format value for SQL
 */
function formatSqlValue(value) {
    if (value === null || value === undefined || value === '') {
        return 'NULL';
    }

    // Escape single quotes
    const escaped = String(value).replace(/'/g, "''");
    return `'${escaped}'`;
}

/**
 * Generate SQL INSERT statement
 */
function generateInsertSql(users) {
    console.log('🔄 Generating transformed SQL...');

    let sql = `-- Transformed Users Data for New M-Clinic System
-- Generated: ${new Date().toISOString()}
-- Total Records: ${users.length}

USE mclinic;

-- Disable foreign key checks for faster import
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO \`users\` (\`email\`, \`password\`, \`mobile\`, \`address\`, \`status\`, \`created_at\`, \`updated_at\`, \`fname\`, \`lname\`, \`profile_image\`)
VALUES\n`;

    const rows = users.map((user, index) => {
        const values = [
            formatSqlValue(user.email),
            formatSqlValue(user.password),
            formatSqlValue(user.mobile),
            formatSqlValue(user.address),
            user.status,
            formatSqlValue(user.createdAt),
            formatSqlValue(user.updatedAt),
            formatSqlValue(user.fname),
            formatSqlValue(user.lname),
            formatSqlValue(user.profileImage)
        ];

        const isLast = index === users.length - 1;
        return `(${values.join(', ')})${isLast ? ';' : ','}`;
    });

    sql += rows.join('\n');

    sql += `\n\n-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify import
SELECT COUNT(*) AS 'Total Users Imported' FROM users;
SELECT 'Import completed successfully!' AS Status;
`;

    return sql;
}

/**
 * Main migration function
 */
async function migrateUsers() {
    console.log('🚀 M-Clinic User Data Migration');
    console.log('================================\n');

    try {
        // Check if input file exists
        if (!fs.existsSync(INPUT_FILE)) {
            console.error(`❌ Input file not found: ${INPUT_FILE}`);
            console.log('\n📝 Please create a file named "old-users-data.sql" in the project root');
            console.log('   containing your INSERT statement from the old system.\n');
            return;
        }

        // Read input file
        console.log(`📂 Reading: ${INPUT_FILE}`);
        const sqlContent = fs.readFileSync(INPUT_FILE, 'utf8');

        // Parse INSERT statement
        const rows = parseInsertStatement(sqlContent);

        // Transform each row
        console.log('🔄 Transforming user records...');
        const transformedUsers = [];
        let skipped = 0;

        for (let i = 0; i < rows.length; i++) {
            try {
                const values = parseRow(rows[i]);
                const user = transformUser(values);

                // Skip if no email
                if (!user.email) {
                    skipped++;
                    continue;
                }

                transformedUsers.push(user);

                if ((i + 1) % 100 === 0) {
                    console.log(`   Processed ${i + 1}/${rows.length} records...`);
                }
            } catch (err) {
                console.warn(`⚠️  Warning: Failed to parse row ${i + 1}: ${err.message}`);
                skipped++;
            }
        }

        console.log(`✅ Transformed ${transformedUsers.length} records (${skipped} skipped)`);

        // Generate SQL
        const outputSql = generateInsertSql(transformedUsers);

        // Write output file
        console.log(`💾 Writing: ${OUTPUT_FILE}`);
        fs.writeFileSync(OUTPUT_FILE, outputSql, 'utf8');

        console.log('\n✅ Migration Complete!');
        console.log('================================');
        console.log(`📊 Statistics:`);
        console.log(`   - Total processed: ${rows.length}`);
        console.log(`   - Successfully transformed: ${transformedUsers.length}`);
        console.log(`   - Skipped: ${skipped}`);
        console.log(`\n📁 Output file: ${OUTPUT_FILE}`);
        console.log('\n🚀 Next steps:');
        console.log('   1. Review the transformed-users.sql file');
        console.log('   2. Run: mysql -u root mclinic < transformed-users.sql');
        console.log('   3. Verify the import in your database\n');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run migration
migrateUsers();
