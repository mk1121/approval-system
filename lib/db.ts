import oracledb from 'oracledb';

if (process.env.NODE_ENV === 'development') {
    // logic to auto-locate client if needed, or rely on system path
}

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const dbConfig = {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING,
};

export async function getConnection() {
    try {
        return await oracledb.getConnection(dbConfig);
    } catch (err) {
        console.error('Database connection error:', err);
        throw err;
    }
}

export async function execute(sql: string, binds: oracledb.BindParameters = [], options: oracledb.ExecuteOptions = {}) {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(sql, binds, { autoCommit: true, ...options });
        return result;
    } catch (err) {
        console.error('Execute error:', err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}
