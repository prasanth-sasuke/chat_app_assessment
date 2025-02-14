const { performance } = require('perf_hooks');

class DBMonitor {
  static async measureQueryTime(queryFn) {
    const start = performance.now();
    const result = await queryFn();
    const end = performance.now();
    
    console.log(`Query took ${end - start}ms to execute`);
    return result;
  }

  static async getTableStats() {
    const query = `
      SELECT 
        relname as table_name,
        n_live_tup as row_count,
        pg_size_pretty(pg_total_relation_size(relid)) as total_size
      FROM pg_stat_user_tables;
    `;
    return await sequelize.query(query);
  }
} 